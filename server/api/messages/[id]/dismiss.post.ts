/**
 * POST /api/messages/[id]/dismiss
 * Mark a broadcast as dismissed for the current user
 */
import { execute } from '../../../utils/database'
import { verifyAuth } from '../../../utils/auth'

export default defineEventHandler(async (event) => {
    try {
        // Verify authentication
        const user = await verifyAuth(event)
        const userId = user.uid
        const broadcastId = getRouterParam(event, 'id')

        console.log(`📌 Dismiss request: user=${userId}, broadcast=${broadcastId}`)

        if (!broadcastId) {
            throw createError({
                statusCode: 400,
                message: 'Broadcast ID is required'
            })
        }

        // Insert or ignore if already dismissed
        await execute(
            `INSERT IGNORE INTO dismissed_broadcasts (user_id, broadcast_id) 
       VALUES (?, ?)`,
            [userId, broadcastId]
        )

        console.log(`✅ Broadcast ${broadcastId} dismissed for user ${userId}`)

        return {
            success: true,
            message: 'Broadcast dismissed'
        }

    } catch (error: any) {
        console.error('❌ Error dismissing broadcast:', error)
        throw createError({
            statusCode: error.statusCode || 500,
            message: error.message || 'Failed to dismiss broadcast'
        })
    }
})
