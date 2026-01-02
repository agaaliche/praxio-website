/**
 * POST /api/stripe/schedule-change
 * Schedule a plan change at the end of the current billing period
 * Used when upgrading from monthly to annual
 */
import { defineEventHandler, createError, readBody } from 'h3'
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

    if (userRecord.subscriptionStatus !== 'active' && userRecord.subscriptionStatus !== 'canceling') {
      throw createError({ statusCode: 400, message: 'Subscription must be active or canceling to schedule a change' })
    }

    // Get the current subscription from Stripe
    const subscription = await stripe.subscriptions.retrieve(userRecord.subscriptionId)
    
    // If subscription already has a schedule (e.g., from previous cancellation or upgrade),
    // release it first so we can create a new one
    if (subscription.schedule) {
      await stripe.subscriptionSchedules.release(subscription.schedule as string)
    }
    
    // If subscription is set to cancel, remove that flag since we're upgrading
    if (subscription.cancel_at_period_end) {
      await stripe.subscriptions.update(userRecord.subscriptionId, {
        cancel_at_period_end: false
      })
    }
    
    // Create a subscription schedule to change the price at period end
    // This will NOT change the current subscription until the period ends
    const schedule = await stripe.subscriptionSchedules.create({
      from_subscription: userRecord.subscriptionId,
    })

    // Update the schedule to change price at the end of current period
    const updatedSchedule = await stripe.subscriptionSchedules.update(schedule.id, {
      phases: [
        {
          // Current phase - keep existing price until period end
          items: [{
            price: userRecord.subscriptionPriceId!,
            quantity: 1
          }],
          start_date: subscription.current_period_start,
          end_date: subscription.current_period_end,
        },
        {
          // New phase - switch to new price after period end
          items: [{
            price: newPriceId,
            quantity: 1
          }],
          start_date: subscription.current_period_end,
        }
      ],
      metadata: {
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
      [newPriceId, subscription.current_period_end, user.uid]
    )

    return {
      success: true,
      message: 'Plan change scheduled successfully',
      scheduledDate: new Date(subscription.current_period_end * 1000).toISOString(),
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
