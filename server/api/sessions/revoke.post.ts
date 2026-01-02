/**
 * POST /api/sessions/revoke
 * Revoke a specific session
 */
import { defineEventHandler, createError, getHeader, readBody } from 'h3'
import { execute } from '../../utils/database'

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

    const body = await readBody<{ sessionId: string }>(event)
    const { sessionId } = body

    if (!sessionId) {
      throw createError({ statusCode: 400, message: 'Session ID is required' })
    }

    // Revoke the session
    const result = await execute(
      `UPDATE sessions 
       SET isRevoked = TRUE, revokedAt = NOW() 
       WHERE sessionId = ? AND userId = ?`,
      [sessionId, userId]
    )

    if (result.affectedRows === 0) {
      throw createError({ statusCode: 404, message: 'Session not found' })
    }

    return {
      success: true,
      message: 'Session revoked successfully'
    }
  } catch (error: any) {
    console.error('❌ Revoke session error:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      message: 'Failed to revoke session'
    })
  }
})
