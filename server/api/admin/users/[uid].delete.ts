/**
 * DELETE /api/admin/users/:uid
 * Delete a Firebase user (siteadmin only)
 */
import { defineEventHandler, createError } from 'h3'
import { getAuth } from 'firebase-admin/auth'
import { verifySiteAdmin } from '../../../utils/auth'
import { getFirebaseApp } from '../../../utils/firebase'

export default defineEventHandler(async (event) => {
  // Verify siteadmin access
  await verifySiteAdmin(event)
  
  const uid = event.context.params?.uid
  
  if (!uid) {
    throw createError({
      statusCode: 400,
      message: 'User ID is required'
    })
  }
  
  try {
    const app = getFirebaseApp()
    const auth = getAuth(app)
    
    await auth.deleteUser(uid)
    console.log(`✅ Admin deleted user: ${uid}`)
    
    return { success: true, message: 'User deleted successfully' }
  } catch (error: any) {
    console.error('❌ Error deleting user:', error)
    throw createError({
      statusCode: 500,
      message: error.message || 'Failed to delete user'
    })
  }
})
