/**
 * GET /api/messages/all
 * Get all messages for the authenticated user (read and unread)
 */
import { query } from '../../utils/database'
import { verifyAuth } from '../../utils/auth'

export default defineEventHandler(async (event) => {
    try {
        // Verify authentication
        const user = await verifyAuth(event)
        const userId = user.uid

        // Get all direct messages (read and unread)
        const directMessages = await query<any>(
            `SELECT id, type, title, message, sent_by as sentBy, created_at as createdAt, read_at as readAt, 'direct' as source
       FROM admin_messages 
       WHERE target_uid = ?
       ORDER BY created_at DESC
       LIMIT 50`,
            [userId]
        )

        // Get broadcasts from the last 7 days
        const broadcasts = await query<any>(
            `SELECT id, type, title, message, sent_by as sentBy, created_at as createdAt, target, 'broadcast' as source
       FROM admin_broadcasts 
       WHERE created_at > DATE_SUB(NOW(), INTERVAL 7 DAY)
       AND (target = 'all' OR target IS NULL)
       ORDER BY created_at DESC`
        )

        // Combine and return
        const allMessages = [...directMessages, ...broadcasts]
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

        return {
            success: true,
            messages: allMessages,
            count: allMessages.length
        }

    } catch (error: any) {
        console.error('❌ Error fetching all messages:', error)
        throw createError({
            statusCode: error.statusCode || 500,
            message: error.message || 'Failed to fetch messages'
        })
    }
})
