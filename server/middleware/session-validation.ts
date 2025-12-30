/**
 * Server middleware to validate sessions on protected API routes
 * Updates lastActiveTime and checks if session is revoked
 */
import { queryOne, execute } from '../utils/database'

export default defineEventHandler(async (event) => {
  // Skip for non-API routes
  if (!event.path?.startsWith('/api/')) {
    return
  }

  // Skip for auth-related endpoints
  if (event.path?.includes('/api/auth/') || event.path?.includes('/api/sessions/create')) {
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
    
    const sessionId = decodedToken.sessionId as string | undefined

    if (!sessionId) {
      // No session ID in token - probably an old token before session management
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
