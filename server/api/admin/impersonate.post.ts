/**
 * POST /api/admin/impersonate
 * Start impersonation session (siteadmin only)
 */
import { defineEventHandler, readBody, createError } from 'h3'
import { getAuth } from 'firebase-admin/auth'
import { verifySiteAdmin } from '../../utils/auth'
import { getFirebaseApp } from '../../utils/firebase'
import { execute } from '../../utils/database'
import { checkRateLimit, RateLimits } from '../../utils/rateLimit'

export default defineEventHandler(async (event) => {
  // Verify siteadmin access
  const admin = await verifySiteAdmin(event)

  // Rate limiting
  checkRateLimit(event, admin.uid, RateLimits.DANGEROUS)

  const body = await readBody(event)
  const { targetEmail, reason } = body

  if (!targetEmail || !reason) {
    throw createError({
      statusCode: 400,
      message: 'Target email and reason are required'
    })
  }

  try {
    const app = getFirebaseApp()
    const auth = getAuth(app)

    // Get target user
    const targetUser = await auth.getUserByEmail(targetEmail)

    // Create a custom token for the target user (with impersonation flag)
    const customToken = await auth.createCustomToken(targetUser.uid, {
      impersonating: true,
      originalAdmin: admin.uid
    })

    // Log the impersonation
    try {
      await execute(
        `INSERT INTO admin_impersonation_log (admin_uid, admin_email, target_uid, target_email, reason, started_at)
         VALUES (?, ?, ?, ?, ?, NOW())`,
        [admin.uid, admin.email, targetUser.uid, targetEmail, reason]
      )
    } catch (logError) {
      // Table might not exist - continue anyway
      console.warn('Could not log impersonation:', logError)
    }

    console.log(`✅ Admin ${admin.email} started impersonation of: ${targetEmail}`)

    return {
      success: true,
      token: customToken,
      targetUserId: targetUser.uid
    }
  } catch (error: any) {
    console.error('❌ Error starting impersonation:', error)
    throw createError({
      statusCode: 500,
      message: error.message || 'Failed to start impersonation'
    })
  }
})
