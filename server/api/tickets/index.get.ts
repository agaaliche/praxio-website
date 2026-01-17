/**
 * GET /api/tickets
 * Get all tickets for the current user
 */
import { verifyAuth } from '../../utils/auth'
import { query } from '../../utils/database'

export default defineEventHandler(async (event) => {
    try {
        // Get authenticated user
        const user = await verifyAuth(event);

        // Get user's tickets
        const rows = await query<any>(
            'SELECT * FROM tickets WHERE userId = ? ORDER BY createdAt DESC',
            [user.uid]
        );

        return rows;
    } catch (error: any) {
        console.error('Error retrieving tickets:', error);
        throw createError({
            statusCode: error.statusCode || 500,
            message: error.message || 'Error occurred while retrieving tickets.'
        });
    }
});
