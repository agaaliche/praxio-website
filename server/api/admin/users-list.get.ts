/**
 * GET /api/admin/users-list
 * Get list of users for autocomplete (siteadmin only)
 */
import { defineEventHandler } from 'h3'
import { verifySiteAdmin } from '../../utils/auth'
import { query } from '../../utils/database'
import { checkRateLimit, RateLimits } from '../../utils/rateLimit'

export default defineEventHandler(async (event) => {
  try {
    // Verify siteadmin access
    const admin = await verifySiteAdmin(event)

    // Rate limiting
    checkRateLimit(event, admin.uid, RateLimits.READ)

    const rows = await query<any>(
      `SELECT 
        userId,
        userEmail as email,
        CONCAT(COALESCE(userName, ''), ' ', COALESCE(userLastName, '')) as name
       FROM users
       ORDER BY userEmail ASC`
    )

    const users = rows.map((r: any) => ({
      userId: r.userId,
      email: r.email,
      name: r.name?.trim() || null
    }))

    return { users }
  } catch (error: any) {
    console.error('❌ Error getting users list:', error)
    // Return empty array instead of throwing to prevent 500
    return { users: [] }
  }
})
