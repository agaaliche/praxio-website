/**
 * GET /api/sessions/list
 * Get all active sessions for the current user
 */
import { query, queryOne } from '../../utils/database'

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

    // Get current session ID from custom claim
    const currentSessionId = decodedToken.sessionId as string | undefined

    // Get all active sessions for user
    const sessions = await query<any>(
      `SELECT sessionId, deviceName, deviceType, browser, browserVersion, os, 
              ipAddress, loginTime, lastActiveTime, isRevoked
       FROM sessions 
       WHERE userId = ? AND isRevoked = FALSE
       ORDER BY lastActiveTime DESC`,
      [userId]
    )

    return {
      success: true,
      sessions: sessions.map(session => ({
        ...session,
        isCurrent: session.sessionId === currentSessionId
      }))
    }
  } catch (error: any) {
    console.error('❌ List sessions error:', error)
    
    if (error.statusCode === 401) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      message: 'Failed to list sessions'
    })
  }
})
