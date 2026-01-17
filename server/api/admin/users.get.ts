/**
 * GET /api/admin/users
 * List all Firebase users (siteadmin only)
 */
import { defineEventHandler, createError } from 'h3'
import { getAuth } from 'firebase-admin/auth'
import { verifySiteAdmin } from '../../utils/auth'
import { getFirebaseApp } from '../../utils/firebase'
import { checkRateLimit, RateLimits } from '../../utils/rateLimit'

export default defineEventHandler(async (event) => {
    // Verify siteadmin access
    const admin = await verifySiteAdmin(event)

    // Rate limiting
    checkRateLimit(event, admin.uid, RateLimits.READ)

    try {
        const app = getFirebaseApp()
        const auth = getAuth(app)

        const listUsersResult = await auth.listUsers(1000)
        const users = listUsersResult.users.map(user => ({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            emailVerified: user.emailVerified,
            disabled: user.disabled,
            metadata: user.metadata,
            customClaims: user.customClaims
        }))

        return { users }
    } catch (error: any) {
        console.error('❌ Error listing users:', error)
        throw createError({
            statusCode: 500,
            message: error.message || 'Failed to list users'
        })
    }
})
