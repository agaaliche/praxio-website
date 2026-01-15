/**
 * POST /api/admin/users/send-password-reset
 * Send password reset email (siteadmin only)
 */
import { defineEventHandler, readBody, createError } from 'h3'
import { getAuth } from 'firebase-admin/auth'
import { verifySiteAdmin } from '../../../utils/auth'
import { getFirebaseApp } from '../../../utils/firebase'
import { sendPasswordResetEmail } from '../../../services/authEmailService'

export default defineEventHandler(async (event) => {
  // Verify siteadmin access
  await verifySiteAdmin(event)
  
  const body = await readBody(event)
  const { email, locale = 'en' } = body
  
  if (!email) {
    throw createError({
      statusCode: 400,
      message: 'Email is required'
    })
  }
  
  try {
    // Get user info to personalize email
    const app = getFirebaseApp()
    const auth = getAuth(app)
    
    let firstName = ''
    let lastName = ''
    try {
      const userRecord = await auth.getUserByEmail(email)
      if (userRecord.displayName) {
        const parts = userRecord.displayName.split(' ')
        firstName = parts[0] || ''
        lastName = parts.slice(1).join(' ') || ''
      }
    } catch (e) {
      // User might not exist, continue anyway
    }
    
    // Send password reset using existing email service
    const result = await sendPasswordResetEmail(email, firstName, lastName, locale)
    
    if (!result.success) {
      throw createError({
        statusCode: 500,
        message: result.message || 'Failed to send password reset email'
      })
    }
    
    console.log(`✅ Admin sent password reset for: ${email}`)
    
    return { 
      success: true, 
      message: 'Password reset email sent' 
    }
  } catch (error: any) {
    console.error('❌ Error sending password reset:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to send password reset'
    })
  }
})
