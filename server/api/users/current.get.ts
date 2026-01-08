/**
 * GET /api/users/current
 * Get current user's profile
 * If user doesn't exist in database, creates a new profile (like inrManager)
 */
import { defineEventHandler, createError } from 'h3'
import Stripe from 'stripe'
import { query, queryOne, execute } from '../../utils/database'
import { verifyAuth, getEffectiveAccountOwnerId } from '../../utils/auth'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia' as any
})

export default defineEventHandler(async (event) => {
  try {
    const user = await verifyAuth(event)
    
    // IMPORTANT: Check authorized_users FIRST before users table
    // Invited users exist in BOTH tables (users profile created during magic link signup)
    // but their role is in authorized_users, so that takes precedence
    const accountOwnerId = getEffectiveAccountOwnerId(user)
    
    const authorizedUser = await queryOne<any>(
      `SELECT id, email, first_name, last_name, role, status, account_owner_id, updated_at
       FROM authorized_users 
       WHERE account_owner_id = ? AND email = ? AND status = 'active'`,
      [accountOwnerId, user.email]
    )
    
    if (authorizedUser) {
      // Found in authorized_users - they're an invited team member
      // Handle this case first before checking users table
      
      // Check if role in database differs from token role
      // To prevent infinite loop, only report roleChanged if:
      // 1. Token has a role (not first login)
      // 2. Database role differs from token role
      // 3. Role was recently updated (within last 5 minutes) to catch legitimate changes
      const tokenRole = user.role
      const dbRole = authorizedUser.role
      const rolesDiffer = tokenRole && dbRole !== tokenRole
      
      // Check if role was recently updated (within 5 minutes)
      // This prevents reporting roleChanged on every request after token refresh
      const roleRecentlyUpdated = authorizedUser.updated_at 
        ? (Date.now() - new Date(authorizedUser.updated_at).getTime()) < 5 * 60 * 1000
        : false
      
      const roleChanged = rolesDiffer && roleRecentlyUpdated
      
      console.log('🔍 Invited user detected:', {
        tokenRole,
        dbRole,
        rolesDiffer,
        roleRecentlyUpdated,
        roleChanged,
        updatedAt: authorizedUser.updated_at,
        email: user.email
      })
      
      // Get the account owner's organization info and subscription
      const owner = await queryOne<any>(
        `SELECT organizationName, organizationType, address, city, country,
                stripeCustomerId, subscriptionId, subscriptionStatus, subscriptionPriceId,
                subscriptionEndDate, nextBillingDate, trialStartDate, trialEndDate,
                scheduledPriceId, scheduledChangeDate, preferences
         FROM users WHERE userId = ?`,
        [authorizedUser.account_owner_id]
      )
      
      // Check Stripe for cancel_at_period_end flag if there's a subscription
      let effectiveStatus = owner?.subscriptionStatus
      if (owner?.subscriptionId) {
        try {
          const stripeSubscription = await stripe.subscriptions.retrieve(owner.subscriptionId)
          if (stripeSubscription.cancel_at_period_end) {
            effectiveStatus = 'canceling'
          }
        } catch (err) {
          console.error('Failed to fetch Stripe subscription for invited user:', err)
        }
      }
      
      // Authorized users inherit preferences from account owner
      let preferences = { language: 'en' }
      if (owner?.preferences) {
        try {
          preferences = typeof owner.preferences === 'string'
            ? JSON.parse(owner.preferences)
            : owner.preferences
        } catch (e) {
          console.error('Failed to parse preferences:', e)
        }
      }
      
      return {
        id: authorizedUser.id,
        email: authorizedUser.email,
        firstName: authorizedUser.first_name,
        lastName: authorizedUser.last_name,
        role: authorizedUser.role,
        status: authorizedUser.status,
        roleChanged,
        updatedAt: authorizedUser.updated_at, // Include timestamp for frontend tracking
        preferences,
        organization: owner ? {
          name: owner.organizationName,
          type: owner.organizationType,
          address: owner.address,
          city: owner.city,
          country: owner.country
        } : null,
        subscription: owner ? {
          customerId: owner.stripeCustomerId,
          subscriptionId: owner.subscriptionId,
          status: effectiveStatus,
          priceId: owner.subscriptionPriceId,
          endDate: owner.subscriptionEndDate,
          nextBillingDate: owner.nextBillingDate,
          trialStartDate: owner.trialStartDate,
          trialEndDate: owner.trialEndDate,
          scheduledPriceId: owner.scheduledPriceId,
          scheduledChangeDate: owner.scheduledChangeDate
        } : null
      }
    }
    
    // Not found in authorized_users, check if user exists in users table (account owner)
    let userRecord = await queryOne<any>(
      `SELECT userId, userEmail, userName, userLastName, organizationName, organizationType,
              address, city, country, postalCode, telephone, fax, phoneNumber,
              stripeCustomerId, subscriptionId, subscriptionStatus, subscriptionPriceId,
              subscriptionEndDate, nextBillingDate, trialStartDate, trialEndDate,
              scheduledPriceId, scheduledChangeDate, preferences
       FROM users WHERE userId = ?`,
      [user.uid]
    )
    
    // If found in users table, they're an account owner - return their data
    if (userRecord) {
      // Check Stripe for cancel_at_period_end flag if there's a subscription
      let effectiveStatus = userRecord.subscriptionStatus
      if (userRecord.subscriptionId) {
        try {
          const stripeSubscription = await stripe.subscriptions.retrieve(userRecord.subscriptionId)
          if (stripeSubscription.cancel_at_period_end) {
            effectiveStatus = 'canceling'
          }
        } catch (err) {
          console.error('Failed to fetch Stripe subscription for account owner:', err)
        }
      }
      
      // Parse preferences JSON
      let preferences = { language: 'en' }
      if (userRecord.preferences) {
        try {
          preferences = typeof userRecord.preferences === 'string'
            ? JSON.parse(userRecord.preferences)
            : userRecord.preferences
        } catch (e) {
          console.error('Failed to parse preferences:', e)
        }
      }
      
      return {
        id: userRecord.userId,
        email: userRecord.userEmail,
        firstName: userRecord.userName,
        lastName: userRecord.userLastName,
        role: null, // Account owners never have a role
        organizationName: userRecord.organizationName,
        organizationType: userRecord.organizationType,
        address: userRecord.address,
        city: userRecord.city,
        country: userRecord.country,
        postalCode: userRecord.postalCode,
        telephone: userRecord.telephone,
        fax: userRecord.fax,
        phoneNumber: userRecord.phoneNumber,
        preferences,
        subscription: {
          customerId: userRecord.stripeCustomerId,
          subscriptionId: userRecord.subscriptionId,
          status: effectiveStatus,
          priceId: userRecord.subscriptionPriceId,
          endDate: userRecord.subscriptionEndDate,
          nextBillingDate: userRecord.nextBillingDate,
          trialStartDate: userRecord.trialStartDate,
          trialEndDate: userRecord.trialEndDate,
          scheduledPriceId: userRecord.scheduledPriceId,
          scheduledChangeDate: userRecord.scheduledChangeDate
        }
      }
    }
    
    // If we get here, user not found in either table (already checked authorized_users at the top)
    // Create a new account owner profile
    console.log(`ℹ️ Creating new user profile for ${user.uid} (${user.email})`)
    
    // Get display name from Firebase user (set during signup)
    const displayName = user.displayName || ''
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
                scheduledPriceId, scheduledChangeDate, preferences
         FROM users WHERE userId = ?`,
        [user.uid]
      )
    
    if (!userRecord) {
      throw createError({
        statusCode: 500,
        message: 'Failed to create user profile'
      })
    }
    
    // Parse preferences JSON for newly created user
    let preferences = { language: 'en' }
    if (userRecord.preferences) {
      try {
        preferences = typeof userRecord.preferences === 'string'
          ? JSON.parse(userRecord.preferences)
          : userRecord.preferences
      } catch (e) {
        console.error('Failed to parse preferences:', e)
      }
    }
    
    // Return newly created account owner
    return {
      id: userRecord.userId,
      email: userRecord.userEmail,
      firstName: userRecord.userName,
      lastName: userRecord.userLastName,
      role: null, // Account owners never have a role
      organizationName: userRecord.organizationName,
      organizationType: userRecord.organizationType,
      address: userRecord.address,
      city: userRecord.city,
      country: userRecord.country,
      postalCode: userRecord.postalCode,
      telephone: userRecord.telephone,
      fax: userRecord.fax,
      phoneNumber: userRecord.phoneNumber,
      preferences,
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
