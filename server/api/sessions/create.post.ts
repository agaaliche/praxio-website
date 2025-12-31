/**
 * POST /api/sessions/create
 * Create a new session after successful login
 */
import { execute } from '../../utils/database'
import { randomBytes } from 'crypto'

export default defineEventHandler(async (event) => {
  try {
    const authHeader = getHeader(event, 'authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      throw createError({ statusCode: 401, message: 'Unauthorized' })
    }

    const token = authHeader.substring(7)
    const { getFirebaseAdmin } = await import('../../utils/firebase-admin')
    const admin = getFirebaseAdmin()
    const decodedToken = await admin.auth().verifyIdToken(token)
    const userId = decodedToken.uid

    // Parse device info from request
    const userAgent = getHeader(event, 'user-agent') || ''
    const forwarded = getHeader(event, 'x-forwarded-for')
    const ipAddress = forwarded ? forwarded.split(',')[0].trim() : event.node.req.socket?.remoteAddress || 'unknown'

    // Parse user agent to extract device info
    const deviceInfo = parseUserAgent(userAgent)

    // Generate unique session ID
    const sessionId = randomBytes(32).toString('hex')

    // Create session in database
    await execute(
      `INSERT INTO sessions 
       (sessionId, userId, deviceName, deviceType, browser, browserVersion, os, ipAddress, userAgent, loginTime, lastActiveTime)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        sessionId,
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

    // Set custom claim with session ID (so we can validate it)
    await admin.auth().setCustomUserClaims(userId, {
      sessionId
    })

    // Force token refresh on client
    await admin.auth().revokeRefreshTokens(userId)

    return {
      success: true,
      sessionId,
      message: 'Session created successfully'
    }
  } catch (error: any) {
    console.error('❌ Create session error:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      message: 'Failed to create session'
    })
  }
})

function parseUserAgent(userAgent: string) {
  // Simple user agent parsing - can be improved with a library like ua-parser-js
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
