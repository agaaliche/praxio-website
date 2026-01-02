// Email Service for Praxio
// Uses @praxio/messaging templates to generate and send emails
// Centralized email delivery for all Praxio apps

import admin from 'firebase-admin';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

// Create require function for loading CommonJS modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const require = createRequire(import.meta.url);

// Load templates (they are CommonJS modules)
const templatesPath = resolve(__dirname, '../../../packages/messaging/templates/emails/index.js');
const templates = require(templatesPath);

const {
  InvitationTemplate,
  CredentialsTemplate,
  VerificationTemplate,
  PasswordResetTemplate,
  EmailChangeTemplate
} = templates;

/**
 * Email Service
 * Handles email generation and delivery via Firebase Trigger Email Extension
 */
class EmailService {
  constructor() {
    // Initialize Firebase Admin if not already done
    try {
      this.admin = admin.app();
    } catch (error) {
      // App already initialized
      this.admin = admin;
    }
    this.db = admin.firestore();
  }

  /**
   * Send an email using a template
   * @param {string} type - Template type: 'invitation', 'credentials', 'verification', 'passwordReset', 'emailChange'
   * @param {string} recipient - Email address
   * @param {Object} data - Template data
   * @param {string} locale - Language locale ('en' or 'fr')
   */
  async send(type, recipient, data, locale = 'en') {
    try {
      // Get the appropriate template
      const template = this.getTemplate(type, locale);
      
      // Generate email content
      const html = template.render(data);
      const subject = template.getSubject(data);
      const text = template.getText(data);

      // Send via Firebase Extension
      const docRef = await this.db.collection('mail').add({
        to: recipient,
        message: {
          subject,
          html,
          text,
          trackingSettings: {
            clickTracking: {
              enable: false // Disable for security/magic links
            }
          }
        }
      });

      console.log(`✅ Email queued: ${type} to ${recipient} (doc: ${docRef.id})`);
      
      return {
        success: true,
        messageId: docRef.id,
        type,
        recipient
      };
    } catch (error) {
      console.error(`❌ Email error: ${type} to ${recipient}`, error);
      throw error;
    }
  }

  /**
   * Get template instance for the given type
   */
  getTemplate(type, locale) {
    switch (type) {
      case 'invitation':
        return new InvitationTemplate(locale);
      case 'credentials':
        return new CredentialsTemplate(locale);
      case 'verification':
        return new VerificationTemplate(locale);
      case 'passwordReset':
        return new PasswordResetTemplate(locale);
      case 'emailChange':
        return new EmailChangeTemplate(locale);
      default:
        throw new Error(`Unknown email template type: ${type}`);
    }
  }

  /**
   * Send invitation email
   */
  async sendInvitation(recipient, data, locale = 'en') {
    return this.send('invitation', recipient, data, locale);
  }

  /**
   * Send credentials email
   */
  async sendCredentials(recipient, data, locale = 'en') {
    return this.send('credentials', recipient, data, locale);
  }

  /**
   * Send verification email
   */
  async sendVerification(recipient, data, locale = 'en') {
    return this.send('verification', recipient, data, locale);
  }

  /**
   * Send password reset email
   */
  async sendPasswordReset(recipient, data, locale = 'en') {
    return this.send('passwordReset', recipient, data, locale);
  }

  /**
   * Send email change confirmation
   */
  async sendEmailChange(recipient, data, locale = 'en') {
    return this.send('emailChange', recipient, data, locale);
  }
}

// Export singleton instance
export default new EmailService();
