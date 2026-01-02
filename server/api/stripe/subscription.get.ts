/**
 * GET /api/stripe/subscription
 * Get current subscription details from Stripe
 */
import { defineEventHandler } from 'h3'
import Stripe from 'stripe'
import { queryOne } from '../../utils/database'
import { verifyAuth } from '../../utils/auth'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia'
})

// Price ID to plan name mapping
const PLAN_NAMES: Record<string, string> = {
  'price_1SOJ4XP4c4Gc3RfaES49MMHK': 'Monthly Flex',
  'price_1SYzfRP4c4Gc3RfaiWc2kUwt': 'Annual Plan'
}

export default defineEventHandler(async (event) => {
  try {
    const user = await verifyAuth(event)

    // Get user's subscription info from database
    const userRecord = await queryOne<{ 
      stripeCustomerId: string | null
      subscriptionId: string | null
      subscriptionStatus: string | null
      subscriptionPriceId: string | null
      nextBillingDate: string | null
    }>(
      `SELECT stripeCustomerId, subscriptionId, subscriptionStatus, subscriptionPriceId, nextBillingDate 
       FROM users WHERE userId = ?`,
      [user.uid]
    )

    if (!userRecord?.subscriptionId) {
      return { subscription: null }
    }

    // Get subscription from Stripe for accurate billing info
    const stripeSubscription = await stripe.subscriptions.retrieve(userRecord.subscriptionId)
    
    const priceId = stripeSubscription.items.data[0]?.price?.id
    const amount = stripeSubscription.items.data[0]?.price?.unit_amount
    const currency = stripeSubscription.items.data[0]?.price?.currency
    const interval = stripeSubscription.items.data[0]?.price?.recurring?.interval

    return {
      subscription: {
        subscriptionId: userRecord.subscriptionId,
        status: stripeSubscription.status,
        priceId: priceId,
        planName: PLAN_NAMES[priceId || ''] || (interval === 'year' ? 'Annual Plan' : 'Monthly Plan'),
        amount: amount,
        currency: currency,
        nextBillingDate: stripeSubscription.current_period_end 
          ? new Date(stripeSubscription.current_period_end * 1000).toISOString()
          : userRecord.nextBillingDate,
        cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end
      }
    }
  } catch (error: any) {
    console.error('Error fetching subscription:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to fetch subscription'
    })
  }
})
