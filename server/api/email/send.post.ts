// Email API Endpoint
// Accepts email requests from Retroact and other services
// Secured with API key authentication

import emailService from '../../services/emailService';

export default defineEventHandler(async (event) => {
  try {
    // Get request body
    const body = await readBody(event);
    const { type, recipient, data, locale = 'en', apiKey } = body;

    // Validate API key
    const validApiKey = process.env.PRAXIO_EMAIL_API_KEY;
    if (!validApiKey) {
      console.error('❌ PRAXIO_EMAIL_API_KEY not configured');
      throw createError({
        statusCode: 500,
        message: 'Email API not configured'
      });
    }

    if (!apiKey || apiKey !== validApiKey) {
      console.error('❌ Invalid API key');
      throw createError({
        statusCode: 401,
        message: 'Unauthorized'
      });
    }

    // Validate required fields
    if (!type || !recipient || !data) {
      throw createError({
        statusCode: 400,
        message: 'Missing required fields: type, recipient, data'
      });
    }

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

    // Send email
    console.log(`📧 API request: ${type} email to ${recipient} (locale: ${locale})`);
    const result = await emailService.send(type, recipient, data, locale);

    return {
      success: true,
      message: 'Email sent successfully',
      ...result
    };

  } catch (error) {
    console.error('❌ Email API error:', error);
    
    // Return proper error response
    if (error.statusCode) {
      throw error;
    }
    
    throw createError({
      statusCode: 500,
      message: error.message || 'Failed to send email'
    });
  }
});
