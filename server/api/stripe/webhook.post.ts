import { defineEventHandler, createError, getHeader, readRawBody } from 'h3'
import { stripeService } from '../../services/stripe'
import { execute, queryOne } from '../../utils/database'
import { getPlanTypeFromPriceId, PLANS, setGracePeriod } from '../../services/subscription'

export default defineEventHandler(async (event) => {
  console.log('🔔 Webhook endpoint called')
  
  const signature = getHeader(event, 'stripe-signature')
  
  if (!signature) {
    throw createError({ statusCode: 400, message: 'Missing Stripe signature' })
  }

  try {
    // Get raw body for signature verification
    const body = await readRawBody(event)
    
    if (!body) {
      throw createError({ statusCode: 400, message: 'Missing request body' })
    }
    
    // Verify webhook signature
    console.log('🔐 Verifying webhook signature...')
    const stripeEvent = stripeService.verifyWebhookSignature(body, signature)

    console.log('✅ Webhook signature verified')
    console.log('📨 Webhook event received:', stripeEvent.type)
    console.log('   Event ID:', stripeEvent.id)

    // Handle different event types
    switch (stripeEvent.type) {
      case 'customer.subscription.created':
        console.log('➡️  Handling subscription.created')
        await handleSubscriptionCreated(stripeEvent.data.object)
        break
      
      case 'customer.subscription.updated':
        console.log('➡️  Handling subscription.updated')
        await handleSubscriptionUpdated(stripeEvent.data.object)
        break
      
      case 'customer.subscription.deleted':
        console.log('➡️  Handling subscription.deleted')
        await handleSubscriptionDeleted(stripeEvent.data.object)
        break
      
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(stripeEvent.data.object)
        break
      
      case 'invoice.payment_failed':
        await handlePaymentFailed(stripeEvent.data.object)
        break
      
      case 'customer.subscription.trial_will_end':
        await handleTrialWillEnd(stripeEvent.data.object)
        break
      
      default:
        console.log(`⚠️  Unhandled event type: ${stripeEvent.type}`)
    }

    console.log('✅ Webhook processed successfully')
    return { received: true }
  } catch (error: any) {
    console.error('❌ Webhook error:', error.message)
    throw createError({ statusCode: 400, message: error.message })
  }
})

// ============================================================================
// Webhook Event Handlers
// ============================================================================

async function handleSubscriptionCreated(subscription: any) {
  try {
    console.log('📝 handleSubscriptionCreated called')
    console.log('   Subscription ID:', subscription.id)
    console.log('   Customer ID:', subscription.customer)
    console.log('   Status:', subscription.status)
    console.log('   Price ID:', subscription.items?.data?.[0]?.price?.id)
    
    const customerId = subscription.customer
    const subscriptionId = subscription.id
    const status = subscription.status
    const priceId = subscription.items?.data?.[0]?.price?.id || null
    const currentPeriodEnd = new Date(subscription.current_period_end * 1000)
    const subscriptionStart = new Date(subscription.start_date * 1000)
    
    // Determine plan type from price ID
    const planType = getPlanTypeFromPriceId(priceId)
    
    // Calculate subscription end date based on plan commitment
    const plan = Object.values(PLANS).find(p => p.stripePriceId === priceId)
    let subscriptionEndDate: Date
    
    if (plan && plan.commitment === 12) {
      // Annual plan: 12-month commitment from subscription start
      subscriptionEndDate = new Date(subscriptionStart)
      subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + 12)
      console.log('   Annual plan - commitment ends:', subscriptionEndDate)
    } else {
      // Monthly plan: no commitment, just the current period
      subscriptionEndDate = currentPeriodEnd
      console.log('   Monthly plan - no commitment, period ends:', subscriptionEndDate)
    }

    console.log('🔄 Updating user subscription in database...')
    console.log('   Plan type:', planType)
    
    // Update user's subscription in database
    const result = await execute(`
      UPDATE users 
      SET subscriptionId = ?, 
          subscriptionStatus = ?,
          subscriptionPriceId = ?,
          subscriptionEndDate = ?,
          nextBillingDate = ?,
          planType = ?,
          gracePeriodEndDate = NULL
      WHERE stripeCustomerId = ?
    `, [subscriptionId, status, priceId, subscriptionEndDate, currentPeriodEnd, planType, customerId])

    console.log(`✅ Subscription created for customer ${customerId} with plan ${planType}`)
    console.log(`   Rows affected: ${result.affectedRows}`)
    
    if (result.affectedRows === 0) {
      console.warn(`⚠️  No user found with stripeCustomerId: ${customerId}`)
    }
  } catch (error) {
    console.error('❌ Error handling subscription created:', error)
  }
}

