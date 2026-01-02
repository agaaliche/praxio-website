// Email Preview API
// Returns rendered HTML for email templates (for demo purposes)

import getEmailService from '../../services/emailService';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { type, data, locale = 'en' } = body;

    // Validate email type
    const validTypes = ['invitation', 'credentials', 'verification', 'passwordReset', 'emailChange'];
    if (!validTypes.includes(type)) {
      throw createError({
        statusCode: 400,
        message: `Invalid email type. Must be one of: ${validTypes.join(', ')}`
      });
    }

    // Validate locale
    if (locale && !['en', 'fr'].includes(locale)) {
      throw createError({
        statusCode: 400,
        message: 'Invalid locale. Must be "en" or "fr"'
      });
    }

    // Get email service and render template
    const emailService = getEmailService();
    const template = emailService.getTemplate(type, locale);
    const html = template.render(data);
    const subject = template.getSubject(data);

    return {
      success: true,
      subject,
      html
    };

  } catch (error) {
    console.error('❌ Email preview error:', error);
    
    if (error.statusCode) {
      throw error;
    }
    
    throw createError({
      statusCode: 500,
      message: error.message || 'Failed to preview email'
    });
  }
});
