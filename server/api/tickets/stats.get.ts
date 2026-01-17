/**
 * GET /api/tickets/stats
 * Get ticket statistics (admin only)
 */
import { verifyAuth } from '../../utils/auth'
import { queryOne } from '../../utils/database'

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

        // Get statistics
        const stats = await queryOne<any>(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'submitted' THEN 1 ELSE 0 END) as submitted,
        SUM(CASE WHEN status = 'received' THEN 1 ELSE 0 END) as received,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resolved
      FROM tickets
    `);

        return stats || {
            total: 0,
            submitted: 0,
            received: 0,
            pending: 0,
            resolved: 0
        };
    } catch (error: any) {
        console.error('Error retrieving ticket stats:', error);
        throw createError({
            statusCode: error.statusCode || 500,
            message: error.message || 'Error occurred while retrieving ticket statistics.'
        });
    }
});
