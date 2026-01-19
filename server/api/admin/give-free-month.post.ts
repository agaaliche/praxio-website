/**
 * POST /api/admin/give-free-month
 * Give free month(s) to a user (siteadmin only)
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
  const { uid, months, reason } = body

  if (!uid || !months) {
    throw createError({
      statusCode: 400,
      message: 'User ID and months are required'
    })
  }

  try {
    // Check if user has an active subscription
    const users = await query<any>(
      'SELECT userEmail, subscriptionStatus FROM users WHERE userId = ?',
      [uid]
    )
    const user = users[0]

    if (!user) {
      throw createError({
        statusCode: 404,
        message: 'User not found'
      })
    }

    if (user.subscriptionStatus === 'active' || user.subscriptionStatus === 'trialing') {
      throw createError({
        statusCode: 400,
        message: 'Cannot give free month to a user with an active subscription'
      })
    }

    // Update subscription or trial end date
    await execute(
      `UPDATE users 
       SET trialEndDate = DATE_ADD(COALESCE(trialEndDate, NOW()), INTERVAL ? MONTH),
           subscriptionStatus = 'trial'
       WHERE userId = ?`,
      [months, uid]
    )

    // Use already fetched user email for logging
    const userEmail = user.userEmail || uid

    // Log the free month
    try {
      await execute(
        `INSERT INTO admin_trial_history (type, email, amount, reason, admin_email, created_at)
         VALUES ('free_month', ?, ?, ?, ?, NOW())`,
        [userEmail, `${months} month(s)`, reason || '', admin.email]
      )
    } catch (logError) {
      // Table might not exist - continue anyway
      console.warn('Could not log free month:', logError)
    }

    console.log(`✅ Admin gave ${months} free month(s) to: ${userEmail}`)

    return { success: true, message: 'Free month granted' }
  } catch (error: any) {
    console.error('❌ Error giving free month:', error)
    throw createError({
      statusCode: 500,
      message: error.message || 'Failed to give free month'
    })
  }
})
