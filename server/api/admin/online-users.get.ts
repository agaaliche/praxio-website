/**
 * GET /api/admin/online-users
 * Get recently active users (siteadmin only)
 */
import { defineEventHandler, createError } from 'h3'
import { getAuth } from 'firebase-admin/auth'
import { verifySiteAdmin } from '../../utils/auth'
import { getFirebaseApp } from '../../utils/firebase'

export default defineEventHandler(async (event) => {
  // Verify siteadmin access
  await verifySiteAdmin(event)
  
  try {
    const app = getFirebaseApp()
    const auth = getAuth(app)
    
    // Get users who signed in within the last hour
    const listUsersResult = await auth.listUsers(100)
    const hourAgo = new Date(Date.now() - 60 * 60 * 1000)
    
    const recentUsers = listUsersResult.users
      .filter(user => {
        if (!user.metadata?.lastSignInTime) return false
        const lastSignIn = new Date(user.metadata.lastSignInTime)
        return lastSignIn > hourAgo
      })
      .map(user => ({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        lastActivity: user.metadata?.lastSignInTime
      }))
    
    return { users: recentUsers }
  } catch (error: any) {
    console.error('❌ Error getting online users:', error)
    throw createError({
      statusCode: 500,
      message: error.message || 'Failed to get online users'
    })
  }
})
