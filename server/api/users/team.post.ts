/**
 * POST /api/users/team
 * Invite a new team member
 * Copied from inrManager/backend/controllers/userManagement.controller.js - inviteUser
 */
import { defineEventHandler, readBody, createError } from 'h3'
import { query, queryOne, execute } from '../../utils/database'
import { verifyAuth, getEffectiveAccountOwnerId, isAccountOwner } from '../../utils/auth'
import { sendInviteEmail } from '../../utils/email'
import { generateMagicLinkToken, getTokenExpiryDate, generateInviteLink } from '../../utils/magicLinkService'
import crypto from 'crypto'

interface InviteUserBody {
  email: string
  firstName: string
  lastName: string
  role: 'viewer' | 'editor'
}

// Generate secure random password (same as inrManager)
function generatePassword(): string {
  const length = 12
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*'
  let password = ''
  const values = crypto.randomBytes(length)
  for (let i = 0; i < length; i++) {
    password += charset[values[i] % charset.length]
  }
  return password
}

export default defineEventHandler(async (event) => {
  try {
    const user = await verifyAuth(event)
    
    // Only account owners can invite team members
    if (!isAccountOwner(user)) {
      throw createError({
        statusCode: 403,
        message: 'Only account owners can invite team members'
      })
    }
    
    const accountOwnerId = getEffectiveAccountOwnerId(user)
    const body = await readBody<InviteUserBody>(event)
    
    // Validate required fields
    if (!body.email || !body.firstName || !body.lastName || !body.role) {
      throw createError({
        statusCode: 400,
        message: 'Missing required fields: email, firstName, lastName, role'
      })
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(body.email)) {
      throw createError({
        statusCode: 400,
        message: 'Invalid email format'
      })
    }
    
    // Validate role
    if (!['viewer', 'editor'].includes(body.role)) {
      throw createError({
        statusCode: 400,
        message: 'Role must be viewer or editor'
      })
    }
    
    // Check if user already exists for this account
    const existing = await queryOne<any>(
      'SELECT id FROM authorized_users WHERE account_owner_id = ? AND email = ?',
      [accountOwnerId, body.email.toLowerCase()]
    )
    
    if (existing) {
      throw createError({
        statusCode: 409,
        message: 'User with this email already exists in your team'
      })
    }
    
    // Generate magic link token and password (same as inrManager)
    const inviteToken = generateMagicLinkToken(null, body.email.toLowerCase(), accountOwnerId, body.role)
    const expiresAt = getTokenExpiryDate()
    const generatedPassword = generatePassword()
    
    // Generate invite link (uses /auth/magic-link like inrManager)
    const config = useRuntimeConfig()
    const inviteLink = generateInviteLink(inviteToken, config.public.siteUrl)
    
    // Insert the new authorized user (using inrManager column names: password, invite_expires_at)
    const result = await execute(
      `INSERT INTO authorized_users 
       (account_owner_id, email, first_name, last_name, password, role, status, invite_token, invite_expires_at) 
       VALUES (?, ?, ?, ?, ?, ?, 'pending', ?, ?)`,
      [
        accountOwnerId,
        body.email.toLowerCase(),
        body.firstName,
        body.lastName,
        generatedPassword,
        body.role,
        inviteToken,
        expiresAt
      ]
    )
    
    // Send invite email
    const emailResult = await sendInviteEmail({
      email: body.email.toLowerCase(),
      inviteLink,
      accountOwnerName: user.email,
      role: body.role,
      firstName: body.firstName,
      lastName: body.lastName,
      ownerFirstName: '',
      organizationName: '',
      lang: 'fr'
    })
    
    setResponseStatus(event, 201)
    return {
      success: true,
      id: result.insertId,
      email: body.email,
      firstName: body.firstName,
      lastName: body.lastName,
      role: body.role,
      status: 'pending',
      inviteLink,
      emailSent: emailResult.success,
      emailMessage: emailResult.message
    }
  } catch (error: any) {
    console.error('POST /api/users/team error:', error)
    throw error
  }
})