async function handleSubscriptionUpdated(subscription: any) {
  try {
    console.log('📝 handleSubscriptionUpdated called')
    console.log('   Subscription ID:', subscription.id)
    console.log('   Customer ID:', subscription.customer)
    console.log('   Status:', subscription.status)
    console.log('   Cancel at period end:', subscription.cancel_at_period_end)
    console.log('   Price ID:', subscription.items?.data?.[0]?.price?.id)
    
    const customerId = subscription.customer
    // If cancel_at_period_end is true, use 'canceling' status instead of 'active'
    const status = subscription.cancel_at_period_end ? 'canceling' : subscription.status
    const priceId = subscription.items?.data?.[0]?.price?.id || null
    const currentPeriodEnd = subscription.current_period_end 
      ? new Date(subscription.current_period_end * 1000)
      : null

    console.log('   Current Period End:', currentPeriodEnd)
    console.log('   Effective Status:', status)
    
    // Determine plan type and calculate subscription end date
    const plan = Object.values(PLANS).find(p => p.stripePriceId === priceId)
    let subscriptionEndDate: Date | null = null
    const planType = plan?.id || null
    
    if (plan && plan.commitment === 12) {
      // Annual plan: 12-month commitment from now
      subscriptionEndDate = new Date()
      subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + 12)
      console.log('   Annual plan activated, commitment ends:', subscriptionEndDate)
    }

    // Update the database
    const result = await execute(`
      UPDATE users 
      SET subscriptionStatus = ?,
          subscriptionPriceId = ?,
          nextBillingDate = ?,
          planType = COALESCE(?, planType),
          subscriptionEndDate = COALESCE(?, subscriptionEndDate),
          pendingPriceId = NULL,
          pendingPlanStartDate = NULL,
          updatedAt = NOW()
      WHERE stripeCustomerId = ?
    `, [status, priceId, currentPeriodEnd, planType, subscriptionEndDate, customerId])

    console.log(`✅ Subscription updated for customer ${customerId} with price ${priceId}`)
    console.log(`   Rows affected: ${result.affectedRows}`)
  } catch (error) {
    console.error('❌ Error handling subscription updated:', error)
  }
}

async function handleSubscriptionDeleted(subscription: any) {
  try {
    const customerId = subscription.customer
    
    // Get the subscription end date (when access should end)
    const subscriptionEndDate = subscription.current_period_end 
      ? new Date(subscription.current_period_end * 1000) 
      : new Date()

    await execute(`
      UPDATE users 
      SET subscriptionStatus = 'canceled',
          subscriptionEndDate = ?,
          subscriptionId = NULL,
          subscriptionPriceId = NULL
      WHERE stripeCustomerId = ?
    `, [subscriptionEndDate, customerId])

    console.log(`Subscription deleted for customer ${customerId}`)
    console.log(`   Access ends: ${subscriptionEndDate.toISOString()}`)
  } catch (error) {
    console.error('Error handling subscription deleted:', error)
  }
}

async function handlePaymentSucceeded(invoice: any) {
  try {
    const customerId = invoice.customer
    const subscriptionId = invoice.subscription

    console.log(`💰 Payment succeeded for customer ${customerId}, subscription ${subscriptionId}`)
    
    // Check if this customer has a pending plan change
    const user = await queryOne<{ userId: string; pendingPriceId: string | null }>(
      'SELECT userId, pendingPriceId FROM users WHERE stripeCustomerId = ?',
      [customerId]
    )
    
    if (user && user.pendingPriceId) {
      console.log(`📅 Found pending plan change for user ${user.userId}`)
      console.log(`   Pending price: ${user.pendingPriceId}`)
      
      // Apply the pending plan change
      const plan = Object.values(PLANS).find(p => p.stripePriceId === user.pendingPriceId)
      
      let subscriptionEndDate: Date | null = null
      const planType = plan?.id || null
      
      if (plan && plan.commitment === 12) {
        subscriptionEndDate = new Date()
        subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + 12)
      }
      
      // Update database with new plan and clear pending
      await execute(`
        UPDATE users SET 
          subscriptionPriceId = ?,
          planType = ?,
          subscriptionEndDate = ?,
          pendingPriceId = NULL,
          pendingPlanStartDate = NULL,
          updatedAt = NOW()
        WHERE stripeCustomerId = ?
      `, [user.pendingPriceId, planType, subscriptionEndDate, customerId])
      
      console.log(`✅ Pending plan change applied: ${planType}`)
    }
  } catch (error) {
    console.error('Error handling payment succeeded:', error)
  }
}

async function handlePaymentFailed(invoice: any) {
  try {
    const customerId = invoice.customer
    
    // Calculate grace period end date (3 days from now)
    const gracePeriodEndDate = setGracePeriod(new Date())

    await execute(`
      UPDATE users 
      SET subscriptionStatus = 'past_due',
          gracePeriodEndDate = ?
      WHERE stripeCustomerId = ?
    `, [gracePeriodEndDate, customerId])

    console.log(`Payment failed for customer ${customerId}`)
    console.log(`   Grace period ends: ${gracePeriodEndDate.toISOString()}`)
    
    // TODO: Send payment failed notification email
  } catch (error) {
    console.error('Error handling payment failed:', error)
  }
}

async function handleTrialWillEnd(subscription: any) {
  try {
    const customerId = subscription.customer
    const trialEnd = new Date(subscription.trial_end * 1000)

    console.log(`Trial ending soon for customer ${customerId} on ${trialEnd}`)
    
    // TODO: Send a reminder email here
  } catch (error) {
    console.error('Error handling trial will end:', error)
  }
}
