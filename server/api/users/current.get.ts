/**
 * GET /api/users/current
 * Get current user's profile
 * If user doesn't exist in database, creates a new profile (like inrManager)
 */
import { query, queryOne, execute } from '../../utils/database'
import { verifyAuth, getEffectiveAccountOwnerId } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  try {
    const user = await verifyAuth(event)
    const accountOwnerId = getEffectiveAccountOwnerId(user)
    
    // If user has a role, they're an invited user - get from authorized_users
    if (user.role) {
      const authorizedUser = await queryOne<any>(
        `SELECT id, email, first_name, last_name, role, status, last_access, created_at
         FROM authorized_users 
         WHERE account_owner_id = ? AND email = ? AND status = 'active'`,
        [accountOwnerId, user.email]
      )
      
      if (!authorizedUser) {
        throw createError({
          statusCode: 404,
          message: 'User not found'
        })
      }
      
      // Also get the account owner's organization info
      const owner = await queryOne<any>(
        `SELECT organizationName, organizationType, address, city, country
         FROM users WHERE userId = ?`,
        [accountOwnerId]
      )
      
      return {
        id: authorizedUser.id,
        email: authorizedUser.email,
        firstName: authorizedUser.first_name,
        lastName: authorizedUser.last_name,
        role: authorizedUser.role,
        status: authorizedUser.status,
        organization: owner ? {
          name: owner.organizationName,
          type: owner.organizationType,
          address: owner.address,
          city: owner.city,
          country: owner.country
        } : null
      }
    }
    
    // Account owner - get from users table
    let userRecord = await queryOne<any>(
      `SELECT userId, userEmail, userName, userLastName, organizationName, organizationType,
              address, city, country, postalCode, telephone, fax, phoneNumber,
              stripeCustomerId, subscriptionId, subscriptionStatus, subscriptionPriceId,
              subscriptionEndDate, nextBillingDate, trialStartDate, trialEndDate,
              scheduledPriceId, scheduledChangeDate
       FROM users WHERE userId = ?`,
      [user.uid]
    )
    
    // If user doesn't exist, create a new profile (like inrManager)
    if (!userRecord) {
      console.log(`ℹ️ Creating new user profile for ${user.uid} (${user.email})`)
      
      // Parse display name into first/last name if available
      const displayName = '' // Would need to get this from request header or Firebase
      const userName = displayName?.split(' ')[0] || null
      const userLastName = displayName?.split(' ').slice(1).join(' ') || null
      
      await execute(
        `INSERT INTO users (userId, userEmail, userName, userLastName, createdAt, updatedAt) 
         VALUES (?, ?, ?, ?, NOW(), NOW())`,
        [user.uid, user.email, userName, userLastName]
      )
      
      console.log(`✅ Created new user: ${user.uid} (${user.email})`)
      
      // Fetch the newly created user
      userRecord = await queryOne<any>(
        `SELECT userId, userEmail, userName, userLastName, organizationName, organizationType,
                address, city, country, postalCode, telephone, fax, phoneNumber,
                stripeCustomerId, subscriptionId, subscriptionStatus, subscriptionPriceId,
                subscriptionEndDate, nextBillingDate, trialStartDate, trialEndDate,
                scheduledPriceId, scheduledChangeDate
         FROM users WHERE userId = ?`,
        [user.uid]
      )
    }
    
    return {
      id: userRecord.userId,
      email: userRecord.userEmail,
      firstName: userRecord.userName,
      lastName: userRecord.userLastName,
      phoneNumber: userRecord.phoneNumber,
      role: null, // Account owner has no role
      organization: {
        name: userRecord.organizationName,
        type: userRecord.organizationType,
        address: userRecord.address,
        city: userRecord.city,
        country: userRecord.country,
        postalCode: userRecord.postalCode,
        telephone: userRecord.telephone,
        fax: userRecord.fax
      },
      subscription: {
        customerId: userRecord.stripeCustomerId,
        subscriptionId: userRecord.subscriptionId,
        status: userRecord.subscriptionStatus,
        priceId: userRecord.subscriptionPriceId,
        endDate: userRecord.subscriptionEndDate,
        nextBillingDate: userRecord.nextBillingDate,
        trialStartDate: userRecord.trialStartDate,
        trialEndDate: userRecord.trialEndDate,
        scheduledPriceId: userRecord.scheduledPriceId,
        scheduledChangeDate: userRecord.scheduledChangeDate
      }
    }
  } catch (error: any) {
    console.error('GET /api/users/current error:', error)
    throw error
  }
})
