/**
 * DELETE /api/users/team/:id
 * Remove a team member
 */
import { queryOne, execute } from '../../../utils/database'
import { verifyAuth, getEffectiveAccountOwnerId, isAccountOwner } from '../../../utils/auth'

export default defineEventHandler(async (event) => {
  try {
    const user = await verifyAuth(event)
    
    // Only account owners can remove team members
    if (!isAccountOwner(user)) {
      throw createError({
        statusCode: 403,
        message: 'Only account owners can manage team members'
      })
    }
    
    const accountOwnerId = getEffectiveAccountOwnerId(user)
    const userId = getRouterParam(event, 'id')
    
    if (!userId) {
      throw createError({
        statusCode: 400,
        message: 'User ID is required'
      })
    }
    
    // Check user exists and belongs to this account
    const existing = await queryOne<any>(
      'SELECT id, email FROM authorized_users WHERE id = ? AND account_owner_id = ?',
      [userId, accountOwnerId]
    )
    
    if (!existing) {
      throw createError({
        statusCode: 404,
        message: 'Team member not found'
      })
    }
    
    // Delete from authorized_users
    await execute(
      'DELETE FROM authorized_users WHERE id = ? AND account_owner_id = ?',
      [userId, accountOwnerId]
    )
    
    // TODO: Delete from Firebase Auth
    // This requires the Firebase Admin SDK
    
    return { success: true, message: 'Team member removed' }
  } catch (error: any) {
    console.error('DELETE /api/users/team/:id error:', error)
    throw error
  }
})
