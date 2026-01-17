/**
 * PUT /api/tickets/[id]/status
 * Update ticket status (admin only)
 */
import { verifyAuth } from '../../../utils/auth'
import { execute, queryOne } from '../../../utils/database'

export default defineEventHandler(async (event) => {
    try {
        // Get authenticated user
        const user = await verifyAuth(event);

        // Check if user is site admin
        if (!user.isSiteAdmin) {
            throw createError({
                statusCode: 403,
                message: 'Forbidden: Admin access required!'
            });
        }

        // Get ticket ID from route params
        const id = event.context.params?.id;
        if (!id) {
            throw createError({
                statusCode: 400,
                message: 'Ticket ID is required'
            });
        }

        // Get request body
        const body = await readBody(event);
        const { status } = body;

        if (!status) {
            throw createError({
                statusCode: 400,
                message: 'Status is required!'
            });
        }

        // Validate status
        const validStatuses = ['submitted', 'received', 'pending', 'resolved'];
        if (!validStatuses.includes(status)) {
            throw createError({
                statusCode: 400,
                message: 'Invalid status value!'
            });
        }

        // Update ticket status
        const updateQuery = status === 'resolved'
            ? 'UPDATE tickets SET status = ?, resolvedAt = NOW(), updatedAt = NOW() WHERE id = ?'
            : 'UPDATE tickets SET status = ?, updatedAt = NOW() WHERE id = ?';

        await execute(updateQuery, [status, id]);

        // Get updated ticket
        const ticket = await queryOne<any>(
            'SELECT * FROM tickets WHERE id = ?',
            [id]
        );

        if (!rows || rows.length === 0) {
            throw createError({
                statusCode: 404,
                message: 'Ticket not found!'
            });
        }

        // TODO: Send email notification to ticket owner (optional)

        return rows[0];
    } catch (error: any) {
        console.error('Error updating ticket status:', error);
        throw createError({
            statusCode: error.statusCode || 500,
            message: error.message || 'Error occurred while updating the ticket.'
        });
    }
});
