/**
 * POST /api/stripe/cancel-subscription
 * Cancel subscription at end of billing period (sets cancel_at_period_end = true)
 */
import { defineEventHandler, createError } from 'h3'
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
      nextBillingDate: string | null 
    }>(
      'SELECT subscriptionId, nextBillingDate FROM users WHERE userId = ?',
      [user.uid]
    )

    if (!userRecord?.subscriptionId) {
      throw createError({ statusCode: 400, message: 'No active subscription found' })
    }

    // Cancel at end of billing period (don't cancel immediately)
    const subscription = await stripe.subscriptions.update(userRecord.subscriptionId, {
      cancel_at_period_end: true
    })

    // Update database to reflect cancellation status
    await execute(
      `UPDATE users SET 
        subscriptionStatus = 'canceling'
       WHERE userId = ?`,
      [user.uid]
    )

    return {
      success: true,
      message: 'Subscription will be canceled at end of billing period',
      cancelAt: subscription.cancel_at ? new Date(subscription.cancel_at * 1000).toISOString() : null,
      currentPeriodEnd: subscription.current_period_end 
        ? new Date(subscription.current_period_end * 1000).toISOString() 
        : null
    }
  } catch (error: any) {
    console.error('Error canceling subscription:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to cancel subscription'
    })
  }
})
