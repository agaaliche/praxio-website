/**
 * Subscription Service
 * 
 * Handles subscription status checks, trial management, and access control logic.
 * 
 * Plans for Praxio:
 * - trial: 14-day free trial
 * - starter: $29 CAD/month, up to 5 users
 * - professional: $79 CAD/month, up to 20 users
 * - enterprise: Custom pricing, unlimited users
 * 
 * Access Levels:
 * - full: All features available (active subscription or valid trial)
 * - readonly: Can view data but cannot create/edit/delete (expired trial, canceled subscription)
 * - none: No access (should not happen in normal flow)
 */

// Constants
export const TRIAL_DAYS = 14
export const GRACE_PERIOD_DAYS = 3

// Plan configurations (matching inrManager setup)
export const PLANS = {
  trial: {
    id: 'trial',
    name: 'Free Trial',
    price: 0,
    currency: 'CAD',
    interval: '14 days',
    commitment: null,
    stripePriceId: null, // No Stripe price - handled internally
    isTrial: true,
    maxUsers: 5,
    features: [
      'Full access for 14 days',
      'Unlimited patients',
      'All features included',
      'No credit card required'
    ]
  },
  monthly_flex: {
    id: 'monthly_flex',
    name: 'Monthly Flex',
    price: 45,
    currency: 'CAD',
    interval: 'month',
    commitment: null,
    stripePriceId: process.env.STRIPE_MONTHLY_PRICE_ID || 'price_1SOJ4XP4c4Gc3RfaES49MMHK',
    isTrial: false,
    maxUsers: null, // Unlimited
    features: [
      'Unlimited patients',
      'Full INR tracking',
      'Email & chat support',
      'Advanced reports',
      'Cancel anytime'
    ]
  },
  annual: {
    id: 'annual',
    name: 'Annual Plan',
    price: 35,
    currency: 'CAD',
    interval: 'month',
    commitment: 12, // 12 months
    stripePriceId: process.env.STRIPE_YEARLY_PRICE_ID || 'price_1SYzfRP4c4Gc3RfaiWc2kUwt',
    isTrial: false,
    maxUsers: null, // Unlimited
    features: [
      'Everything in Monthly Flex',
      'Priority support',
      'Custom integrations',
      'Best value - Save $10/month'
    ]
  }
} as const

export type PlanType = keyof typeof PLANS

export interface User {
  subscriptionStatus?: string | null
  subscriptionEndDate?: Date | string | null
  trialEndDate?: Date | string | null
  gracePeriodEndDate?: Date | string | null
  planType?: string | null
  nextBillingDate?: Date | string | null
  stripeCustomerId?: string | null
  subscriptionId?: string | null
  subscriptionPriceId?: string | null
}

export interface AccessLevel {
  accessLevel: 'full' | 'readonly' | 'none'
  reason: string
  status: string
  daysRemaining: number | null
  message?: string
  planType?: string | null
  nextBillingDate?: Date | string | null
  trialEndDate?: Date | string | null
  subscriptionEndDate?: Date | string | null
  gracePeriodEndDate?: Date | string | null
}

/**
 * Calculate the access level for a user based on their subscription/trial status
 */
