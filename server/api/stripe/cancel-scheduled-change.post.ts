/**
 * POST /api/stripe/cancel-scheduled-change
 * Cancel a scheduled plan change before it takes effect
 */
import { defineEventHandler, createError } from 'h3'
import Stripe from 'stripe'
import { queryOne, execute } from '../../utils/database'
import { verifyAuth } from '../../utils/auth'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia'
})

interface UserRecord {
  subscriptionId: string | null
  subscriptionPriceId: string | null
  scheduledPriceId: string | null
}

export default defineEventHandler(async (event) => {
  try {
    const user = await verifyAuth(event)

    // Get user's current subscription and scheduled change
    const userRecord = await queryOne<UserRecord>(
      `SELECT subscriptionId, subscriptionPriceId, scheduledPriceId 
       FROM users WHERE userId = ?`,
      [user.uid]
    )

    if (!userRecord?.subscriptionId) {
      throw createError({ statusCode: 400, message: 'No active subscription found' })
    }

    if (!userRecord.scheduledPriceId) {
      throw createError({ statusCode: 400, message: 'No scheduled plan change found' })
    }

    // Get the original price ID to revert to
    const originalPriceId = userRecord.subscriptionPriceId

    if (!originalPriceId) {
      throw createError({ statusCode: 500, message: 'Could not determine original price' })
    }

    // Get the subscription from Stripe
    const subscription = await stripe.subscriptions.retrieve(userRecord.subscriptionId)
    
    // Check if there's a subscription schedule
    if (subscription.schedule) {
      // Release the subscription from the schedule, returning it to normal subscription
      await stripe.subscriptionSchedules.release(subscription.schedule as string)
    }

    // Clear the scheduled change from database
    await execute(
      `UPDATE users SET 
        scheduledPriceId = NULL,
        scheduledChangeDate = NULL
       WHERE userId = ?`,
      [user.uid]
    )

    return {
      success: true,
      message: 'Scheduled plan change canceled'
    }
  } catch (error: any) {
    console.error('Error canceling scheduled change:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to cancel scheduled change'
    })
  }
})
