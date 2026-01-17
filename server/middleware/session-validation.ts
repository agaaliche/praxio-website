/**
 * Server middleware to validate sessions on protected API routes
 * Updates lastActiveTime and checks if session is revoked
 * Auto-creates sessions for existing logged-in users
 */
import { defineEventHandler, getHeader } from 'h3'
import { queryOne, execute } from '../utils/database'
import { randomBytes } from 'crypto'

export default defineEventHandler(async (event) => {
  // Skip for non-API routes
  if (!event.path?.startsWith('/api/')) {
    return
  }

  // Skip for auth-related and session management endpoints
  if (event.path?.includes('/api/auth/') || event.path?.startsWith('/api/sessions/')) {
    return
  }

  const authHeader = getHeader(event, 'authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return // Let the endpoint handle unauthorized requests
  }

  try {
    const token = authHeader.substring(7)
    const { getFirebaseAdmin } = await import('../utils/firebase-admin')
    const admin = getFirebaseAdmin()
    const decodedToken = await admin.auth().verifyIdToken(token)

    // Skip session validation for impersonated users
    if (decodedToken.impersonating) {
      console.log(`⚠️ Skipping session validation for impersonated user: ${decodedToken.uid}`)
      return
    }

    const sessionId = decodedToken.sessionId as string | undefined
    const userId = decodedToken.uid
    const userRole = decodedToken.role as string | undefined

    if (!sessionId) {
      // No session ID in token - check if a recent session exists, otherwise create one

      // Check for existing recent session (created in last 10 seconds to avoid rapid recreation)
      const existingSession = await queryOne<any>(
        `SELECT sessionId FROM sessions 
         WHERE userId = ? 
         AND isRevoked = FALSE 
         AND loginTime > DATE_SUB(NOW(), INTERVAL 10 SECOND)
         ORDER BY loginTime DESC
         LIMIT 1`,
        [userId]
      )

      if (existingSession) {
        // Use existing recent session - DON'T update claims, just return
        // The client will get the sessionId on next token refresh
        console.log(`⚠️ User ${userId} (role: ${userRole}) missing sessionId in token, but session ${existingSession.sessionId} exists. Skipping claim update to avoid loop.`)
        return
      }

      // No recent session found - create a new one
      console.log(`Creating auto-session for existing user: ${userId}`)

      const userAgent = getHeader(event, 'user-agent') || ''
      const forwarded = getHeader(event, 'x-forwarded-for')
      const ipAddress = forwarded ? forwarded.split(',')[0].trim() : event.node.req.socket?.remoteAddress || 'unknown'

      const deviceInfo = parseUserAgent(userAgent)
      const newSessionId = randomBytes(32).toString('hex')

      try {
        await execute(
          `INSERT INTO sessions 
           (sessionId, userId, deviceName, deviceType, browser, browserVersion, os, ipAddress, userAgent, loginTime, lastActiveTime)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
          [
            newSessionId,
            userId,
            deviceInfo.deviceName,
            deviceInfo.deviceType,
            deviceInfo.browser,
            deviceInfo.browserVersion,
            deviceInfo.os,
            ipAddress,
            userAgent
          ]
        )

        // Set custom claim with session ID (preserve existing claims) - ONLY on first creation
        const userRecord = await admin.auth().getUser(userId)
        await admin.auth().setCustomUserClaims(userId, {
          ...userRecord.customClaims,
          sessionId: newSessionId
        })

        console.log(`✅ Auto-created session ${newSessionId} for user ${userId}`)
      } catch (err) {
        console.error('Failed to auto-create session:', err)
      }

      return
    }

    // Check if session is revoked
    const session = await queryOne<any>(
      `SELECT sessionId, isRevoked FROM sessions WHERE sessionId = ?`,
      [sessionId]
    )

    if (!session) {
      throw createError({
        statusCode: 401,
        message: 'Session not found'
      })
    }

    if (session.isRevoked) {
      throw createError({
        statusCode: 401,
        message: 'Session has been revoked. Please sign in again.'
      })
    }

    // Update last active time (async, don't wait)
    execute(
      `UPDATE sessions SET lastActiveTime = NOW() WHERE sessionId = ?`,
      [sessionId]
    ).catch(err => console.error('Failed to update session activity:', err))

  } catch (error: any) {
    if (error.statusCode === 401) {
      throw error
    }
    // Log but don't fail on session validation errors
    console.error('Session validation error:', error)
  }
})

function parseUserAgent(userAgent: string) {
  let browser = 'Unknown'
  let browserVersion = ''
  let os = 'Unknown'
  let deviceType = 'Desktop'
  let deviceName = 'Unknown Device'

  // Detect OS
  if (userAgent.includes('Windows NT 10.0')) os = 'Windows 10'
  else if (userAgent.includes('Windows NT')) os = 'Windows'
  else if (userAgent.includes('Mac OS X')) {
    os = 'macOS'
    const match = userAgent.match(/Mac OS X ([\d_]+)/)
    if (match) os = `macOS ${match[1].replace(/_/g, '.')}`
  }
  else if (userAgent.includes('Android')) {
    os = 'Android'
    deviceType = 'Mobile'
    const match = userAgent.match(/Android ([\d.]+)/)
    if (match) os = `Android ${match[1]}`
  }
  else if (userAgent.includes('iOS') || userAgent.includes('iPhone') || userAgent.includes('iPad')) {
    deviceType = userAgent.includes('iPad') ? 'Tablet' : 'Mobile'
    os = userAgent.includes('iPad') ? 'iPadOS' : 'iOS'
    const match = userAgent.match(/OS ([\d_]+)/)
    if (match) os = `${os} ${match[1].replace(/_/g, '.')}`
  }
  else if (userAgent.includes('Linux')) os = 'Linux'

  // Detect Browser
  if (userAgent.includes('Edg/')) {
    browser = 'Edge'
    const match = userAgent.match(/Edg\/([\d.]+)/)
    if (match) browserVersion = match[1]
  }
  else if (userAgent.includes('Chrome/')) {
    browser = 'Chrome'
    const match = userAgent.match(/Chrome\/([\d.]+)/)
    if (match) browserVersion = match[1]
  }
  else if (userAgent.includes('Firefox/')) {
    browser = 'Firefox'
    const match = userAgent.match(/Firefox\/([\d.]+)/)
    if (match) browserVersion = match[1]
  }
  else if (userAgent.includes('Safari/') && !userAgent.includes('Chrome')) {
    browser = 'Safari'
    const match = userAgent.match(/Version\/([\d.]+)/)
    if (match) browserVersion = match[1]
  }

  // Device name
  if (deviceType === 'Mobile' && userAgent.includes('iPhone')) {
    deviceName = 'iPhone'
  } else if (deviceType === 'Tablet' && userAgent.includes('iPad')) {
    deviceName = 'iPad'
  } else if (deviceType === 'Mobile' && userAgent.includes('Android')) {
    deviceName = 'Android Phone'
  } else {
    deviceName = `${browser} on ${os}`
  }

  return {
    browser,
    browserVersion,
    os,
    deviceType,
    deviceName
  }
}
