/**
 * Authentication email service for signup verification and password reset
 * Uses Firebase Admin SDK to generate custom email action links
 * Sends via Firebase Extension (Firestore mail collection)
 * Copied from inrManager/backend/services/authEmailService.js
 */
import { getFirebaseAdmin } from '../utils/firebase-admin'

// Send email verification with custom branding
export const sendVerificationEmail = async (email: string, firstName: string = '', lastName: string = '') => {
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
    
    const displayName = firstName || 'there'
    const subject = 'Welcome to Praxio - Verify your email'
    const textContent = `Hi ${displayName}, welcome to Praxio! Please verify your email address by clicking this link: ${customLink}`
    
    // Send custom branded email via Firebase Extension
    if (config.useFirebaseEmail === 'true') {
      const db = admin.firestore()
      
      console.log(`📧 Queuing verification email to Firestore for ${email}...`)
      const docRef = await db.collection('mail').add({
        to: email,
        message: {
          subject: subject,
          html: getVerificationEmailTemplate(customLink, firstName, lastName),
          text: textContent,
          trackingSettings: {
            clickTracking: {
              enable: false
            }
          }
        }
      })
      
      console.log(`✅ Verification email queued for ${email} via Firebase Extension (doc ID: ${docRef.id})`)
      
      return {
        success: true,
        message: 'Verification email sent successfully'
      }
    }
    
    // Development mode - log link to console
    console.log('\n' + '='.repeat(80))
    console.log('📧 VERIFICATION EMAIL (Development Mode)')
    console.log('='.repeat(80))
    console.log(`To: ${email}`)
    console.log(`Subject: ${subject}`)
    console.log(`\n🔗 Verification Link:\n${customLink}`)
    console.log('='.repeat(80) + '\n')
    
    return {
      success: true,
      message: 'Verification link logged to console (development mode)',
      verificationLink: customLink
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
export const sendPasswordResetEmail = async (email: string, firstName: string = '', lastName: string = '') => {
  const config = useRuntimeConfig()
  const siteUrl = config.siteUrl || config.public.siteUrl || 'http://localhost:3000'
  const admin = getFirebaseAdmin()
  
  try {
    // Generate custom password reset link
    const actionCodeSettings = {
      url: `${siteUrl}/signin`,
      handleCodeInApp: false
    }
    
    const resetLink = await admin.auth().generatePasswordResetLink(email, actionCodeSettings)
    
    // Replace Firebase's default action handler with our custom one
    const customLink = resetLink.replace(
      /https:\/\/[^/]+\/__\/auth\/action/,
      `${siteUrl}/auth/action`
    )
    
    const displayName = firstName || 'there'
    const subject = 'Reset your Praxio password'
    const textContent = `Hi ${displayName}, we received a request to reset your Praxio password. Click this link to reset it: ${customLink}`
    
    // Send custom branded email via Firebase Extension
    if (config.useFirebaseEmail === 'true') {
      const db = admin.firestore()
      
      console.log(`📧 Queuing password reset email for ${email}...`)
      const docRef = await db.collection('mail').add({
        to: email,
        message: {
          subject: subject,
          html: getPasswordResetEmailTemplate(customLink, firstName, lastName),
          text: textContent
        }
      })
      
      console.log(`✅ Password reset email queued for ${email} via Firebase Extension (doc ID: ${docRef.id})`)
      
      return {
        success: true,
        message: 'Password reset email sent successfully'
      }
    }
    
    // Development mode
    console.log('\n' + '='.repeat(80))
    console.log('📧 PASSWORD RESET EMAIL (Development Mode)')
    console.log('='.repeat(80))
    console.log(`To: ${email}`)
    console.log(`Subject: ${subject}`)
    console.log(`\n🔗 Reset Link:\n${customLink}`)
    console.log('='.repeat(80) + '\n')
    
    return {
      success: true,
      message: 'Reset link logged to console (development mode)',
      resetLink: customLink
    }
  } catch (error: any) {
    console.error('❌ Error sending password reset email:', error)
    return {
      success: false,
      message: error.message
    }
  }
}

// Custom branded email verification template
const getVerificationEmailTemplate = (verificationLink: string, firstName: string = '', lastName: string = '') => {
  const displayName = firstName ? `${firstName}` : 'there'
  const currentYear = new Date().getFullYear()
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verify Your Email</title>
    </head>
    <body style="margin: 0; padding: 0; background: linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%); min-height: 100vh; font-family: Arial, sans-serif;">
      <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <div style="background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <div style="background: linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">Praxio</h1>
          </div>
          <div style="background: white; padding: 30px; color: #333; line-height: 1.6;">
            <p style="font-size: 16px; margin-top: 0;">Hi ${displayName},</p>
            <p style="font-size: 16px;">Welcome to Praxio! To complete your registration and start using our platform, please verify your email address by clicking the button below.</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationLink}" 
                 style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                Verify My Email
              </a>
            </div>
            
            <p style="font-size: 14px; color: #666;">This link will expire in 24 hours.</p>
            <p style="font-size: 14px; color: #666;">If you didn't create an account with Praxio, you can safely ignore this email.</p>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
            
            <p style="font-size: 12px; color: #999; text-align: center;">
              If the button doesn't work, copy and paste this link into your browser:<br/>
              <a href="${verificationLink}" style="color: #0ea5e9; word-break: break-all;">${verificationLink}</a>
            </p>
          </div>
          <div style="background: #f9fafb; padding: 20px; text-align: center;">
            <p style="margin: 0; font-size: 12px; color: #666;">© ${currentYear} Praxio. All rights reserved.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `
}

// Custom branded password reset email template
const getPasswordResetEmailTemplate = (resetLink: string, firstName: string = '', lastName: string = '') => {
  const displayName = firstName ? `${firstName}` : 'there'
  const currentYear = new Date().getFullYear()
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reset Your Password</title>
    </head>
    <body style="margin: 0; padding: 0; background: linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%); min-height: 100vh; font-family: Arial, sans-serif;">
      <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <div style="background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <div style="background: linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">Praxio</h1>
          </div>
          <div style="background: white; padding: 30px; color: #333; line-height: 1.6;">
            <p style="font-size: 16px; margin-top: 0;">Hi ${displayName},</p>
            <p style="font-size: 16px;">We received a request to reset your Praxio password. Click the button below to create a new password.</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetLink}" 
                 style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                Reset My Password
              </a>
            </div>
            
            <p style="font-size: 14px; color: #666;">This link will expire in 1 hour for security reasons.</p>
            <p style="font-size: 14px; color: #666;">If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
            
            <p style="font-size: 12px; color: #999; text-align: center;">
              If the button doesn't work, copy and paste this link into your browser:<br/>
              <a href="${resetLink}" style="color: #0ea5e9; word-break: break-all;">${resetLink}</a>
            </p>
          </div>
          <div style="background: #f9fafb; padding: 20px; text-align: center;">
            <p style="margin: 0; font-size: 12px; color: #666;">© ${currentYear} Praxio. All rights reserved.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `
}

// Send email change verification email (matching INRManager pattern)
export const sendEmailChangeVerification = async (
  newEmail: string, 
  verificationLink: string, 
  firstName: string = '', 
  lastName: string = '', 
  currentEmail: string = ''
) => {
  const config = useRuntimeConfig()
  const admin = getFirebaseAdmin()
  
  try {
    const displayName = firstName ? `${firstName}` : 'there'
    const subject = 'Confirm your new email address - Praxio'
    const textContent = `Hi ${displayName}, you requested to change your email address to ${newEmail}. Please confirm by clicking this link: ${verificationLink}`
    
    // Send custom branded email via Firebase Extension
    if (config.useFirebaseEmail === 'true') {
      const db = admin.firestore()
      
      console.log(`📧 Queuing email change verification for ${newEmail}...`)
      const docRef = await db.collection('mail').add({
        to: newEmail,
        message: {
          subject: subject,
          html: getEmailChangeTemplate(verificationLink, firstName, lastName, currentEmail, newEmail),
          text: textContent
        }
      })
      
      console.log(`✅ Email change verification queued for ${newEmail} via Firebase Extension (doc ID: ${docRef.id})`)
      
      return {
        success: true,
        message: 'Verification email sent to your new email address'
      }
    }
    
    // Development mode
    console.log('\n' + '='.repeat(80))
    console.log('📧 EMAIL CHANGE VERIFICATION (Development Mode)')
    console.log('='.repeat(80))
    console.log(`To: ${newEmail}`)
    console.log(`Subject: ${subject}`)
    console.log(`\n🔗 Verification Link:\n${verificationLink}`)
    console.log('='.repeat(80) + '\n')
    
    return {
      success: true,
      message: 'Verification link logged to console (development mode)',
      verificationLink
    }
  } catch (error: any) {
    console.error('❌ Error sending email change verification:', error)
    return {
      success: false,
      message: error.message
    }
  }
}

// Email change verification template
const getEmailChangeTemplate = (
  verificationLink: string, 
  firstName: string = '', 
  lastName: string = '', 
  currentEmail: string = '',
  newEmail: string = ''
) => {
  const displayName = firstName ? `${firstName}` : 'there'
  const currentYear = new Date().getFullYear()
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Confirm Your New Email</title>
    </head>
    <body style="margin: 0; padding: 0; background: linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%); min-height: 100vh; font-family: Arial, sans-serif;">
      <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <div style="background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <div style="background: linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">Praxio</h1>
          </div>
          <div style="background: white; padding: 30px; color: #333; line-height: 1.6;">
            <p style="font-size: 16px; margin-top: 0;">Hi ${displayName},</p>
            <p style="font-size: 16px;">You requested to change your email address from <strong>${currentEmail}</strong> to <strong>${newEmail}</strong>.</p>
            <p style="font-size: 16px;">Click the button below to confirm this change:</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationLink}" 
                 style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                Confirm New Email
              </a>
            </div>
            
            <p style="font-size: 14px; color: #666;">This link will expire in 1 hour for security reasons.</p>
            <p style="font-size: 14px; color: #666;">If you didn't request this change, please ignore this email. Your email address will remain unchanged.</p>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
            
            <p style="font-size: 12px; color: #999; text-align: center;">
              If the button doesn't work, copy and paste this link into your browser:<br/>
              <a href="${verificationLink}" style="color: #0ea5e9; word-break: break-all;">${verificationLink}</a>
            </p>
          </div>
          <div style="background: #f9fafb; padding: 20px; text-align: center;">
            <p style="margin: 0; font-size: 12px; color: #666;">© ${currentYear} Praxio. All rights reserved.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `
}

