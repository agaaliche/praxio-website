/**
 * POST /api/admin/send-message
 * Send a message to a specific user (siteadmin only)
 */
import { defineEventHandler, readBody, createError } from 'h3'
import { getAuth } from 'firebase-admin/auth'
import { verifySiteAdmin } from '../../utils/auth'
import { execute } from '../../utils/database'
import { getFirebaseApp } from '../../utils/firebase'
import { checkRateLimit, RateLimits } from '../../utils/rateLimit'

export default defineEventHandler(async (event) => {
  // Verify siteadmin access
  const admin = await verifySiteAdmin(event)

  // Rate limiting
  checkRateLimit(event, admin.uid, RateLimits.MESSAGING)

  const body = await readBody(event)
  const { recipientEmail, type, title, message } = body

  if (!recipientEmail || !message) {
    throw createError({
      statusCode: 400,
      message: 'Recipient email and message are required'
    })
  }

  try {
    // Look up user by email to get uid
    const app = getFirebaseApp()
    const auth = getAuth(app)

    let targetUid = ''
    try {
      const userRecord = await auth.getUserByEmail(recipientEmail)
      targetUid = userRecord.uid
    } catch (e) {
      throw createError({
        statusCode: 404,
        message: 'User not found'
      })
    }

    // Store message in database for the user to pick up
    await execute(
      `INSERT INTO admin_messages (target_uid, type, title, message, sent_by, created_at) 
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [targetUid, type || 'snackbar', title || '', message, admin.uid]
    )

    console.log(`✅ Admin sent message to: ${recipientEmail}`)

    return { success: true, message: 'Message sent' }
  } catch (error: any) {
    console.error('❌ Error sending message:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to send message'
    })
  }
})
