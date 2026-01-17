/**
 * GET /api/messages/inbox
 * Get unread messages for the authenticated user
 */
import { query } from '../../utils/database'
import { verifyAuth } from '../../utils/auth'

export default defineEventHandler(async (event) => {
    try {
        // Verify authentication
        const user = await verifyAuth(event)
        const userId = user.uid

        // Get unread direct messages
        const directMessages = await query<any>(
            `SELECT id, type, title, message, sent_by as sentBy, created_at as createdAt, 'direct' as source
       FROM admin_messages 
       WHERE target_uid = ? AND read_at IS NULL
       ORDER BY created_at DESC`,
            [userId]
        )

        // Get broadcasts from last 24 hours that user hasn't dismissed
        const broadcasts = await query<any>(
            `SELECT b.id, b.type, b.title, b.message, b.sent_by as sentBy, b.created_at as createdAt, b.target, 'broadcast' as source
       FROM admin_broadcasts b
       LEFT JOIN dismissed_broadcasts db ON b.id = db.broadcast_id AND db.user_id = ?
       WHERE b.created_at > DATE_SUB(NOW(), INTERVAL 24 HOUR)
       AND (b.target = 'all' OR b.target IS NULL)
       AND db.id IS NULL
       ORDER BY b.created_at DESC`,
            [userId]
        )

        // Combine and return
        const allMessages = [...directMessages, ...broadcasts]

        return {
            success: true,
            messages: allMessages,
            count: allMessages.length
        }

    } catch (error: any) {
        console.error('❌ Error fetching messages:', error)
        throw createError({
            statusCode: error.statusCode || 500,
            message: error.message || 'Failed to fetch messages'
        })
    }
})
