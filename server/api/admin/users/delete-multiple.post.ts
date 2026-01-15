/**
 * POST /api/admin/users/delete-multiple
 * Delete multiple Firebase users (siteadmin only)
 */
import { defineEventHandler, readBody, createError } from 'h3'
import { getAuth } from 'firebase-admin/auth'
import { verifySiteAdmin } from '../../../utils/auth'
import { getFirebaseApp } from '../../../utils/firebase'

export default defineEventHandler(async (event) => {
  // Verify siteadmin access
  await verifySiteAdmin(event)
  
  const body = await readBody(event)
  const { uids } = body
  
  if (!uids || !Array.isArray(uids) || uids.length === 0) {
    throw createError({
      statusCode: 400,
      message: 'User IDs array is required'
    })
  }
  
  try {
    const app = getFirebaseApp()
    const auth = getAuth(app)
    
    const results = {
      deleted: [] as string[],
      failed: [] as { uid: string; error: string }[]
    }
    
    for (const uid of uids) {
      try {
        await auth.deleteUser(uid)
        results.deleted.push(uid)
        console.log(`✅ Admin deleted user: ${uid}`)
      } catch (err: any) {
        console.error(`❌ Failed to delete user ${uid}:`, err.message)
        results.failed.push({ uid, error: err.message })
      }
    }
    
    return { 
      success: true, 
      message: `Deleted ${results.deleted.length} of ${uids.length} users`,
      results
    }
  } catch (error: any) {
    console.error('❌ Error deleting users:', error)
    throw createError({
      statusCode: 500,
      message: error.message || 'Failed to delete users'
    })
  }
})
