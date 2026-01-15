/**
 * GET /api/admin/impersonation-log
 * Get impersonation log (siteadmin only)
 */
import { defineEventHandler } from 'h3'
import { verifySiteAdmin } from '../../utils/auth'
import { query } from '../../utils/database'

export default defineEventHandler(async (event) => {
  try {
    // Verify siteadmin access
    await verifySiteAdmin(event)
    
    const log = await query<any>(
      `SELECT 
              id,
              admin_email, 
              target_email, 
              reason, 
              started_at as created_at,
              ended_at,
              TIMESTAMPDIFF(MINUTE, started_at, COALESCE(ended_at, NOW())) as duration
       FROM admin_impersonation_log
       ORDER BY started_at DESC
       LIMIT 50`
    )
    
    return { log }
  } catch (error: any) {
    console.error('❌ Error in impersonation log handler:', error)
    // Table might not exist or auth error
    return { log: [] }
  }
})
