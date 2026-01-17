/**
 * GET /api/tickets/admin/all
 * Get all tickets from all users (admin only)
 */
import { verifyAuth } from '../../../utils/auth'
import { query } from '../../../utils/database'

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

        // Get all tickets from all users
        const rows = await query<any>(
            'SELECT * FROM tickets ORDER BY createdAt DESC'
        );

        return rows;
    } catch (error: any) {
        console.error('Error retrieving all tickets:', error);
        throw createError({
            statusCode: error.statusCode || 500,
            message: error.message || 'Error occurred while retrieving tickets.'
        });
    }
});
