/**
 * POST /api/auth/request-email-change
 * Request email address change (sends verification to new email)
 * Copied from inrManager/backend/controllers/auth.controller.js
 */
import { defineEventHandler, createError, readBody } from 'h3'
import { getFirebaseAdmin } from '../../utils/firebase-admin'
import { verifyAuth } from '../../utils/auth'
import { createEmailChangeRequest, initTable } from '../../services/emailChangeService'
import { sendEmailChangeVerification } from '../../services/authEmailService'

export default defineEventHandler(async (event) => {
  try {
    // Verify the user is authenticated
    const user = await verifyAuth(event)
    
    const body = await readBody<{
      newEmail: string
      firstName?: string
      lastName?: string
    }>(event)
    
    const { newEmail, firstName, lastName } = body
    
    if (!newEmail) {
      throw createError({
        statusCode: 400,
        message: 'New email address is required'
      })
    }
    
    // Validate email format
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailPattern.test(newEmail)) {
      throw createError({
        statusCode: 400,
        message: 'Invalid email address format'
      })
    }
    
    // Check if new email is same as current
    if (newEmail.toLowerCase() === user.email?.toLowerCase()) {
      throw createError({
        statusCode: 400,
        message: 'New email must be different from current email'
      })
    }
    
    const admin = getFirebaseAdmin()
    
    // Check if new email is already in use by another user
    try {
      const existingUser = await admin.auth().getUserByEmail(newEmail)
      if (existingUser && existingUser.uid !== user.uid) {
        throw createError({
          statusCode: 400,
          message: 'This email address is already in use by another account'
        })
      }
    } catch (error: any) {
      // User not found is good - email is available
      if (error.code !== 'auth/user-not-found') {
        if (error.statusCode) throw error
        throw error
      }
    }
    
    // Ensure table exists
    await initTable()
    
    // Create email change request token
    const { token, expiresAt } = await createEmailChangeRequest(
      user.uid, 
      user.email || '', 
      newEmail
    )
    
    // Generate verification link
    const config = useRuntimeConfig()
    const siteUrl = config.siteUrl || config.public.siteUrl || 'http://localhost:3000'
    const verificationLink = `${siteUrl}/auth/action?mode=changeEmail&token=${token}`
    
    console.log(`📧 Email change verification link: ${verificationLink}`)
    
    // Send verification email to the NEW email address
    const emailResult = await sendEmailChangeVerification(
      newEmail,
      verificationLink,
      firstName || '',
      lastName || '',
      user.email || ''
    )
    
    if (!emailResult.success) {
      throw createError({
        statusCode: 500,
        message: 'Failed to send verification email: ' + emailResult.message
      })
    }
    
    console.log(`✅ Email change verification sent to ${newEmail} for user ${user.uid}`)
    
    // In development, also return the link for testing
    const isDevelopment = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV
    
    return {
      success: true,
      message: 'Verification email sent to the new address. Please check your inbox and click the link to confirm.',
      expiresAt,
      // Include link in development for testing
      ...(isDevelopment && { verificationLink, note: 'Link included for development testing only' })
    }
    
  } catch (error: any) {
    console.error('❌ Email change request error:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      message: error.message || 'Failed to initiate email change'
    })
  }
})
