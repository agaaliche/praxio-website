/**
 * POST /api/admin/exit-impersonation
 * Exit impersonation and return a token for the original admin
 */
import { getFirebaseAdmin } from '../../utils/firebase-admin'
import { verifyAuth } from '../../utils/auth'

export default defineEventHandler(async (event) => {
    try {
        // Verify authentication
        const currentUser = await verifyAuth(event)

        // Check if currently impersonating
        const claims = currentUser.customClaims || {}
        if (!claims.impersonating) {
            throw createError({
                statusCode: 400,
                message: 'Not currently impersonating'
            })
        }

        // Get original admin UID from claims
        const originalAdminUid = claims.originalAdmin as string
        if (!originalAdminUid) {
            throw createError({
                statusCode: 400,
                message: 'Original admin UID not found in claims'
            })
        }

        // Create a new custom token for the original admin (without impersonation claims)
        const admin = getFirebaseAdmin()
        const token = await admin.auth().createCustomToken(originalAdminUid)

        console.log('✅ Exit impersonation: Created token for original admin', originalAdminUid)

        return {
            success: true,
            token
        }

    } catch (error: any) {
        console.error('❌ Error exiting impersonation:', error)
        throw createError({
            statusCode: error.statusCode || 500,
            message: error.message || 'Failed to exit impersonation'
        })
    }
})
