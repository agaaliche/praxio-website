/**
 * Email service for Praxio
 * Uses same infrastructure as inrManager:
 * 1. Firebase Trigger Email Extension (Production - Recommended)
 * 2. Gmail/Nodemailer (Testing)
 * 3. SendGrid (Alternative)
 * 4. Console logging (Development)
 */

import { getFirestore } from 'firebase-admin/firestore'
import { getFirebaseApp, hasFirebaseCredentials } from './firebase'

// Email messages for i18n
const messages = {
  en: {
    emails: {
      invitation: {
        subject: "You've been invited to access {accountName}'s account",
        greeting: 'Hi {firstName},',
        invitedBy: '{ownerName} has invited you to access {accountName}\'s account on Praxio.',
        clickButton: 'Click the button below to accept the invitation and set up your account.',
        acceptButton: 'Accept Invitation',
        linkExpires: 'This invitation link will expire in 48 hours for security purposes.',
        ignoreIfUnexpected: 'If you didn\'t expect this invitation, you can safely ignore this email.',
      },
      footer: {
        copyright: '© {year} Praxio. All rights reserved.',
      },
    },
  },
  fr: {
    emails: {
      invitation: {
        subject: 'Vous avez été invité à accéder au compte de {accountName}',
        greeting: 'Bonjour {firstName},',
        invitedBy: '{ownerName} vous a invité à accéder au compte de {accountName} sur Praxio.',
        clickButton: 'Cliquez sur le bouton ci-dessous pour accepter l\'invitation et configurer votre compte.',
        acceptButton: 'Accepter l\'invitation',
        linkExpires: 'Ce lien d\'invitation expirera dans 48 heures pour des raisons de sécurité.',
        ignoreIfUnexpected: 'Si vous n\'attendiez pas cette invitation, vous pouvez ignorer cet email en toute sécurité.',
      },
      footer: {
        copyright: '© {year} Praxio. Tous droits réservés.',
      },
    },
  },
}

// Helper function to get translated message
const getEmailMessage = (lang: string, key: string): string => {
  const keys = key.split('.')
  let value: any = (messages as any)[lang] || (messages as any)['en']
  for (const k of keys) {
    value = value[k]
    if (!value) return key
  }
  return value
}

// Helper function to replace placeholders
const replacePlaceholders = (text: string, vars: Record<string, string | number>): string => {
  return text.replace(/\{(\w+)\}/g, (match, key) => String(vars[key]) || match)
}

// Email template
const getInviteEmailTemplate = (
  email: string,
  inviteLink: string,
  accountOwnerName: string,
  role: string,
  firstName: string,
  lastName: string,
  organizationName: string = '',
  ownerFirstName: string = '',
  lang: string = 'fr'
): string => {
  const displayName = organizationName || accountOwnerName
  const ownerName = ownerFirstName || accountOwnerName
  const currentYear = new Date().getFullYear()
  
  const greeting = replacePlaceholders(getEmailMessage(lang, 'emails.invitation.greeting'), { firstName })
  const invitedByText = replacePlaceholders(getEmailMessage(lang, 'emails.invitation.invitedBy'), { ownerName, accountName: displayName })
  const clickButtonText = getEmailMessage(lang, 'emails.invitation.clickButton')
  const acceptButtonText = getEmailMessage(lang, 'emails.invitation.acceptButton')
  const linkExpiresText = getEmailMessage(lang, 'emails.invitation.linkExpires')
  const ignoreText = getEmailMessage(lang, 'emails.invitation.ignoreIfUnexpected')
  const copyrightText = replacePlaceholders(getEmailMessage(lang, 'emails.footer.copyright'), { year: currentYear })
  
  return `
<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Praxio Invitation</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f5f5f5;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 30px; text-align: center; background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); border-radius: 16px 16px 0 0;">
              <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #ffffff;">Praxio</h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="font-size: 16px; color: #333; margin: 0 0 20px; line-height: 1.6;">
                ${greeting}
              </p>
              <p style="font-size: 16px; color: #333; margin: 0 0 20px; line-height: 1.6;">
                ${invitedByText}
              </p>
              <p style="font-size: 16px; color: #333; margin: 0 0 30px; line-height: 1.6;">
                ${clickButtonText}
              </p>
              
              <!-- Button -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center" style="padding: 20px 0;">
                    <a href="${inviteLink}" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 12px; box-shadow: 0 4px 15px rgba(37, 99, 235, 0.4);">
                      ${acceptButtonText}
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="font-size: 14px; color: #666; margin: 30px 0 10px; line-height: 1.6;">
                ${linkExpiresText}
              </p>
              <p style="font-size: 14px; color: #999; margin: 0; line-height: 1.6;">
                ${ignoreText}
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 20px 40px; background-color: #f9fafb; border-radius: 0 0 16px 16px; border-top: 1px solid #e5e7eb;">
              <p style="font-size: 12px; color: #9ca3af; margin: 0; text-align: center;">
                ${copyrightText}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `
}

