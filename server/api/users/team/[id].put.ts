/**
 * PUT /api/users/team/:id
 * Update a team member's role
 */
import { defineEventHandler, readBody, createError, getRouterParam } from 'h3'
import { queryOne, execute } from '../../../utils/database'
import { verifyAuth, getEffectiveAccountOwnerId, isAccountOwner } from '../../../utils/auth'
import { getFirebaseAdmin } from '../../../utils/firebase-admin'

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
      'SELECT id, email, first_name, last_name FROM authorized_users WHERE id = ? AND account_owner_id = ?',
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
      
      // Update Firebase custom claims
      const firebaseUid = `user_${userId}_${accountOwnerId}`
      const admin = getFirebaseAdmin()
      const auth = admin.auth()
      
      try {
        // Get existing claims
        const userRecord = await auth.getUser(firebaseUid)
        const currentClaims = userRecord.customClaims || {}
        
        // Update role claim
        await auth.setCustomUserClaims(firebaseUid, {
          ...currentClaims,
          role: body.role
        })
        
        console.log(`✅ Updated Firebase custom claims for ${firebaseUid}: role=${body.role}`)
      } catch (firebaseError: any) {
        console.error(`⚠️ Failed to update Firebase claims for ${firebaseUid}:`, firebaseError)
        // Don't fail the whole request if Firebase update fails
      }
    }
    
    return { success: true, id: parseInt(userId), role: body.role }
  } catch (error: any) {
    console.error('PUT /api/users/team/:id error:', error)
    throw error
  }
})
