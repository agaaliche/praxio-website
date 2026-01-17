/**
 * PATCH /api/messages/[id] - Mark a message as read
 * DELETE /api/messages/[id] - Delete a message
 */
import { execute } from '../../utils/database'
import { verifyAuth } from '../../utils/auth'

export default defineEventHandler(async (event) => {
    const method = event.method

    if (method === 'PATCH') {
        return handleMarkAsRead(event)
    } else if (method === 'DELETE') {
        return handleDelete(event)
    } else {
        throw createError({
            statusCode: 405,
            message: 'Method not allowed'
        })
    }
})

// Mark message as read
async function handleMarkAsRead(event: any) {
    try {
        // Verify authentication
        const user = await verifyAuth(event)
        const userId = user.uid
        const messageId = getRouterParam(event, 'id')

        if (!messageId) {
            throw createError({
                statusCode: 400,
                message: 'Message ID is required'
            })
        }

        // Mark message as read (only direct messages have read_at field)
        await execute(
            `UPDATE admin_messages 
       SET read_at = NOW() 
       WHERE id = ? AND target_uid = ? AND read_at IS NULL`,
            [messageId, userId]
        )

        return {
            success: true,
            message: 'Message marked as read'
        }

    } catch (error: any) {
        console.error('❌ Error marking message as read:', error)
        throw createError({
            statusCode: error.statusCode || 500,
            message: error.message || 'Failed to mark message as read'
        })
    }
}

// Delete message
async function handleDelete(event: any) {
    try {
        // Verify authentication
        const user = await verifyAuth(event)
        const userId = user.uid
        const messageId = getRouterParam(event, 'id')

        // Get source from query params (direct or broadcast)
        const query = getQuery(event)
        const source = query.source as 'direct' | 'broadcast'

        if (!messageId) {
            throw createError({
                statusCode: 400,
                message: 'Message ID is required'
            })
        }

        if (!source || !['direct', 'broadcast'].includes(source)) {
            throw createError({
                statusCode: 400,
                message: 'Invalid source parameter'
            })
        }

        // Delete from appropriate table
        if (source === 'direct') {
            // Only allow deleting own direct messages
            await execute(
                `DELETE FROM admin_messages WHERE id = ? AND target_uid = ?`,
                [messageId, userId]
            )
        } else {
            // For broadcasts, we don't actually delete them (they're for everyone)
            // Instead, we could create a "hidden_broadcasts" table to track which users have dismissed them
            // For now, just return success (client removes from their view)
            // TODO: Implement hidden_broadcasts tracking
        }

        return {
            success: true,
            message: 'Message deleted'
        }

    } catch (error: any) {
        console.error('❌ Error deleting message:', error)
        throw createError({
            statusCode: error.statusCode || 500,
            message: error.message || 'Failed to delete message'
        })
    }
}
