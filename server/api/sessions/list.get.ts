/**
 * GET /api/sessions/list
 * Get all active sessions for the current user (paginated, max 10 sessions)
 */
import { defineEventHandler, createError, getHeader, getQuery } from 'h3'
import { query, queryOne } from '../../utils/database'

const MAX_SESSIONS = 10

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

    // Get pagination parameters
    const queryParams = getQuery(event)
    const page = Math.max(1, parseInt(queryParams.page as string) || 1)
    const limit = Math.min(MAX_SESSIONS, parseInt(queryParams.limit as string) || MAX_SESSIONS)
    const offset = (page - 1) * limit

    // Get total count
    const countResult = await queryOne<{ total: number }>(
      `SELECT COUNT(*) as total FROM sessions WHERE userId = ? AND isRevoked = FALSE`,
      [userId]
    )
    const total = countResult?.total || 0

    // Get paginated active sessions for user
    const sessions = await query<any>(
      `SELECT sessionId, deviceName, deviceType, browser, browserVersion, os, 
              ipAddress, loginTime, lastActiveTime, isRevoked
       FROM sessions 
       WHERE userId = ? AND isRevoked = FALSE
       ORDER BY lastActiveTime DESC
       LIMIT ? OFFSET ?`,
      [userId, limit, offset]
    )

    return {
      success: true,
      sessions: sessions.map(session => ({
        ...session,
        isCurrent: session.sessionId === currentSessionId
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
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
