/**
 * POST /api/admin/extend-trial
 * Extend trial for a user (siteadmin only)
 */
import { defineEventHandler, readBody, createError } from 'h3'
import { verifySiteAdmin } from '../../utils/auth'
import { execute, query } from '../../utils/database'
import { checkRateLimit, RateLimits } from '../../utils/rateLimit'

export default defineEventHandler(async (event) => {
  // Verify siteadmin access
  const admin = await verifySiteAdmin(event)

  // Rate limiting
  checkRateLimit(event, admin.uid, RateLimits.WRITE)

  const body = await readBody(event)
  const { uid, days, reason } = body

  if (!uid || !days) {
    throw createError({
      statusCode: 400,
      message: 'User ID and days are required'
    })
  }

  try {
    // Update trial end date
    await execute(
      `UPDATE users 
       SET trialEndDate = DATE_ADD(COALESCE(trialEndDate, NOW()), INTERVAL ? DAY)
       WHERE userId = ?`,
      [days, uid]
    )

    // Get user email for logging
    const users = await query<any>('SELECT userEmail FROM users WHERE userId = ?', [uid])
    const userEmail = users[0]?.userEmail || uid

    // Log the extension
    try {
      await execute(
        `INSERT INTO admin_trial_history (type, email, amount, reason, admin_email, created_at)
         VALUES ('extend', ?, ?, ?, ?, NOW())`,
        [userEmail, `${days} days`, reason || '', admin.email]
      )
    } catch (logError) {
      // Table might not exist - continue anyway
      console.warn('Could not log trial extension:', logError)
    }

    console.log(`✅ Admin extended trial by ${days} days for: ${userEmail}`)

    return { success: true, message: 'Trial extended' }
  } catch (error: any) {
    console.error('❌ Error extending trial:', error)
    throw createError({
      statusCode: 500,
      message: error.message || 'Failed to extend trial'
    })
  }
})
