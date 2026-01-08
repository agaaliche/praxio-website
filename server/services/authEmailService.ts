/**
 * Authentication email service for signup verification and password reset
 * Uses Firebase Admin SDK to generate custom email action links
 * Sends via centralized email service (messaging templates)
 */
import { getFirebaseAdmin } from '../utils/firebase-admin'
import getEmailService from './emailService'

// Send email verification with custom branding
export const sendVerificationEmail = async (email: string, firstName: string = '', lastName: string = '', locale: string = 'en') => {
  const config = useRuntimeConfig()
  const siteUrl = config.siteUrl || config.public.siteUrl || 'http://localhost:3000'
  const admin = getFirebaseAdmin()
  
  try {
    // Generate custom email verification link
    const actionCodeSettings = {
      url: `${siteUrl}/signin`,
      handleCodeInApp: false
    }
    
    console.log(`🔗 Generating verification link for ${email}...`)
    const verificationLink = await admin.auth().generateEmailVerificationLink(email, actionCodeSettings)
    console.log(`✅ Verification link generated successfully`)
    
    // Replace Firebase's default action handler with our custom one
    const customLink = verificationLink.replace(
      /https:\/\/[^/]+\/__\/auth\/action/,
      `${siteUrl}/auth/action`
    )
    console.log(`🎨 Custom branded link: ${customLink}`)
    
    // Send via centralized email service with new messaging templates
    const emailService = getEmailService()
    const result = await emailService.send('verification', email, {
      name: firstName || 'there',
      verificationLink: customLink
    }, locale)
    
    console.log(`✅ Verification email sent to ${email} via centralized email service`)
    
    return {
      success: true,
      message: 'Verification email sent successfully',
      emailId: result.emailId
    }
  } catch (error: any) {
    console.error('❌ Error sending verification email:', error)
    return {
      success: false,
      message: error.message
    }
  }
}

// Send password reset email with custom branding
export const sendPasswordResetEmail = async (email: string, firstName: string = '', lastName: string = '', locale: string = 'en') => {
  const config = useRuntimeConfig()
  const siteUrl = config.siteUrl || config.public.siteUrl || 'http://localhost:3000'
  const admin = getFirebaseAdmin()
  
  try {
    // Generate custom password reset link
    const actionCodeSettings = {
      url: `${siteUrl}/signin`,
      handleCodeInApp: false
    }
    
    console.log(`🔗 Generating password reset link for ${email}...`)
    const resetLink = await admin.auth().generatePasswordResetLink(email, actionCodeSettings)
    
    // Replace Firebase's default action handler with our custom one
    const customLink = resetLink.replace(
      /https:\/\/[^/]+\/__\/auth\/action/,
      `${siteUrl}/auth/action`
    )
    console.log(`🎨 Custom branded reset link: ${customLink}`)
    
    // Send via centralized email service with new messaging templates
    const emailService = getEmailService()
    const result = await emailService.send('passwordReset', email, {
      name: firstName || 'there',
      resetLink: customLink
    }, locale)
    
    console.log(`✅ Password reset email sent to ${email} via centralized email service`)
    
    return {
      success: true,
      message: 'Password reset email sent successfully',
      emailId: result.emailId
    }
  } catch (error: any) {
    console.error('❌ Error sending password reset email:', error)
    return {
      success: false,
      message: error.message
    }
  }
}

// Send email change verification
export const sendEmailChangeVerification = async (
  newEmail: string,
  verificationLink: string,
  firstName: string = '',
  lastName: string = '',
  currentEmail: string = '',
  locale: string = 'en'
) => {
  try {
    console.log(`📧 Sending email change verification to ${newEmail}...`)
    
    // Send via centralized email service with new messaging templates
    const emailService = getEmailService()
    const result = await emailService.send('emailChange', newEmail, {
      firstName,
      lastName,
      confirmationLink: verificationLink, // Template expects confirmationLink
      currentEmail,
      newEmail
    }, locale)
    
    console.log(`✅ Email change verification sent to ${newEmail} via centralized email service`)
    
    return {
      success: true,
      message: 'Verification email sent to your new email address',
      emailId: result.emailId
    }
  } catch (error: any) {
    console.error('❌ Error sending email change verification:', error)
    return {
      success: false,
      message: error.message
    }
  }
}

// Send password changed confirmation
export const sendPasswordChangedConfirmation = async (
  email: string,
  firstName: string = '',
  locale: string = 'en'
) => {
  try {
    console.log(`📧 Sending password changed confirmation to ${email}...`)
    
    const config = useRuntimeConfig()
    const supportUrl = config.public.supportUrl || 'https://praxio.net/support'
    const changeDate = new Date().toLocaleString(locale === 'fr' ? 'fr-FR' : 'en-US', {
      dateStyle: 'full',
      timeStyle: 'short'
    })
    
    const emailService = getEmailService()
    const result = await emailService.send('passwordChanged', email, {
      firstName,
      changeDate,
      supportUrl
    }, locale)
    
    console.log(`✅ Password changed confirmation sent to ${email}`)
    
    return {
      success: true,
      message: 'Password changed confirmation sent',
      emailId: result.emailId
    }
  } catch (error: any) {
    console.error('❌ Error sending password changed confirmation:', error)
    return {
      success: false,
      message: error.message
    }
  }
}

// Send email changed confirmation (to old email)
export const sendEmailChangedConfirmation = async (
  oldEmail: string,
  newEmail: string,
  firstName: string = '',
  locale: string = 'en'
) => {
  try {
    console.log(`📧 Sending email changed confirmation to ${oldEmail}...`)
    
    const config = useRuntimeConfig()
    const supportUrl = config.public.supportUrl || 'https://praxio.net/support'
    const changeDate = new Date().toLocaleString(locale === 'fr' ? 'fr-FR' : 'en-US', {
      dateStyle: 'full',
      timeStyle: 'short'
    })
    
    const emailService = getEmailService()
    const result = await emailService.send('emailChanged', oldEmail, {
      firstName,
      oldEmail,
      newEmail,
      changeDate,
      supportUrl
    }, locale)
    
    console.log(`✅ Email changed confirmation sent to ${oldEmail}`)
    
    return {
      success: true,
      message: 'Email changed confirmation sent',
      emailId: result.emailId
    }
  } catch (error: any) {
    console.error('❌ Error sending email changed confirmation:', error)
    return {
      success: false,
      message: error.message
    }
  }
}
