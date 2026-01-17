/**
 * DELETE /api/admin/users/:uid
 * Delete a Firebase user (siteadmin only)
 */
import { defineEventHandler, createError } from 'h3'
import { getAuth } from 'firebase-admin/auth'
import { verifySiteAdmin } from '../../../utils/auth'
import { getFirebaseApp } from '../../../utils/firebase'
import { checkRateLimit, RateLimits } from '../../../utils/rateLimit'
import { execute, query } from '../../../utils/database'

export default defineEventHandler(async (event) => {
  // Verify siteadmin access
  const admin = await verifySiteAdmin(event)

  // Rate limiting
  checkRateLimit(event, admin.uid, RateLimits.DANGEROUS)

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

    // Get user email before deleting (for logging)
    let userEmail = uid
    try {
      const userRecord = await auth.getUser(uid)
      userEmail = userRecord.email || uid
    } catch (e) {
      // User might not exist in Firebase, continue with DB cleanup
    }

    // Delete from Firebase first
    try {
      await auth.deleteUser(uid)
      console.log(`✅ Admin deleted Firebase user: ${userEmail}`)
    } catch (error: any) {
      if (error.code !== 'auth/user-not-found') {
        throw error
      }
      console.log(`⚠️  Firebase user not found, continuing with DB cleanup: ${uid}`)
    }

    // Delete user data from database
    // 1. Check if this is an account owner (in users table)
    const [userRows] = await query('SELECT userId FROM users WHERE userId = ?', [uid])

    if (userRows && userRows.length > 0) {
      console.log(`🗑️  Deleting account owner data for: ${userEmail}`)

      // Delete patients and all related data
      await execute('DELETE FROM patients WHERE userId = ?', [uid])

      // Delete user record
      await execute('DELETE FROM users WHERE userId = ?', [uid])

      console.log(`✅ Deleted account owner and all related data`)
    }

    // 2. Check if this is a team member (in authorized_users table)
    const [authRows] = await query('SELECT id FROM authorized_users WHERE account_owner_id = ?', [uid])

    if (authRows && authRows.length > 0) {
      await execute('DELETE FROM authorized_users WHERE account_owner_id = ?', [uid])
      console.log(`✅ Deleted ${authRows.length} authorized_users record(s)`)
    }

    // 3. Delete tickets
    const [ticketRows] = await query('SELECT id FROM tickets WHERE userId = ?', [uid])
    if (ticketRows && ticketRows.length > 0) {
      await execute('DELETE FROM tickets WHERE userId = ?', [uid])
      console.log(`✅ Deleted ${ticketRows.length} ticket(s)`)
    }

    // 4. Delete admin messages
    const [messageRows] = await query('SELECT id FROM admin_messages WHERE target_uid = ?', [uid])
    if (messageRows && messageRows.length > 0) {
      await execute('DELETE FROM admin_messages WHERE target_uid = ?', [uid])
      console.log(`✅ Deleted ${messageRows.length} admin message(s)`)
    }

    return {
      success: true,
      message: 'User and all associated data deleted successfully',
      deleted: {
        firebase: true,
        users: userRows?.length || 0,
        authorizedUsers: authRows?.length || 0,
        tickets: ticketRows?.length || 0,
        messages: messageRows?.length || 0
      }
    }
  } catch (error: any) {
    console.error('❌ Error deleting user:', error)
    throw createError({
      statusCode: 500,
      message: error.message || 'Failed to delete user'
    })
  }
})
