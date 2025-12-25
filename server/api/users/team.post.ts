/**
 * POST /api/users/team
 * Invite a new team member
 */
import { query, queryOne, execute } from '../../utils/database'
import { verifyAuth, getEffectiveAccountOwnerId, isAccountOwner } from '../../utils/auth'
import { sendInviteEmail } from '../../utils/email'

interface InviteUserBody {
  email: string
  firstName: string
  lastName: string
  role: 'viewer' | 'editor'
}

// Generate a random password
function generatePassword(length = 12): string {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*'
  let password = ''
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length))
  }
  return password
}

// Generate invite token (simple UUID-like)
function generateToken(): string {
  return 'xxxx-xxxx-xxxx-xxxx'.replace(/x/g, () => 
    Math.floor(Math.random() * 16).toString(16)
  )
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
    
    // Generate invite token and password
    const inviteToken = generateToken()
    const generatedPassword = generatePassword()
    const tokenExpiry = new Date(Date.now() + 48 * 60 * 60 * 1000) // 48 hours
    
    // Insert the new authorized user
    const result = await execute(
      `INSERT INTO authorized_users 
       (account_owner_id, email, first_name, last_name, generated_password, role, status, invite_token, token_expiry) 
       VALUES (?, ?, ?, ?, ?, ?, 'pending', ?, ?)`,
      [
        accountOwnerId,
        body.email.toLowerCase(),
        body.firstName,
        body.lastName,
        generatedPassword,
        body.role,
        inviteToken,
        tokenExpiry
      ]
    )
    
    // Generate invite link
    const config = useRuntimeConfig()
    const inviteLink = `${config.public.siteUrl || 'http://localhost:3000'}/auth/invite?token=${inviteToken}`
    
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
