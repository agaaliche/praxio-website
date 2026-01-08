/**
 * POST /api/sessions/revoke-all
 * Revoke all sessions except the current one
 */
import { defineEventHandler, createError, getHeader } from 'h3'
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
    const currentSessionId = decodedToken.sessionId as string | undefined

    if (!currentSessionId) {
      throw createError({ statusCode: 400, message: 'Current session ID not found' })
    }

    // Delete all sessions except current
    const result = await execute(
      `DELETE FROM sessions 
       WHERE userId = ? AND sessionId != ?`,
      [userId, currentSessionId]
    )

    return {
      success: true,
      message: 'All other sessions revoked successfully',
      revokedCount: result.affectedRows
    }
  } catch (error: any) {
    console.error('❌ Revoke all sessions error:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      message: 'Failed to revoke sessions'
    })
  }
})