export function getAccessLevel(user: User): AccessLevel {
  const now = new Date()
  
  // Check for active paid subscription first
  if (user.subscriptionStatus === 'active') {
    return {
      accessLevel: 'full',
      reason: 'active_subscription',
      status: 'active',
      daysRemaining: null,
      planType: user.planType || 'starter',
      nextBillingDate: user.nextBillingDate
    }
  }

  // Check for trialing status (Stripe trial)
  if (user.subscriptionStatus === 'trialing') {
    const trialEnd = user.trialEndDate ? new Date(user.trialEndDate) : null
    const daysRemaining = trialEnd ? Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : null
    
    return {
      accessLevel: 'full',
      reason: 'trialing',
      status: 'trialing',
      daysRemaining: daysRemaining && daysRemaining > 0 ? daysRemaining : 0,
      trialEndDate: user.trialEndDate
    }
  }

  // Check for grace period after payment failure
  if (user.subscriptionStatus === 'past_due' && user.gracePeriodEndDate) {
    const graceEnd = new Date(user.gracePeriodEndDate)
    if (now < graceEnd) {
      const daysRemaining = Math.ceil((graceEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      return {
        accessLevel: 'full',
        reason: 'grace_period',
        status: 'past_due',
        daysRemaining,
        gracePeriodEndDate: user.gracePeriodEndDate,
        message: 'Payment failed. Please update your payment method.'
      }
    }
  }

  // Check app-level trial (for users who haven't subscribed yet)
  if (user.trialEndDate) {
    const trialEnd = new Date(user.trialEndDate)
    if (now < trialEnd) {
      const daysRemaining = Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      return {
        accessLevel: 'full',
        reason: 'trial',
        status: 'trial',
        daysRemaining,
        trialEndDate: user.trialEndDate
      }
    }
  }

  // Canceled or pending cancellation - check if still in paid period
  if ((user.subscriptionStatus === 'canceled' || user.subscriptionStatus === 'pending_cancellation') && user.subscriptionEndDate) {
    const subEnd = new Date(user.subscriptionEndDate)
    if (now < subEnd) {
      const daysRemaining = Math.ceil((subEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      return {
        accessLevel: 'full',
        reason: user.subscriptionStatus === 'pending_cancellation' ? 'pending_cancellation' : 'canceled_with_access',
        status: user.subscriptionStatus,
        daysRemaining,
        subscriptionEndDate: user.subscriptionEndDate,
        message: user.subscriptionStatus === 'pending_cancellation' 
          ? `Your subscription will end in ${daysRemaining} days. Resubscribe to keep full access.`
          : `Access ends in ${daysRemaining} days. Subscribe to restore full access.`
      }
    }
  }

  // User hasn't selected a plan yet (new signup)
  if (!user.planType || user.planType === 'pending' || user.planType === 'none') {
    return {
      accessLevel: 'readonly',
      reason: 'no_plan_selected',
      status: 'pending',
      daysRemaining: 0,
      message: 'Please select a plan to get started.'
    }
  }

  // Default: readonly access (trial expired, subscription ended, or payment failed beyond grace)
  return {
    accessLevel: 'readonly',
    reason: user.subscriptionStatus === 'past_due' ? 'payment_failed' : 
            user.subscriptionStatus === 'canceled' ? 'subscription_ended' : 'trial_expired',
    status: user.subscriptionStatus || 'expired',
    daysRemaining: 0,
    message: getReadonlyMessage(user)
  }
}

/**
 * Get appropriate message for readonly access
 */
function getReadonlyMessage(user: User): string {
  if (user.subscriptionStatus === 'past_due') {
    return 'Your payment has failed. Please update your payment method to restore full access.'
  }
  if (user.subscriptionStatus === 'canceled') {
    return 'Your subscription has ended. Subscribe to restore full access.'
  }
  return 'Your free trial has ended. Subscribe to continue using all features.'
}

/**
 * Initialize trial for a new user
 */
export function initializeTrialPeriod(): { trialStartDate: Date; trialEndDate: Date; planType: string } {
  const now = new Date()
  const trialEndDate = new Date(now.getTime() + (TRIAL_DAYS * 24 * 60 * 60 * 1000))
  
  return {
    trialStartDate: now,
    trialEndDate,
    planType: 'trial'
  }
}

/**
 * Set grace period for a user after payment failure
 */
export function setGracePeriod(fromDate = new Date()): Date {
  return new Date(fromDate.getTime() + (GRACE_PERIOD_DAYS * 24 * 60 * 60 * 1000))
}

/**
 * Get plan details by plan type
 */
export function getPlanDetails(planType: string) {
  return PLANS[planType as PlanType] || null
}

/**
 * Get all available plans
 */
export function getAllPlans() {
  return Object.values(PLANS)
}

/**
 * Map Stripe price ID to plan type
 */
export function getPlanTypeFromPriceId(priceId: string): string {
  for (const [planType, plan] of Object.entries(PLANS)) {
    if (plan.stripePriceId === priceId) {
      return planType
    }
  }
  return 'unknown'
}

/**
 * Check if user has write access (can create/edit/delete)
 */
export function hasWriteAccess(user: User): boolean {
  const { accessLevel } = getAccessLevel(user)
  return accessLevel === 'full'
}

/**
 * Check if user is in trial period
 */
export function isInTrial(user: User): boolean {
  const { reason } = getAccessLevel(user)
  return reason === 'trial' || reason === 'trialing'
}

/**
 * Get subscription status summary for API response
 */
export function getSubscriptionSummary(user: User) {
  const access = getAccessLevel(user)
  
  return {
    ...access,
    planType: user.planType || null,
    hasWriteAccess: access.accessLevel === 'full',
    isInTrial: access.reason === 'trial' || access.reason === 'trialing',
    currentPlan: user.planType && user.planType !== 'trial' ? getPlanDetails(user.planType) : null,
    availablePlans: getAllPlans()
  }
}

export default {
  TRIAL_DAYS,
  GRACE_PERIOD_DAYS,
  PLANS,
  getAccessLevel,
  initializeTrialPeriod,
  setGracePeriod,
  getPlanDetails,
  getAllPlans,
  getPlanTypeFromPriceId,
  hasWriteAccess,
  isInTrial,
  getSubscriptionSummary
}
