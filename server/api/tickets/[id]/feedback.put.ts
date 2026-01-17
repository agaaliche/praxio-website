/**
 * PUT /api/tickets/[id]/feedback
 * Update fix feedback (user who owns the ticket)
 */
import { verifyAuth } from '../../../utils/auth'
import { execute, queryOne } from '../../../utils/database'

export default defineEventHandler(async (event) => {
    try {
        // Get authenticated user
        const user = await verifyAuth(event);

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
        const { fixFeedback } = body;

        if (!fixFeedback) {
            throw createError({
                statusCode: 400,
                message: 'Fix feedback is required!'
            });
        }

        // Get ticket to check ownership
        const ticket = await queryOne<any>(
            'SELECT * FROM tickets WHERE id = ?',
            [id]
        );

        if (!ticket) {
            throw createError({
                statusCode: 404,
                message: 'Ticket not found!'
            });
        }

        // Check if user owns this ticket
        if (ticket.userId !== user.uid) {
            throw createError({
                statusCode: 403,
                message: 'Forbidden: You can only provide feedback for your own tickets!'
            });
        }

        // Update fix feedback
        await execute(
            'UPDATE tickets SET fixFeedback = ?, updatedAt = NOW() WHERE id = ?',
            [fixFeedback, id]
        );

        // Get updated ticket
        const updatedTicket = await queryOne<any>(
            'SELECT * FROM tickets WHERE id = ?',
            [id]
        );

        return updatedTicket;
    } catch (error: any) {
        console.error('Error updating fix feedback:', error);
        throw createError({
            statusCode: error.statusCode || 500,
            message: error.message || 'Error occurred while updating feedback.'
        });
    }
});
