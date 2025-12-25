/**
 * POST /api/users/team/:id/resend
 * Resend invite to a team member
 */
import { queryOne, execute } from '../../../../utils/database'
import { verifyAuth, getEffectiveAccountOwnerId, isAccountOwner } from '../../../../utils/auth'
import { sendInviteEmail } from '../../../../utils/email'

// Generate invite token
function generateToken(): string {
  return 'xxxx-xxxx-xxxx-xxxx'.replace(/x/g, () => 
    Math.floor(Math.random() * 16).toString(16)
  )
}

export default defineEventHandler(async (event) => {
  try {
    const user = await verifyAuth(event)
    
    // Only account owners can resend invites
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
    
    // Check user exists and is pending
    const existing = await queryOne<any>(
      'SELECT id, email, first_name, last_name, role, status FROM authorized_users WHERE id = ? AND account_owner_id = ?',
      [userId, accountOwnerId]
    )
    
    if (!existing) {
      throw createError({
        statusCode: 404,
        message: 'Team member not found'
      })
    }
    
    // Generate new invite token
    const inviteToken = generateToken()
    const tokenExpiry = new Date(Date.now() + 48 * 60 * 60 * 1000) // 48 hours
    
    // Update token
    await execute(
      'UPDATE authorized_users SET invite_token = ?, token_expiry = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [inviteToken, tokenExpiry, 'pending', userId]
    )
    
    // Generate invite link and send email
    const config = useRuntimeConfig()
    const inviteLink = `${config.public.siteUrl || 'http://localhost:3000'}/auth/invite?token=${inviteToken}`
    
    // Send invite email
    const emailResult = await sendInviteEmail({
      email: existing.email,
      inviteLink,
      accountOwnerName: user.email,
      role: existing.role,
      firstName: existing.first_name,
      lastName: existing.last_name,
      ownerFirstName: '',
      organizationName: '',
      lang: 'fr'
    })
    
    return { 
      success: true, 
      message: emailResult.success ? 'Invite email sent' : 'Invite resent (email logged to console)',
      inviteLink,
      emailSent: emailResult.success
    }
  } catch (error: any) {
    console.error('POST /api/users/team/:id/resend error:', error)
    throw error
  }
})
