/**
 * PUT /api/users/team/:id
 * Update a team member's role
 */
import { queryOne, execute } from '../../../utils/database'
import { verifyAuth, getEffectiveAccountOwnerId, isAccountOwner } from '../../../utils/auth'

interface UpdateUserBody {
  role?: 'viewer' | 'editor'
}

export default defineEventHandler(async (event) => {
  try {
    const user = await verifyAuth(event)
    
    // Only account owners can update team members
    if (!isAccountOwner(user)) {
      throw createError({
        statusCode: 403,
        message: 'Only account owners can manage team members'
      })
    }
    
    const accountOwnerId = getEffectiveAccountOwnerId(user)
    const userId = getRouterParam(event, 'id')
    const body = await readBody<UpdateUserBody>(event)
    
    if (!userId) {
      throw createError({
        statusCode: 400,
        message: 'User ID is required'
      })
    }
    
    // Validate role if provided
    if (body.role && !['viewer', 'editor'].includes(body.role)) {
      throw createError({
        statusCode: 400,
        message: 'Role must be viewer or editor'
      })
    }
    
    // Check user exists and belongs to this account
    const existing = await queryOne<any>(
      'SELECT id FROM authorized_users WHERE id = ? AND account_owner_id = ?',
      [userId, accountOwnerId]
    )
    
    if (!existing) {
      throw createError({
        statusCode: 404,
        message: 'Team member not found'
      })
    }
    
    // Update the user
    if (body.role) {
      await execute(
        'UPDATE authorized_users SET role = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [body.role, userId]
      )
    }
    
    // TODO: Update Firebase custom claims for the user
    // This requires the Firebase Admin SDK
    
    return { success: true, id: parseInt(userId), role: body.role }
  } catch (error: any) {
    console.error('PUT /api/users/team/:id error:', error)
    throw error
  }
})
