/**
 * POST /api/admin/logout-user
 * Force logout a user by revoking their refresh tokens (siteadmin only)
 */
import { defineEventHandler, readBody, createError } from 'h3'
import { getAuth } from 'firebase-admin/auth'
import { verifySiteAdmin } from '../../utils/auth'
import { getFirebaseApp } from '../../utils/firebase'
import { checkRateLimit, RateLimits } from '../../utils/rateLimit'

export default defineEventHandler(async (event) => {
  // Verify siteadmin access
  const admin = await verifySiteAdmin(event)

  // Rate limiting
  checkRateLimit(event, admin.uid, RateLimits.DANGEROUS)

  const body = await readBody(event)
  const { uid } = body

  if (!uid) {
    throw createError({
      statusCode: 400,
      message: 'User ID is required'
    })
  }

  try {
    const app = getFirebaseApp()
    const auth = getAuth(app)

    await auth.revokeRefreshTokens(uid)
    console.log(`✅ Admin revoked tokens for: ${uid}`)

    return { success: true, message: 'User logged out' }
  } catch (error: any) {
    console.error('❌ Error logging out user:', error)
    throw createError({
      statusCode: 500,
      message: error.message || 'Failed to logout user'
    })
  }
})
