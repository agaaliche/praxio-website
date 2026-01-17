/**
 * GET /api/tickets/[id]
 * Get a single ticket by ID
 */
import { verifyAuth } from '../../utils/auth'
import { queryOne } from '../../utils/database'

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

        // Get ticket
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

        // Check if user has permission to view this ticket
        if (!user.isSiteAdmin && ticket.userId !== user.uid) {
            throw createError({
                statusCode: 403,
                message: 'Forbidden: You do not have permission to view this ticket!'
            });
        }

        return ticket;
    } catch (error: any) {
        console.error('Error retrieving ticket:', error);
        throw createError({
            statusCode: error.statusCode || 500,
            message: error.message || 'Error occurred while retrieving the ticket.'
        });
    }
});
