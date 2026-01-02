/**
 * POST /api/users/team/:id/resend
 * Resend invite to a team member
 * Uses same magic link service as inrManager
 */
import { defineEventHandler, createError, getRouterParam } from 'h3'
import { queryOne, execute } from '../../../../utils/database'
import { verifyAuth, getEffectiveAccountOwnerId, isAccountOwner } from '../../../../utils/auth'
import { sendInviteEmail } from '../../../../utils/email'
import { generateMagicLinkToken, getTokenExpiryDate, generateInviteLink } from '../../../../utils/magicLinkService'

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
    
    // Generate new magic link token (same as inrManager)
    const inviteToken = generateMagicLinkToken(null, existing.email, accountOwnerId, existing.role)
    const expiresAt = getTokenExpiryDate()
    
    // Update token (using inrManager column name: invite_expires_at)
    await execute(
      'UPDATE authorized_users SET invite_token = ?, invite_expires_at = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [inviteToken, expiresAt, 'pending', userId]
    )
    
    // Generate invite link (uses /auth/magic-link like inrManager)
    const config = useRuntimeConfig()
    const inviteLink = generateInviteLink(inviteToken, config.public.siteUrl)
    
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
