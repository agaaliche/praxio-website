/**
 * POST /api/tickets/[id]/notes
 * Add note to ticket (user or admin)
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
        const { note } = body;

        if (!note) {
            throw createError({
                statusCode: 400,
                message: 'Note is required!'
            });
        }

        // Get ticket to check permissions
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

        // Check if user has permission (owner or site admin)
        if (ticket.userId !== user.uid && !user.isSiteAdmin) {
            throw createError({
                statusCode: 403,
                message: 'Forbidden: You do not have permission to add notes to this ticket!'
            });
        }

        // Parse existing notes or create new array
        let notes = [];
        if (ticket.notes) {
            try {
                notes = JSON.parse(ticket.notes);
            } catch (e) {
                notes = [];
            }
        }

        // Add new note
        const newNote = {
            userId: user.id,
            userEmail: user.email,
            userName: user.user_metadata?.full_name || user.user_metadata?.name || user.email,
            note: note,
            timestamp: new Date().toISOString()
        };
        notes.push(newNote);

        // Update ticket with new notes
        // Update ticket notes
        await execute(
            'UPDATE tickets SET notes = ?, updatedAt = NOW() WHERE id = ?',
            [JSON.stringify(notes), id]
        );

        // Get updated ticket
        const updatedTicket = await queryOne<any>(
            'SELECT * FROM tickets WHERE id = ?',
            [id]
        );

        return updatedTicket;
    } catch (error: any) {
        console.error('Error adding note:', error);
        throw createError({
            statusCode: error.statusCode || 500,
            message: error.message || 'Error occurred while adding note.'
        });
    }
});
