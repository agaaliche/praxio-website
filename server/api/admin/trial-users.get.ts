/**
 * GET /api/admin/trial-users
 * Get users on trial (siteadmin only)
 */
import { defineEventHandler, createError } from 'h3'
import { verifySiteAdmin } from '../../utils/auth'
import { query } from '../../utils/database'

export default defineEventHandler(async (event) => {
  // Verify siteadmin access
  await verifySiteAdmin(event)
  
  try {
    const trials = await query<any>(
      `SELECT userId, userEmail, trialEndDate
       FROM users
       WHERE subscriptionStatus = 'trial' OR trialEndDate IS NOT NULL
       ORDER BY trialEndDate ASC`
    )
    
    const users = trials.map((t: any) => ({
      uid: t.userId,
      email: t.userEmail,
      trial_ends_at: t.trialEndDate
    }))
    
    return { users }
  } catch (error: any) {
    console.error('❌ Error getting trial users:', error)
    return { users: [] }
  }
})
