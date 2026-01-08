/**
 * POST /api/auth/verify-email-change
 * Verify email change token and complete the email change
 * Copied from inrManager/backend/controllers/auth.controller.js
 */
import { defineEventHandler, createError, readBody } from 'h3'
import { getFirebaseAdmin } from '../../utils/firebase-admin'
import { execute } from '../../utils/database'
import { verifyEmailChangeToken, completeEmailChange } from '../../services/emailChangeService'
import { sendEmailChangedConfirmation } from '../../services/authEmailService'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody<{ token: string }>(event)
    
    if (!body.token) {
      throw createError({
        statusCode: 400,
        message: 'Verification token is required'
      })
    }
    
    // Verify the token
    const tokenData = await verifyEmailChangeToken(body.token)
    
    if (!tokenData) {
      throw createError({
        statusCode: 400,
        message: 'Invalid or expired verification link. Please request a new email change.'
      })
    }
    
    const admin = getFirebaseAdmin()
    const { userId, currentEmail, newEmail } = tokenData
    
    // Double-check the new email isn't taken (race condition protection)
    try {
      const existingUser = await admin.auth().getUserByEmail(newEmail)
      if (existingUser && existingUser.uid !== userId) {
        await completeEmailChange(body.token) // Clean up token
        throw createError({
          statusCode: 400,
          message: 'This email address is now already in use by another account. Please try a different email.'
        })
      }
    } catch (error: any) {
      // User not found is good - email is still available
      if (error.code !== 'auth/user-not-found') {
        if (error.statusCode) throw error
        throw error
      }
    }
    
    // Update the email in Firebase Auth
    await admin.auth().updateUser(userId, {
      email: newEmail,
      emailVerified: true // The new email is verified since they clicked the link
    })
    
    console.log(`✅ Firebase Auth email updated: ${currentEmail} -> ${newEmail}`)
    
    // Update the email in the database (users table)
    await execute(
      'UPDATE users SET userEmail = ?, updatedAt = NOW() WHERE userId = ?',
      [newEmail, userId]
    )
    
    console.log(`✅ Database email updated for user ${userId}`)
    
    // Also check and update authorized_users if this user is also an authorized user somewhere
    // Use the current (old) email to find the record since it hasn't been updated yet
    await execute(
      'UPDATE authorized_users SET email = ?, updated_at = NOW() WHERE email = ?',
      [newEmail, currentEmail]
    )
    
    // Complete the email change (delete token)
    await completeEmailChange(body.token)
    
    console.log(`✅ Email change completed: ${currentEmail} -> ${newEmail} for user ${userId}`)
    
    // Get user's name for confirmation email
    try {
      const userRecord = await admin.auth().getUser(userId)
      const displayName = userRecord.displayName || ''
      const firstName = displayName.split(' ')[0] || ''
      
      // Send confirmation email to OLD email address
      await sendEmailChangedConfirmation(currentEmail, newEmail, firstName)
    } catch (emailError: any) {
      console.error('⚠️ Failed to send email changed confirmation:', emailError)
      // Don't fail the request if email sending fails
    }
    
    return {
      success: true,
      message: 'Email address changed successfully',
      newEmail,
      previousEmail: currentEmail
    }
    
  } catch (error: any) {
    console.error('❌ Email change verification error:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      message: error.message || 'Failed to complete email change'
    })
  }
})
