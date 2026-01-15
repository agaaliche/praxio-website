/**
 * POST /api/admin/give-free-month
 * Give free month(s) to a user (siteadmin only)
 */
import { defineEventHandler, readBody, createError } from 'h3'
import { verifySiteAdmin } from '../../utils/auth'
import { execute, query } from '../../utils/database'

export default defineEventHandler(async (event) => {
  // Verify siteadmin access
  const admin = await verifySiteAdmin(event)
  
  const body = await readBody(event)
  const { uid, months, reason } = body
  
  if (!uid || !months) {
    throw createError({
      statusCode: 400,
      message: 'User ID and months are required'
    })
  }
  
  try {
    // Update subscription or trial end date
    await execute(
      `UPDATE users 
       SET trialEndDate = DATE_ADD(COALESCE(trialEndDate, NOW()), INTERVAL ? MONTH),
           subscriptionStatus = 'trial'
       WHERE userId = ?`,
      [months, uid]
    )
    
    // Get user email for logging
    const users = await query<any>('SELECT userEmail FROM users WHERE userId = ?', [uid])
    const userEmail = users[0]?.userEmail || uid
    
    // Log the free month
    try {
      await execute(
        `INSERT INTO admin_trial_history (type, email, amount, reason, admin_email, created_at)
         VALUES ('free_month', ?, ?, ?, ?, NOW())`,
        [userEmail, `${months} month(s)`, reason || '', admin.email]
      )
    } catch (logError) {
      // Table might not exist - continue anyway
      console.warn('Could not log free month:', logError)
    }
    
    console.log(`✅ Admin gave ${months} free month(s) to: ${userEmail}`)
    
    return { success: true, message: 'Free month granted' }
  } catch (error: any) {
    console.error('❌ Error giving free month:', error)
    throw createError({
      statusCode: 500,
      message: error.message || 'Failed to give free month'
    })
  }
})
