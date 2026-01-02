/**
 * GET /api/users/team
 * Get all team members for the account
 */
import { defineEventHandler, createError } from 'h3'
import { query } from '../../utils/database'
import { verifyAuth, getEffectiveAccountOwnerId } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  try {
    const user = await verifyAuth(event)
    const accountOwnerId = getEffectiveAccountOwnerId(user)
    
    // Query team members - handle case where table might not have all columns
    let teamMembers: any[] = []
    try {
      teamMembers = await query<any>(
        `SELECT id, email, first_name, last_name, role, status, last_access, created_at, updated_at, invite_token
         FROM authorized_users 
         WHERE account_owner_id = ?
         ORDER BY created_at DESC`,
        [accountOwnerId]
      )
    } catch (dbError: any) {
      console.error('Database query error:', dbError.message)
      // Table might not exist yet - return empty array
      return []
    }
    
    const baseUrl = useRuntimeConfig().public.siteUrl || 'http://localhost:3000'
    
    return teamMembers.map(member => ({
      id: member.id,
      email: member.email,
      firstName: member.first_name,
      lastName: member.last_name,
      role: member.role,
      status: member.status,
      lastAccess: member.last_access,
      createdAt: member.created_at,
      updatedAt: member.updated_at,
      inviteLink: member.invite_token ? `${baseUrl}/auth/invite?token=${member.invite_token}` : null
    }))
  } catch (error: any) {
    console.error('GET /api/users/team error:', error.message || error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to load team members'
    })
  }
})
