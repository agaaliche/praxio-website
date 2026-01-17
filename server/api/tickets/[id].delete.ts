/**
 * DELETE /api/tickets/[id]
 * Delete ticket (admin only)
 */
import { verifyAuth } from '../../utils/auth'
import { execute, queryOne } from '../../utils/database'

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

        // Check if ticket exists
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

        // Delete ticket
        await execute(
            'DELETE FROM tickets WHERE id = ?',
            [id]
        );

        return { message: 'Ticket deleted successfully!' };
    } catch (error: any) {
        console.error('Error deleting ticket:', error);
        throw createError({
            statusCode: error.statusCode || 500,
            message: error.message || 'Error occurred while deleting the ticket.'
        });
    }
});
