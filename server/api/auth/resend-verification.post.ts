/**
 * POST /api/auth/resend-verification
 * Resend verification email
 * Copied from inrManager/backend/controllers/auth.controller.js - resendVerification
 */
import { getFirebaseAdmin } from '../../utils/firebase-admin'
import { sendVerificationEmail } from '../../services/authEmailService'

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
    
    // Get user info
    const userRecord = await admin.auth().getUserByEmail(email)
    
    if (userRecord.emailVerified) {
      throw createError({
        statusCode: 400,
        message: 'This email is already verified'
      })
    }
    
    // Extract name from displayName
    const displayName = userRecord.displayName || ''
    const nameParts = displayName.split(' ')
    const firstName = nameParts[0] || ''
    const lastName = nameParts.slice(1).join(' ') || ''
    
    // Resend verification email
    const emailResult = await sendVerificationEmail(email, firstName, lastName)
    
    return {
      success: true,
      message: 'Verification email sent successfully. Please check your inbox.',
      emailSent: emailResult.success
    }
    
  } catch (error: any) {
    console.error('❌ Resend verification error:', error)
    
    if (error.code === 'auth/user-not-found') {
      throw createError({
        statusCode: 404,
        message: 'No account found with this email address'
      })
    }
    
    // Re-throw if it's already an H3 error
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      message: 'Error sending verification email. Please try again.'
    })
  }
})
