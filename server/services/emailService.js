// Centralized Email Service for Praxio
// Uses messaging templates to generate and send emails via Firebase

import admin from 'firebase-admin';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { createRequire } from 'module';

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create require function to load CommonJS modules
const require = createRequire(import.meta.url);

// Resolve path to messaging templates
// In production (Docker), packages is at /app/packages
// In development, we need to go up from server/services to reach packages
let templatesPath;
if (process.env.NODE_ENV === 'production') {
  templatesPath = '/app/packages/messaging/templates/emails/index.js';
} else {
  templatesPath = resolve(__dirname, '../../../packages/messaging/templates/emails/index.js');
}
console.log('📂 Email templates path:', templatesPath);

class EmailService {
  constructor() {
    this.db = null;
    this.templates = null;
  }

  // Lazy initialization
  initialize() {
    if (this.db && this.templates) {
      return;
    }

    // Initialize Firebase if needed
    if (!admin.apps.length) {
      admin.initializeApp();
    }
    this.db = admin.firestore();

    // Clear require cache to get fresh templates on each server restart
    delete require.cache[require.resolve(templatesPath)];
    
    // Load CommonJS templates using require
    this.templates = require(templatesPath);
  }

  /**
   * Get template instance for email type
   * @param {string} type - Email type (invitation, credentials, verification, passwordReset, emailChange, passwordChanged, emailChanged)
   * @param {string} locale - Locale code (en, fr)
   * @returns {Object} Template instance
   */
  getTemplate(type, locale = 'en') {
    this.initialize();

    const {
      InvitationTemplate,
      CredentialsTemplate,
      VerificationTemplate,
      PasswordResetTemplate,
      EmailChangeTemplate,
      PasswordChangedTemplate,
      EmailChangedTemplate
    } = this.templates;

    const templateMap = {
      invitation: InvitationTemplate,
      credentials: CredentialsTemplate,
      verification: VerificationTemplate,
      passwordReset: PasswordResetTemplate,
      emailChange: EmailChangeTemplate,
      passwordChanged: PasswordChangedTemplate,
      emailChanged: EmailChangedTemplate
    };

    const TemplateClass = templateMap[type];
    if (!TemplateClass) {
      throw new Error(`Unknown email template type: ${type}`);
    }

    return new TemplateClass(locale);
  }

  /**
   * Send email using messaging template
   * @param {string} type - Email type
   * @param {string} recipient - Recipient email address
   * @param {Object} data - Template data
   * @param {string} locale - Locale code
   * @returns {Promise<Object>} Result with success status
   */
  async send(type, recipient, data, locale = 'en') {
    this.initialize();

    try {
      console.log(`📧 Preparing ${type} email for ${recipient} (${locale})`);

      // Get template and render email
      const template = this.getTemplate(type, locale);
      const html = template.render(data);
      const subject = template.getSubject(data);
      const text = template.getText(data);

      // Add email to Firestore mail collection
      // Firebase Extension will process and send
      const mailRef = await this.db.collection('mail').add({
        to: recipient,
        message: {
          subject,
          text,
          html
        },
        template: {
          name: type,
          data
        }
      });

      console.log(`✅ Email queued with ID: ${mailRef.id}`);

      return {
        success: true,
        emailId: mailRef.id,
        type,
        recipient
      };
    } catch (error) {
      console.error(`❌ Error sending ${type} email:`, error);
      throw error;
    }
  }

  /**
   * Send invitation email
   * @param {string} email - Recipient email
   * @param {Object} data - { userName, inviteLink, inviterName }
   * @param {string} locale - Locale code
   */
  async sendInvitation(email, data, locale = 'en') {
    return this.send('invitation', email, data, locale);
  }

  /**
   * Send credentials email
   * @param {string} email - Recipient email
   * @param {Object} data - { userName, email, temporaryPassword, loginUrl }
   * @param {string} locale - Locale code
   */
  async sendCredentials(email, data, locale = 'en') {
    return this.send('credentials', email, data, locale);
  }

  /**
   * Send verification email
   * @param {string} email - Recipient email
   * @param {Object} data - { userName, verificationLink }
   * @param {string} locale - Locale code
   */
  async sendVerification(email, data, locale = 'en') {
    return this.send('verification', email, data, locale);
  }

  /**
   * Send password reset email
   * @param {string} email - Recipient email
   * @param {Object} data - { userName, resetLink }
   * @param {string} locale - Locale code
   */
  async sendPasswordReset(email, data, locale = 'en') {
    return this.send('passwordReset', email, data, locale);
  }

  /**
   * Send email change confirmation
   * @param {string} email - Recipient email
   * @param {Object} data - { userName, verificationLink, newEmail }
   * @param {string} locale - Locale code
   */
  async sendEmailChange(email, data, locale = 'en') {
    return this.send('emailChange', email, data, locale);
  }

  /**
   * Send password changed confirmation
   * @param {string} email - Recipient email
   * @param {Object} data - { firstName, changeDate, supportUrl }
   * @param {string} locale - Locale code
   */
  async sendPasswordChanged(email, data, locale = 'en') {
    return this.send('passwordChanged', email, data, locale);
  }

  /**
   * Send email changed confirmation (to old email)
   * @param {string} email - Recipient email (old email address)
   * @param {Object} data - { firstName, oldEmail, newEmail, changeDate, supportUrl }
   * @param {string} locale - Locale code
   */
  async sendEmailChanged(email, data, locale = 'en') {
    return this.send('emailChanged', email, data, locale);
  }
}

// Export factory function instead of singleton
export default function getEmailService() {
  return new EmailService();
}
