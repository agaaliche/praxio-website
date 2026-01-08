/**
 * POST /api/auth/send-password-changed
 * Send password changed confirmation email
 */
import { defineEventHandler, createError } from 'h3'
import { verifyAuth } from '../../utils/auth'
import { sendPasswordChangedConfirmation } from '../../services/authEmailService'

export default defineEventHandler(async (event) => {
  try {
    // Verify the user is authenticated
    const user = await verifyAuth(event)
    
    if (!user.email) {
      throw createError({
        statusCode: 400,
        message: 'User email not found'
      })
    }
    
    // Get user's name
    const displayName = user.displayName || ''
    const firstName = displayName.split(' ')[0] || ''
    
    // Send confirmation email
    const result = await sendPasswordChangedConfirmation(user.email, firstName)
    
    return {
      success: result.success,
      message: result.message
    }
    
  } catch (error: any) {
    console.error('❌ Send password changed confirmation error:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      message: 'Failed to send confirmation email'
    })
  }
})
