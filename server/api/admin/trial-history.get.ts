/**
 * GET /api/admin/trial-history
 * Get trial extension history (siteadmin only)
 */
import { defineEventHandler } from 'h3'
import { verifySiteAdmin } from '../../utils/auth'
import { query } from '../../utils/database'

export default defineEventHandler(async (event) => {
  // Verify siteadmin access
  await verifySiteAdmin(event)
  
  try {
    const rows = await query<any>(
      `SELECT id, type, email as user_email, amount as days, reason, created_at
       FROM admin_trial_history
       ORDER BY created_at DESC
       LIMIT 50`
    )
    
    return { history: rows }
  } catch (error: any) {
    console.error('❌ Error getting trial history:', error)
    // Table might not exist
    return { history: [] }
  }
})
