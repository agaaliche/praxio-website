/**
 * POST /api/sessions/delete-current
 * Delete the current session (called on logout or window close)
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
      // No session to delete
      return { success: true, message: 'No active session' }
    }

    // Delete the current session
    await execute(
      `DELETE FROM sessions WHERE sessionId = ? AND userId = ?`,
      [currentSessionId, userId]
    )

    return {
      success: true,
      message: 'Session deleted successfully'
    }
  } catch (error: any) {
    console.error('❌ Delete current session error:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      message: 'Failed to delete session'
    })
  }
})
