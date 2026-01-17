/**
 * GET /api/admin/online-users
 * Get recently active users (siteadmin only)
 */
import { defineEventHandler, createError } from 'h3'
import { getAuth } from 'firebase-admin/auth'
import { verifySiteAdmin } from '../../utils/auth'
import { getFirebaseApp } from '../../utils/firebase'
import { checkRateLimit, RateLimits } from '../../utils/rateLimit'
import { query } from '../../utils/database'

export default defineEventHandler(async (event) => {
  // Verify siteadmin access
  const admin = await verifySiteAdmin(event)

  // Rate limiting
  checkRateLimit(event, admin.uid, RateLimits.READ)

  try {
    const app = getFirebaseApp()
    const auth = getAuth(app)

    // Get users with active sessions in the last 15 minutes
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000)
    const sessionsResult = await query(
      `SELECT userId, MAX(lastActiveTime) as lastActivity
       FROM sessions
       WHERE isRevoked = FALSE 
         AND lastActiveTime > ?
       GROUP BY userId`,
      [fifteenMinutesAgo]
    )

    if (!sessionsResult || sessionsResult.length === 0) {
      return { users: [] }
    }

    // Get user details from Firebase for each active session
    const users = await Promise.all(
      sessionsResult.map(async (session: any) => {
        try {
          const userRecord = await auth.getUser(session.userId)
          return {
            uid: userRecord.uid,
            email: userRecord.email,
            displayName: userRecord.displayName,
            photoURL: userRecord.photoURL,
            lastActivity: session.lastActivity
          }
        } catch (error) {
          console.error(`Failed to get user ${session.userId}:`, error)
          return null
        }
      })
    )

    // Filter out any null entries (users that couldn't be fetched)
    const validUsers = users.filter(user => user !== null)

    return { users: validUsers }
  } catch (error: any) {
    console.error('❌ Error getting online users:', error)
    throw createError({
      statusCode: 500,
      message: error.message || 'Failed to get online users'
    })
  }
})
