/**
 * POST /api/tickets
 * Create a new ticket
 */
import { verifyAuth } from '../../utils/auth'
import { execute } from '../../utils/database'

export default defineEventHandler(async (event) => {
    try {
        // Get authenticated user
        const user = await verifyAuth(event);

        // Get request body
        const body = await readBody(event);

        // Validate required fields
        if (!body.title || !body.description || !body.type || !body.priority) {
            throw createError({
                statusCode: 400,
                message: 'Title, description, type, and priority are required!'
            });
        }

        // Create ticket
        const result = await execute(
            `INSERT INTO tickets (userId, userEmail, userName, title, description, type, priority, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                user.uid,
                user.email,
                user.email, // userName - just use email for now
                body.title,
                body.description,
                body.type, // 'bug' or 'feature'
                body.priority, // 'nice-to-have', 'low', 'medium', 'high', 'critical'
                'submitted'
            ]
        );

        const newTicket = {
            id: result.insertId,
            userId: user.uid,
            userEmail: user.email,
            userName: user.email,
            title: body.title,
            description: body.description,
            type: body.type,
            priority: body.priority,
            status: 'submitted',
            createdAt: new Date(),
            updatedAt: new Date()
        };

        return newTicket;
    } catch (error: any) {
        console.error('Error creating ticket:', error);
        throw createError({
            statusCode: error.statusCode || 500,
            message: error.message || 'Error occurred while creating the ticket.'
        });
    }
});
