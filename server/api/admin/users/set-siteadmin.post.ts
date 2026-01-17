/**
 * POST /api/admin/users/set-siteadmin
 * Set or remove siteadmin claim (siteadmin only)
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
  const { uid, siteadmin } = body

  if (!uid) {
    throw createError({
      statusCode: 400,
      message: 'User ID is required'
    })
  }

  try {
    const app = getFirebaseApp()
    const auth = getAuth(app)

    const user = await auth.getUser(uid)
    const existingClaims = user.customClaims || {}

    const newClaims = { ...existingClaims }

    if (siteadmin === true) {
      newClaims.siteadmin = true
    } else {
      delete newClaims.siteadmin
    }

    await auth.setCustomUserClaims(uid, newClaims)
    console.log(`✅ Admin set siteadmin=${siteadmin} for: ${user.email}`)

    return {
      success: true,
      message: `Site admin ${siteadmin ? 'granted' : 'removed'}`
    }
  } catch (error: any) {
    console.error('❌ Error setting siteadmin:', error)
    throw createError({
      statusCode: 500,
      message: error.message || 'Failed to update user'
    })
  }
})
