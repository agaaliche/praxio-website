import Stripe from 'stripe'

// Initialize Stripe with secret key from environment
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-12-18.acacia'
})

export const stripeService = {
  /**
   * Create a new Stripe customer
   */
  async createCustomer(customerData: { email: string; name: string; metadata?: Record<string, string> }) {
    try {
      const customer = await stripe.customers.create({
        email: customerData.email,
        name: customerData.name,
        metadata: customerData.metadata || {}
      })
      return customer
    } catch (error) {
      console.error('Error creating Stripe customer:', error)
      throw error
    }
  },

  /**
   * Get customer by ID
   */
  async getCustomer(customerId: string) {
    try {
      const customer = await stripe.customers.retrieve(customerId)
      return customer
    } catch (error) {
      console.error('Error retrieving Stripe customer:', error)
      throw error
    }
  },

  /**
   * Create a subscription for a customer
   */
  async createSubscription(subscriptionData: { customerId: string; priceId: string; trialDays?: number }) {
    try {
      const subscriptionParams: Stripe.SubscriptionCreateParams = {
        customer: subscriptionData.customerId,
        items: [{ price: subscriptionData.priceId }],
        payment_behavior: 'default_incomplete',
        payment_settings: { save_default_payment_method: 'on_subscription' },
        expand: ['latest_invoice.payment_intent']
      }

      // Add trial period if specified
      if (subscriptionData.trialDays) {
        subscriptionParams.trial_period_days = subscriptionData.trialDays
      }

      const subscription = await stripe.subscriptions.create(subscriptionParams)
      return subscription
    } catch (error) {
      console.error('Error creating subscription:', error)
      throw error
    }
  },

  /**
   * Get a subscription by ID
   */
  async getSubscription(subscriptionId: string) {
    try {
      return await stripe.subscriptions.retrieve(subscriptionId)
    } catch (error) {
      console.error('Error getting subscription:', error)
      throw error
    }
  },

  /**
   * Update a subscription (change plan, billing cycle, etc.)
   */
  async updateSubscription(subscriptionId: string, updateData: { priceId: string; scheduleAtPeriodEnd?: boolean; prorationBehavior?: Stripe.SubscriptionUpdateParams.ProrationBehavior }) {
    try {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId)
      
      // If scheduling change at period end - DON'T update Stripe yet
      if (updateData.scheduleAtPeriodEnd) {
        console.log('📅 Scheduling subscription change (database only):', subscriptionId)
        console.log('   Current price:', subscription.items.data[0].price.id)
        console.log('   New price (pending):', updateData.priceId)
        console.log('   Will take effect at:', new Date(subscription.current_period_end * 1000))
        
        return {
          ...subscription,
          scheduled_change: {
            priceId: updateData.priceId,
            startDate: subscription.current_period_end
          }
        }
      }
      
      // Immediate change
      const updatedSubscription = await stripe.subscriptions.update(subscriptionId, {
        items: [{
          id: subscription.items.data[0].id,
          price: updateData.priceId
        }],
        proration_behavior: updateData.prorationBehavior || 'create_prorations'
      })

      return updatedSubscription
    } catch (error) {
      console.error('Error updating subscription:', error)
      throw error
    }
  },

  /**
   * Cancel a subscription
   */
  async cancelSubscription(subscriptionId: string, immediately = false) {
    try {
      if (immediately) {
        const subscription = await stripe.subscriptions.cancel(subscriptionId)
        return subscription
      } else {
        // Cancel at period end
        const subscription = await stripe.subscriptions.update(subscriptionId, {
          cancel_at_period_end: true
        })
        return subscription
      }
    } catch (error) {
      console.error('Error canceling subscription:', error)
      throw error
    }
  },

  /**
   * Create a checkout session for subscription
   */
  async createCheckoutSession(sessionData: { 
    customerId: string
    priceId: string
    successUrl: string
    cancelUrl: string
    metadata?: Record<string, string>
  }) {
    try {
      const session = await stripe.checkout.sessions.create({
        customer: sessionData.customerId,
        mode: 'subscription',
        line_items: [{
          price: sessionData.priceId,
          quantity: 1
        }],
        success_url: sessionData.successUrl,
        cancel_url: sessionData.cancelUrl,
        subscription_data: {
          metadata: sessionData.metadata || {}
        }
      })
      return session
    } catch (error) {
      console.error('Error creating checkout session:', error)
      throw error
    }
  },

  /**
   * Create a billing portal session
   */
  async createBillingPortalSession(customerId: string, returnUrl: string) {
    try {
      const session = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: returnUrl
      })
      return session
    } catch (error) {
      console.error('Error creating billing portal session:', error)
      throw error
    }
  },

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(payload: string | Buffer, signature: string) {
    try {
      const event = stripe.webhooks.constructEvent(
        payload,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET || ''
      )
      return event
    } catch (error) {
      console.error('Webhook signature verification failed:', error)
      throw error
    }
  },

  /**
   * Get all prices for a product
   */
  async getPrices(productId: string) {
    try {
      const prices = await stripe.prices.list({
        product: productId,
        active: true
      })
      return prices.data
    } catch (error) {
      console.error('Error retrieving prices:', error)
      throw error
    }
  },

  /**
   * Get customer invoices
   */
  async getInvoices(customerId: string, limit = 10) {
    try {
      const invoices = await stripe.invoices.list({
        customer: customerId,
        limit
      })
      return invoices.data
    } catch (error) {
      console.error('Error retrieving invoices:', error)
      throw error
    }
  },

  /**
   * Get payment methods for customer
   */
  async getPaymentMethods(customerId: string) {
    try {
      const paymentMethods = await stripe.paymentMethods.list({
        customer: customerId,
        type: 'card'
      })
      return paymentMethods.data
    } catch (error) {
      console.error('Error retrieving payment methods:', error)
      throw error
    }
  }
}

export default stripeService
