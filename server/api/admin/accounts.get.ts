/**
 * GET /api/admin/accounts
 * Get accounts with additional data (siteadmin only)
 */
import { defineEventHandler, createError } from 'h3'
import { verifySiteAdmin } from '../../utils/auth'
import { query } from '../../utils/database'

export default defineEventHandler(async (event) => {
  // Verify siteadmin access
  await verifySiteAdmin(event)
  
  try {
    // Get users from database with all relevant fields
    const users = await query<any>(
      `SELECT 
        u.userId as id,
        u.userEmail as owner_email,
        CONCAT(COALESCE(u.userName, ''), ' ', COALESCE(u.userLastName, '')) as name,
        u.subscriptionStatus as subscription_status,
        u.planType as plan,
        u.trialEndDate as trial_ends_at,
        u.createdAt as created_at,
        (SELECT COUNT(*) FROM patients WHERE userId = u.userId) as patient_count
       FROM users u
       ORDER BY u.createdAt DESC`
    )
    
    const accounts = users.map((u: any) => ({
      id: u.id,
      name: u.name?.trim() || null,
      owner_email: u.owner_email,
      patient_count: u.patient_count || 0,
      plan: u.plan || 'free',
      subscription_status: u.subscription_status,
      trial_ends_at: u.trial_ends_at,
      created_at: u.created_at
    }))
    
    return { accounts }
  } catch (error: any) {
    console.error('❌ Error getting accounts:', error)
    throw createError({
      statusCode: 500,
      message: error.message || 'Failed to get accounts'
    })
  }
})
