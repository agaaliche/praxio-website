/**
 * POST /api/stripe/schedule-change
 * Schedule a plan change at the end of the current billing period
 * Used when upgrading from monthly to annual
 */
import Stripe from 'stripe'
import { queryOne, execute } from '../../utils/database'
import { verifyAuth } from '../../utils/auth'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia'
})

interface UserRecord {
  stripeCustomerId: string | null
  subscriptionId: string | null
  subscriptionStatus: string | null
  subscriptionPriceId: string | null
}

export default defineEventHandler(async (event) => {
  try {
    const user = await verifyAuth(event)
    const body = await readBody(event)
    const { newPriceId } = body

    if (!newPriceId) {
      throw createError({ statusCode: 400, message: 'New price ID is required' })
    }

    // Get user's current subscription
    const userRecord = await queryOne<UserRecord>(
      `SELECT stripeCustomerId, subscriptionId, subscriptionStatus, subscriptionPriceId 
       FROM users WHERE userId = ?`,
      [user.uid]
    )

    if (!userRecord?.subscriptionId) {
      throw createError({ statusCode: 400, message: 'No active subscription found' })
    }

    if (userRecord.subscriptionStatus !== 'active') {
      throw createError({ statusCode: 400, message: 'Subscription is not active' })
    }

    // Get the current subscription from Stripe
    const subscription = await stripe.subscriptions.retrieve(userRecord.subscriptionId)
    
    // Get the subscription item ID (assuming single item subscription)
    const subscriptionItemId = subscription.items.data[0]?.id
    if (!subscriptionItemId) {
      throw createError({ statusCode: 500, message: 'Could not find subscription item' })
    }

    // Schedule the price change at the end of the current billing period
    // This uses Stripe's subscription update with proration_behavior: 'none'
    // and billing_cycle_anchor: 'unchanged' to apply at period end
    const updatedSubscription = await stripe.subscriptions.update(userRecord.subscriptionId, {
      items: [{
        id: subscriptionItemId,
        price: newPriceId
      }],
      proration_behavior: 'none',
      billing_cycle_anchor: 'unchanged',
      // Add metadata to track the scheduled change
      metadata: {
        ...subscription.metadata,
        scheduled_price_id: newPriceId,
        scheduled_at: new Date().toISOString(),
        original_price_id: userRecord.subscriptionPriceId || ''
      }
    })

    // Update database with scheduled change info
    await execute(
      `UPDATE users SET 
        scheduledPriceId = ?,
        scheduledChangeDate = FROM_UNIXTIME(?)
       WHERE userId = ?`,
      [newPriceId, updatedSubscription.current_period_end, user.uid]
    )

    return {
      success: true,
      message: 'Plan change scheduled successfully',
      scheduledDate: new Date(updatedSubscription.current_period_end * 1000).toISOString(),
      newPriceId
    }
  } catch (error: any) {
    console.error('Error scheduling plan change:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to schedule plan change'
    })
  }
})
