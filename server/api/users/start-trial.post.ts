/**
 * Start Free Trial API
 * POST /api/users/start-trial
 * 
 * Starts a 14-day free trial for the authenticated user.
 * Only available if user has never had a trial before.
 */

import { execute, queryOne } from '../../utils/database'
import { verifyAuth } from '../../utils/auth'
import { initializeTrialPeriod } from '../../services/subscription'

export default defineEventHandler(async (event) => {
  try {
    // Get authenticated user
    const user = await verifyAuth(event)
    
    if (!user?.uid) {
      throw createError({
        statusCode: 401,
        message: 'Authentication required'
      })
    }
    
    // Check if user exists and hasn't started a trial before
    const userRecord = await queryOne<{
      userId: string
      trialStartDate: string | null
      trialEndDate: string | null
      subscriptionId: string | null
      subscriptionStatus: string | null
    }>(
      'SELECT userId, trialStartDate, trialEndDate, subscriptionId, subscriptionStatus FROM users WHERE userId = ?',
      [user.uid]
    )

    if (!userRecord) {
      throw createError({
        statusCode: 404,
        message: 'User not found'
      })
    }

    // Check if user already had a trial
    if (userRecord.trialStartDate) {
      throw createError({
        statusCode: 400,
        message: 'You have already used your free trial'
      })
    }

    // Check if user already has an active subscription
    if (userRecord.subscriptionId && ['active', 'trialing'].includes(userRecord.subscriptionStatus || '')) {
      throw createError({
        statusCode: 400,
        message: 'You already have an active subscription'
      })
    }

    // Initialize trial period
    const { trialStartDate, trialEndDate, planType } = initializeTrialPeriod()

    // Update user with trial dates
    await execute(
      `UPDATE users SET 
        trialStartDate = ?, 
        trialEndDate = ?, 
        planType = ?,
        updatedAt = NOW()
       WHERE userId = ?`,
      [trialStartDate, trialEndDate, planType, user.uid]
    )

    return {
      success: true,
      message: 'Free trial started successfully',
      trialStartDate: trialStartDate.toISOString(),
      trialEndDate: trialEndDate.toISOString(),
      planType
    }
  } catch (error: any) {
    console.error('❌ Start trial error:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      message: 'Failed to start trial'
    })
  }
})
