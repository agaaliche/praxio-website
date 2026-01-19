/**
 * GET /api/admin/trial-users
 * Get users on trial (siteadmin only)
 */
import { defineEventHandler, createError } from 'h3'
import { verifySiteAdmin } from '../../utils/auth'
import { query } from '../../utils/database'
import { checkRateLimit, RateLimits } from '../../utils/rateLimit'

export default defineEventHandler(async (event) => {
  // Verify siteadmin access
  const admin = await verifySiteAdmin(event)

  // Rate limiting
  checkRateLimit(event, admin.uid, RateLimits.READ)

  try {
    const trials = await query<any>(
      `SELECT userId, userEmail, trialEndDate, subscriptionStatus, planType, subscriptionEndDate
       FROM users
       WHERE subscriptionStatus = 'trial' OR trialEndDate IS NOT NULL
       ORDER BY trialEndDate ASC`
    )

    const users = trials.map((t: any) => ({
      uid: t.userId,
      email: t.userEmail,
      trial_ends_at: t.trialEndDate,
      subscription_status: t.subscriptionStatus,
      plan_type: t.planType,
      subscription_end_date: t.subscriptionEndDate
    }))

    return { users }
  } catch (error: any) {
    console.error('❌ Error getting trial users:', error)
    return { users: [] }
  }
})
