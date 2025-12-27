/**
 * Test email endpoint - sends a test invite email
 * DELETE THIS FILE IN PRODUCTION
 */

import { sendInviteEmail } from '../../utils/email'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const email = (query.email as string) || 'antoine@praxio.net'

  if (!email) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Email is required',
    })
  }

  const siteUrl = process.env.SITE_URL || 'http://localhost:3000'
  const testToken = 'test-token-' + Date.now()
  const inviteLink = `${siteUrl}/auth/invite?token=${testToken}`

  try {
    const result = await sendInviteEmail({
      email: email,
      inviteLink,
      accountOwnerName: 'Praxio Admin',
      role: 'team_member',
      firstName: 'Test',
      lastName: 'User',
      organizationName: 'Praxio Test Clinic',
      ownerFirstName: 'Antoine',
      lang: 'en',
    })

    return {
      success: true,
      message: 'Test email queued successfully',
      emailId: result?.id || 'unknown',
      inviteLink,
      sentTo: email,
    }
  } catch (error: any) {
    console.error('Email test error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to send test email',
    })
  }
})
