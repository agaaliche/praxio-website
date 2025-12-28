/**
 * Subscription state composable
 * Manages subscription status site-wide
 */

export interface SubscriptionState {
  subscriptionId: string | null
  status: string | null
  priceId: string | null
  trialStartDate: string | null
  trialEndDate: string | null
  nextBillingDate: string | null
  scheduledPriceId: string | null
  scheduledChangeDate: string | null
}

// Global state
const subscription = ref<SubscriptionState | null>(null)
const subscriptionLoading = ref(false)
const subscriptionError = ref<string | null>(null)
const subscriptionFetched = ref(false)

export function useSubscription() {
  const { user, getIdToken, isAuthenticated } = useAuth()

  // Computed properties
  const hasActiveSubscription = computed(() => {
    if (!subscription.value) return false
    return subscription.value.status === 'active' || subscription.value.status === 'trialing'
  })

  const isOnTrial = computed(() => {
    if (!subscription.value) return false
    // User is on trial if they have a trialEndDate but no subscriptionId, and trial hasn't expired
    if (subscription.value.trialEndDate && !subscription.value.subscriptionId) {
      const trialEnd = new Date(subscription.value.trialEndDate)
      return trialEnd >= new Date()
    }
    return subscription.value.status === 'trialing'
  })

  const isTrialExpired = computed(() => {
    if (!subscription.value) return false
    if (!subscription.value.trialEndDate) return false
    const trialEnd = new Date(subscription.value.trialEndDate)
    // Trial is expired if end date passed AND user has no active subscription
    return trialEnd < new Date() && !subscription.value.subscriptionId
  })

  const hasAccess = computed(() => {
    // User has access if they have an active subscription OR are on a valid trial
    return hasActiveSubscription.value || isOnTrial.value
  })

  const needsSubscription = computed(() => {
    // User needs to subscribe if trial expired and no active subscription
    return isTrialExpired.value && !hasActiveSubscription.value
  })

  const trialDaysLeft = computed(() => {
    if (!subscription.value?.trialEndDate) return 0
    const trialEnd = new Date(subscription.value.trialEndDate)
    const now = new Date()
    const diff = Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    return Math.max(0, diff)
  })

  const trialDaysExpired = computed(() => {
    if (!subscription.value?.trialEndDate) return 0
    const trialEnd = new Date(subscription.value.trialEndDate)
    const now = new Date()
    const diff = Math.ceil((now.getTime() - trialEnd.getTime()) / (1000 * 60 * 60 * 24))
    return Math.max(0, diff)
  })

  const currentPlanName = computed(() => {
    if (!subscription.value) return 'No Plan'
    if (subscription.value.status === 'active') {
      if (subscription.value.priceId?.includes('price_1SYzfRP4c4Gc3Rfa')) return 'Annual Plan'
      if (subscription.value.priceId?.includes('price_1SOJ4XP4c4Gc3Rfa')) return 'Monthly Flex'
      return 'Subscription'
    }
    if (isOnTrial.value) return 'Free Trial'
    if (isTrialExpired.value) return 'Trial Expired'
    return 'No Plan'
  })

  // Fetch subscription from API
  const fetchSubscription = async (force = false) => {
    // Don't fetch if not authenticated
    if (!isAuthenticated.value || !user.value) {
      subscription.value = null
      subscriptionFetched.value = false
      return
    }

    // Don't refetch if already fetched (unless forced)
    if (subscriptionFetched.value && !force) {
      return
    }

    subscriptionLoading.value = true
    subscriptionError.value = null

    try {
      const token = await getIdToken()
      const response = await $fetch<{ subscription: SubscriptionState }>('/api/users/current', {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      subscription.value = response.subscription
      subscriptionFetched.value = true
    } catch (error: any) {
      console.error('Failed to fetch subscription:', error)
      subscriptionError.value = error.message || 'Failed to fetch subscription'
    } finally {
      subscriptionLoading.value = false
    }
  }

  // Clear subscription state (on logout)
  const clearSubscription = () => {
    subscription.value = null
    subscriptionFetched.value = false
    subscriptionError.value = null
  }

  // Refresh subscription (after purchase, etc.)
  const refreshSubscription = () => fetchSubscription(true)

  return {
    // State
    subscription: readonly(subscription),
    subscriptionLoading: readonly(subscriptionLoading),
    subscriptionError: readonly(subscriptionError),
    subscriptionFetched: readonly(subscriptionFetched),

    // Computed
    hasActiveSubscription,
    isOnTrial,
    isTrialExpired,
    hasAccess,
    needsSubscription,
    trialDaysLeft,
    trialDaysExpired,
    currentPlanName,

    // Methods
    fetchSubscription,
    refreshSubscription,
    clearSubscription
  }
}
