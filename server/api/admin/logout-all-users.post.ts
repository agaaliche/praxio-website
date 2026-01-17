/**
 * POST /api/admin/logout-all-users
 * Force logout all users (siteadmin only)
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
  checkRateLimit(event, admin.uid, RateLimits.DANGEROUS)

  try {
    const app = getFirebaseApp()
    const auth = getAuth(app)

    const listUsersResult = await auth.listUsers(1000)
    let count = 0

    for (const user of listUsersResult.users) {
      // Skip the current admin
      if (user.uid === admin.uid) continue
      await auth.revokeRefreshTokens(user.uid)
      count++
    }

    console.log(`✅ Admin revoked tokens for ${count} users`)

    return { success: true, message: `Logged out ${count} users` }
  } catch (error: any) {
    console.error('❌ Error logging out all users:', error)
    throw createError({
      statusCode: 500,
      message: error.message || 'Failed to logout users'
    })
  }
})
