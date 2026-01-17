/**
 * POST /api/admin/broadcast-message
 * Broadcast a message to all/targeted users (siteadmin only)
 */
import { defineEventHandler, readBody, createError } from 'h3'
import { verifySiteAdmin } from '../../utils/auth'
import { execute } from '../../utils/database'
import { checkRateLimit, RateLimits } from '../../utils/rateLimit'

export default defineEventHandler(async (event) => {
  // Verify siteadmin access
  const admin = await verifySiteAdmin(event)

  // Rate limiting
  checkRateLimit(event, admin.uid, RateLimits.MESSAGING)

  const body = await readBody(event)
  const { type, title, message, target } = body

  if (!message) {
    throw createError({
      statusCode: 400,
      message: 'Message is required'
    })
  }

  try {
    // Store broadcast message
    await execute(
      `INSERT INTO admin_broadcasts (type, title, message, target, sent_by, created_at) 
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [type || 'snackbar', title || '', message, target || 'all', admin.uid]
    )

    console.log(`✅ Admin broadcast message to: ${target || 'all'}`)

    return { success: true, message: 'Broadcast sent' }
  } catch (error: any) {
    console.error('❌ Error broadcasting message:', error)
    throw createError({
      statusCode: 500,
      message: error.message || 'Failed to broadcast message'
    })
  }
})
