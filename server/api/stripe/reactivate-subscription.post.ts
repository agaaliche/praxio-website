/**
 * POST /api/stripe/reactivate-subscription
 * Undo subscription cancellation (set cancel_at_period_end = false)
 */
import Stripe from 'stripe'
import { queryOne, execute } from '../../utils/database'
import { verifyAuth } from '../../utils/auth'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia'
})

export default defineEventHandler(async (event) => {
  try {
    const user = await verifyAuth(event)

    // Get user's subscription from database
    const userRecord = await queryOne<{ 
      subscriptionId: string | null
      subscriptionStatus: string | null
    }>(
      'SELECT subscriptionId, subscriptionStatus FROM users WHERE userId = ?',
      [user.uid]
    )

    if (!userRecord?.subscriptionId) {
      throw createError({ statusCode: 400, message: 'No subscription found' })
    }

    // Check if subscription is actually pending cancellation
    const currentSubscription = await stripe.subscriptions.retrieve(userRecord.subscriptionId)
    
    if (!currentSubscription.cancel_at_period_end) {
      throw createError({ statusCode: 400, message: 'Subscription is not scheduled for cancellation' })
    }

    // Reactivate subscription by removing cancel_at_period_end
    const subscription = await stripe.subscriptions.update(userRecord.subscriptionId, {
      cancel_at_period_end: false
    })

    // Update database to reflect active status
    await execute(
      `UPDATE users SET 
        subscriptionStatus = 'active'
       WHERE userId = ?`,
      [user.uid]
    )

    return {
      success: true,
      message: 'Subscription reactivated successfully',
      status: subscription.status,
      currentPeriodEnd: subscription.current_period_end 
        ? new Date(subscription.current_period_end * 1000).toISOString() 
        : null
    }
  } catch (error: any) {
    console.error('Error reactivating subscription:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to reactivate subscription'
    })
  }
})
