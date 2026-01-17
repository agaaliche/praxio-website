/**
 * GET /api/admin/message-history
 * Get message history (siteadmin only)
 */
import { defineEventHandler } from 'h3'
import { verifySiteAdmin } from '../../utils/auth'
import { query } from '../../utils/database'
import { checkRateLimit, RateLimits } from '../../utils/rateLimit'

export default defineEventHandler(async (event) => {
  // Verify siteadmin access
  const admin = await verifySiteAdmin(event)

  // Rate limiting
  checkRateLimit(event, admin.uid, RateLimits.READ)

  try {
    let messages: any[] = []
    let broadcasts: any[] = []

    try {
      messages = await query<any>(
        `SELECT 'direct' as type, target_uid as target, message, sent_by as sentBy, created_at as createdAt 
         FROM admin_messages 
         ORDER BY created_at DESC 
         LIMIT 50`
      )
    } catch (e) {
      // Table might not exist
    }

    try {
      broadcasts = await query<any>(
        `SELECT 'broadcast' as type, target, message, sent_by as sentBy, created_at as createdAt 
         FROM admin_broadcasts 
         ORDER BY created_at DESC 
         LIMIT 50`
      )
    } catch (e) {
      // Table might not exist
    }

    const combined = [...messages, ...broadcasts]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 50)

    return { messages: combined }
  } catch (error: any) {
    console.error('❌ Error getting message history:', error)
    return { messages: [] }
  }
})