// Log email to console (development fallback)
const logEmailToConsole = (
  email: string,
  inviteLink: string,
  accountOwnerName: string,
  role: string,
  firstName: string,
  lastName: string
) => {
  console.log('\n' + '='.repeat(60))
  console.log('📧 INVITATION EMAIL (Development Mode)')
  console.log('='.repeat(60))
  console.log(`To: ${email}`)
  console.log(`Name: ${firstName} ${lastName}`)
  console.log(`Role: ${role}`)
  console.log(`Invited by: ${accountOwnerName}`)
  console.log(`\n🔗 Invite Link:\n${inviteLink}`)
  console.log('='.repeat(60) + '\n')
}

export interface SendInviteEmailOptions {
  email: string
  inviteLink: string
  accountOwnerName: string
  role: string
  firstName: string
  lastName: string
  organizationName?: string
  ownerFirstName?: string
  lang?: string
}

export interface EmailResult {
  success: boolean
  message: string
  inviteLink: string
}

/**
 * Send invite email using Firebase Trigger Email Extension
 * Falls back to console logging in development
 */
export async function sendInviteEmail(options: SendInviteEmailOptions): Promise<EmailResult> {
  const {
    email,
    inviteLink,
    accountOwnerName,
    role,
    firstName,
    lastName,
    organizationName = '',
    ownerFirstName = '',
    lang = 'fr'
  } = options
  
  const config = useRuntimeConfig()
  const displayName = organizationName || accountOwnerName
  const subject = replacePlaceholders(getEmailMessage(lang, 'emails.invitation.subject'), { accountName: displayName })
  
  // Option 1: Firebase Trigger Email Extension (Production)
  if (config.useFirebaseEmail === 'true') {
    // Check if we have credentials
    if (!hasFirebaseCredentials()) {
      console.warn('⚠️ Firebase credentials not available, logging email to console')
      logEmailToConsole(email, inviteLink, accountOwnerName, role, firstName, lastName)
      return {
        success: false,
        message: 'Firebase not configured - link logged to console',
        inviteLink
      }
    }
    
    const app = getFirebaseApp()
    if (!app) {
      console.error('❌ Firebase Admin SDK not initialized')
      logEmailToConsole(email, inviteLink, accountOwnerName, role, firstName, lastName)
      return {
        success: false,
        message: 'Firebase not initialized - link logged to console',
        inviteLink
      }
    }
    
    try {
      const db = getFirestore(app)
      
      // Write to Firestore 'mail' collection - Firebase Extension will process it
      await db.collection('mail').add({
        to: email,
        message: {
          subject: subject,
          html: getInviteEmailTemplate(email, inviteLink, accountOwnerName, role, firstName, lastName, organizationName, ownerFirstName, lang),
          text: `${replacePlaceholders(getEmailMessage(lang, 'emails.invitation.greeting'), { firstName })} ${replacePlaceholders(getEmailMessage(lang, 'emails.invitation.invitedBy'), { ownerName: ownerFirstName || accountOwnerName, accountName: displayName })} ${getEmailMessage(lang, 'emails.invitation.clickButton')} ${inviteLink}`,
          trackingSettings: {
            clickTracking: {
              enable: false
            }
          }
        }
      })
      
      console.log(`✅ Email queued for ${email} via Firebase Extension`)
      
      return {
        success: true,
        message: 'Email queued successfully via Firebase',
        inviteLink
      }
    } catch (error: any) {
      console.error('❌ Firebase Email error:', error.message)
      // Fallback to console logging
      logEmailToConsole(email, inviteLink, accountOwnerName, role, firstName, lastName)
      
      return {
        success: false,
        message: 'Firebase Email error - link logged to console',
        inviteLink
      }
    }
  }
  
  // Option 2: Development mode - log to console
  else {
    logEmailToConsole(email, inviteLink, accountOwnerName, role, firstName, lastName)
    
    return {
      success: true,
      message: 'Email preview logged to console (development mode)',
      inviteLink
    }
  }
}
