/**
 * PUT /api/users/profile
 * Update current user's profile (first name, last name, phone)
 */
import { execute, queryOne } from '../../utils/database'
import { verifyAuth, getEffectiveAccountOwnerId } from '../../utils/auth'

interface ProfileUpdateBody {
  firstName?: string
  lastName?: string
  phoneNumber?: string
}

export default defineEventHandler(async (event) => {
  try {
    const user = await verifyAuth(event)
    const body = await readBody<ProfileUpdateBody>(event)
    
    // Check if user is an invited user (has role)
    if (user.role) {
      // Invited users can only update their own record in authorized_users
      if (user.role === 'viewer') {
        throw createError({
          statusCode: 403,
          message: 'Viewers cannot modify their profile'
        })
      }
      
      const accountOwnerId = getEffectiveAccountOwnerId(user)
      
      await execute(
        `UPDATE authorized_users 
         SET first_name = ?, last_name = ?, updated_at = NOW()
         WHERE account_owner_id = ? AND email = ?`,
        [
          body.firstName || null,
          body.lastName || null,
          accountOwnerId,
          user.email
        ]
      )
    } else {
      // Account owner - update users table
      await execute(
        `UPDATE users 
         SET userName = ?, userLastName = ?, phoneNumber = ?, updatedAt = NOW()
         WHERE userId = ?`,
        [
          body.firstName || null,
          body.lastName || null,
          body.phoneNumber || null,
          user.uid
        ]
      )
    }
    
    return { success: true, message: 'Profile updated successfully' }
  } catch (error: any) {
    console.error('❌ Profile update error:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      message: error.message || 'Failed to update profile'
    })
  }
})
