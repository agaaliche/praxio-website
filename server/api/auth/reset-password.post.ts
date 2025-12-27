/**
 * POST /api/auth/reset-password
 * Request password reset email
 * Copied from inrManager/backend/controllers/auth.controller.js - requestPasswordReset
 */
import { getFirebaseAdmin } from '../../utils/firebase-admin'
import { sendPasswordResetEmail } from '../../services/authEmailService'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody<{ email: string }>(event)
    const { email } = body
    
    if (!email) {
      throw createError({
        statusCode: 400,
        message: 'Email is required'
      })
    }
    
    const admin = getFirebaseAdmin()
    
    // Get user info for personalization
    let firstName = ''
    let lastName = ''
    
    try {
      const userRecord = await admin.auth().getUserByEmail(email)
      const displayName = userRecord.displayName || ''
      const nameParts = displayName.split(' ')
      firstName = nameParts[0] || ''
      lastName = nameParts.slice(1).join(' ') || ''
    } catch (error: any) {
      // User doesn't exist, but don't reveal this for security
      // Still send success response to prevent email enumeration
      console.log(`Password reset requested for non-existent email: ${email}`)
      return {
        success: true,
        message: 'If an account exists with this email, a password reset link has been sent.'
      }
    }
    
    // Send password reset email with custom branding
    const emailResult = await sendPasswordResetEmail(email, firstName, lastName)
    
    return {
      success: true,
      message: 'Password reset email sent successfully. Please check your inbox.',
      emailSent: emailResult.success
    }
    
  } catch (error: any) {
    console.error('❌ Password reset error:', error)
    
    // Re-throw if it's already an H3 error
    if (error.statusCode) {
      throw error
    }
    
    // Don't reveal whether user exists
    return {
      success: true,
      message: 'If an account exists with this email, a password reset link has been sent.'
    }
  }
})
