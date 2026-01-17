/**
 * POST /api/admin/users/toggle-disabled
 * Toggle user disabled status (siteadmin only)
 */
import { defineEventHandler, readBody, createError } from 'h3'
import { getAuth } from 'firebase-admin/auth'
import { verifySiteAdmin } from '../../../utils/auth'
import { getFirebaseApp } from '../../../utils/firebase'
import { checkRateLimit, RateLimits } from '../../../utils/rateLimit'

export default defineEventHandler(async (event) => {
  // Verify siteadmin access
  const admin = await verifySiteAdmin(event)

  // Rate limiting
  checkRateLimit(event, admin.uid, RateLimits.DANGEROUS)

  const body = await readBody(event)
  const { uid, disabled } = body

  if (!uid) {
    throw createError({
      statusCode: 400,
      message: 'User ID is required'
    })
  }

  try {
    const app = getFirebaseApp()
    const auth = getAuth(app)

    await auth.updateUser(uid, { disabled: disabled === true })
    console.log(`✅ Admin set disabled=${disabled} for: ${uid}`)

    return {
      success: true,
      message: `Account ${disabled ? 'disabled' : 'enabled'}`
    }
  } catch (error: any) {
    console.error('❌ Error toggling disabled:', error)
    throw createError({
      statusCode: 500,
      message: error.message || 'Failed to update user'
    })
  }
})
