/**
 * POST /api/auth/signup
 * Handle user signup - create Firebase user and send verification email
 * Copied from inrManager/backend/controllers/auth.controller.js - signup
 */
import { getFirebaseAdmin } from '../../utils/firebase-admin'
import { sendVerificationEmail } from '../../services/authEmailService'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody<{
      email: string
      password: string
      firstName?: string
      lastName?: string
    }>(event)
    
    const { email, password, firstName, lastName } = body
    
    // Validation
    if (!email || !password) {
      throw createError({
        statusCode: 400,
        message: 'Email and password are required'
      })
    }
    
    if (password.length < 6) {
      throw createError({
        statusCode: 400,
        message: 'Password must be at least 6 characters'
      })
    }
    
    const admin = getFirebaseAdmin()
    
    // Check if user already exists
    try {
      await admin.auth().getUserByEmail(email)
      throw createError({
        statusCode: 400,
        message: 'An account with this email already exists'
      })
    } catch (error: any) {
      // User doesn't exist, continue with signup
      if (error.code !== 'auth/user-not-found' && error.statusCode !== 400) {
        throw error
      }
      // If it's our 400 error about existing account, rethrow
      if (error.statusCode === 400) {
        throw error
      }
    }
    
    // Create Firebase user
    const userRecord = await admin.auth().createUser({
      email,
      password,
      emailVerified: false,
      displayName: firstName && lastName ? `${firstName} ${lastName}` : firstName || '',
    })
    
    // Set custom claims for account owner (no role claim = superuser)
    await admin.auth().setCustomUserClaims(userRecord.uid, {
      userId: userRecord.uid,
      // No role claim = account owner (superuser)
    })
    
    console.log(`✅ Created Firebase user: ${email} (${userRecord.uid})`)
    
    // Send verification email with custom branding
    const emailResult = await sendVerificationEmail(email, firstName || '', lastName || '')
    
    return {
      success: true,
      message: 'Account created successfully. Please check your email to verify your account.',
      emailSent: emailResult.success,
      userId: userRecord.uid
    }
    
  } catch (error: any) {
    console.error('❌ Signup error:', error)
    
    // Handle specific Firebase errors
    if (error.code === 'auth/email-already-exists') {
      throw createError({
        statusCode: 400,
        message: 'An account with this email already exists'
      })
    }
    
    if (error.code === 'auth/invalid-email') {
      throw createError({
        statusCode: 400,
        message: 'Invalid email address'
      })
    }
    
    if (error.code === 'auth/weak-password') {
      throw createError({
        statusCode: 400,
        message: 'Password is too weak. Please use a stronger password.'
      })
    }
    
    // Re-throw if it's already an H3 error
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      message: 'Error creating account. Please try again.'
    })
  }
})
