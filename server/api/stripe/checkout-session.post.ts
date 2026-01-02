import { defineEventHandler, createError, readBody } from 'h3'
import { stripeService } from '../../services/stripe'
import { queryOne, execute } from '../../utils/database'
import { verifyAuth } from '../../utils/auth'
import { PLANS } from '../../services/subscription'

interface UserRecord {
  stripeCustomerId: string | null
  userEmail: string
  userName: string | null
  userLastName: string | null
  subscriptionId: string | null
  subscriptionStatus: string | null
  subscriptionPriceId: string | null
}

export default defineEventHandler(async (event) => {
  try {
    // Verify authentication
    const user = await verifyAuth(event)

    const body = await readBody(event)
    const { priceId, successUrl, cancelUrl, metadata } = body

    if (!priceId || !successUrl || !cancelUrl) {
      throw createError({ 
        statusCode: 400, 
        message: 'Price ID, success URL, and cancel URL are required' 
      })
    }

    // Get user's Stripe customer ID from database
    const userRecord = await queryOne<UserRecord>(
      `SELECT stripeCustomerId, userEmail, userName, userLastName, 
              subscriptionId, subscriptionStatus, subscriptionPriceId 
       FROM users WHERE userId = ?`,
      [user.uid]
    )

    if (!userRecord) {
      throw createError({ statusCode: 404, message: 'User not found' })
    }
    
    // VALIDATION: Prevent creating new subscription if user already has one
    if (userRecord.subscriptionId && userRecord.subscriptionStatus === 'active') {
      // Check if trying to subscribe to the same plan
      if (userRecord.subscriptionPriceId === priceId) {
        throw createError({ 
          statusCode: 400, 
          message: 'You are already subscribed to this plan.' 
        })
      }
      
      // Check if user is on enterprise plan (can't create new subscription)
      const currentPlan = Object.values(PLANS).find(p => p.stripePriceId === userRecord.subscriptionPriceId)
      
      if (currentPlan && currentPlan.commitment === 12) {
        throw createError({ 
          statusCode: 400, 
          message: 'You have an active annual commitment. You can change plans when your commitment ends.'
        })
      }
      
      // User has active subscription - they should use updateSubscription instead
      throw createError({ 
        statusCode: 400, 
        message: 'You already have an active subscription. Please use the plan switch option in your account settings.'
      })
    }
    
    let customerId = userRecord.stripeCustomerId

    // If user has a customer ID, verify it exists in Stripe
    if (customerId) {
      try {
        await stripeService.getCustomer(customerId)
        console.log('Existing Stripe customer found:', customerId)
      } catch (error) {
        // Customer doesn't exist in Stripe, clear it and create a new one
        console.log('Stripe customer not found, will create new one')
        customerId = null
        await execute(
          'UPDATE users SET stripeCustomerId = NULL WHERE userId = ?',
          [user.uid]
        )
      }
    }

    // If user doesn't have a Stripe customer, create one
    if (!customerId) {
      console.log('Creating new Stripe customer for user:', user.uid)
      const customerName = userRecord.userName 
        ? `${userRecord.userName} ${userRecord.userLastName || ''}`.trim()
        : userRecord.userEmail
      
      const customer = await stripeService.createCustomer({
        email: userRecord.userEmail,
        name: customerName,
        metadata: { firebaseUid: user.uid }
      })
      
      customerId = customer.id
      
      // Save the customer ID to the database
      await execute(
        'UPDATE users SET stripeCustomerId = ? WHERE userId = ?',
        [customerId, user.uid]
      )
    }

    const session = await stripeService.createCheckoutSession({
      customerId,
      priceId,
      successUrl,
      cancelUrl,
      metadata
    })

    return { 
      success: true, 
      sessionId: session.id,
      url: session.url
    }
  } catch (error: any) {
    console.error('Error in createCheckoutSession:', error)
    throw createError({ 
      statusCode: error.statusCode || 500, 
      message: error.message || 'Failed to create checkout session'
    })
  }
})
