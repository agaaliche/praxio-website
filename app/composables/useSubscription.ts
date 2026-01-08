/**
 * Subscription state composable
 * Manages subscription status site-wide
 */

export interface SubscriptionState {
  customerId: string | null
  subscriptionId: string | null
  status: string | null
  priceId: string | null
  endDate: string | null
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
let roleCheckInterval: NodeJS.Timeout | null = null

// Track handled role changes by their updated_at timestamp (using sessionStorage)
// This persists across page reloads but clears when tab closes
function isRoleChangeTimestampHandled(timestamp: string): boolean {
  if (typeof window === 'undefined') return false
  const handledTimestamps = sessionStorage.getItem('praxio_handled_role_timestamps')
  if (!handledTimestamps) return false
  const timestamps = JSON.parse(handledTimestamps)
  return timestamps.includes(timestamp)
}

function markRoleChangeTimestampHandled(timestamp: string) {
  if (typeof window === 'undefined') return
  const handledTimestamps = sessionStorage.getItem('praxio_handled_role_timestamps')
  const timestamps = handledTimestamps ? JSON.parse(handledTimestamps) : []
  if (!timestamps.includes(timestamp)) {
    timestamps.push(timestamp)
    sessionStorage.setItem('praxio_handled_role_timestamps', JSON.stringify(timestamps))
    console.log('🔒 Marked role change timestamp as handled:', timestamp)
  }
}

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
    // User needs to subscribe if:
    // 1. Trial expired and no active subscription, OR
    // 2. No trial dates at all and no subscription (never started trial)
    if (!subscription.value) return true // Not fetched yet, assume needs subscription
    
    const hasNoSubscription = !subscription.value.subscriptionId
    const hasNoTrial = !subscription.value.trialEndDate
    const trialExpired = isTrialExpired.value
    
    // No trial and no subscription = needs subscription
    if (hasNoTrial && hasNoSubscription) return true
    
    // Trial expired and no active subscription = needs subscription
    return trialExpired && !hasActiveSubscription.value
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
      const response = await $fetch<{ 
        subscription: SubscriptionState, 
        roleChanged?: boolean, 
        role?: string | null,
        updatedAt?: string 
      }>('/api/users/current', {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      console.log('📡 API Response:', {
        roleChanged: response.roleChanged,
        role: response.role,
        updatedAt: response.updatedAt
      })
      
      subscription.value = response.subscription
      subscriptionFetched.value = true
      
      // Update localStorage role if provided in response
      if (response.role !== undefined && typeof window !== 'undefined') {
        const storedRole = localStorage.getItem('praxio_db_role')
        const newRoleStr = response.role === null ? 'null' : response.role
        
        // If role changed in localStorage, update auth composable
        if (storedRole !== newRoleStr) {
          console.log('🔄 Role changed detected:', storedRole, '->', newRoleStr)
          localStorage.setItem('praxio_db_role', newRoleStr)
          
          // Trigger role refresh in auth composable
          const { fetchDatabaseRole } = useAuth()
          await fetchDatabaseRole(true)
        }
      }
      
      // Check if role has changed - use timestamp to avoid handling same change multiple times
      if (response.roleChanged && response.updatedAt) {
        const timestampAlreadyHandled = isRoleChangeTimestampHandled(response.updatedAt)
        
        console.log('🔄 ROLE CHANGE DETECTED IN RESPONSE:', {
          timestampAlreadyHandled,
          updatedAt: response.updatedAt,
          tokenRole: user.value?.role,
          responseRole: response.role
        })
        
        // Only handle if we haven't processed this specific timestamp before
        if (!timestampAlreadyHandled) {
          // Mark this timestamp as handled immediately
          markRoleChangeTimestampHandled(response.updatedAt)
          
          // Stop role checking to prevent re-triggering
          stopRoleChecking()
          
          console.log('🚨 Handling role change - reloading page immediately')
          
          const { showNotification } = await import('~/stores/notification')
          
          // Show brief notification
          showNotification(
            'Your role has been updated. Refreshing page...',
            'info',
            3000
          )
          
          // Reload immediately after a brief delay for notification visibility
          setTimeout(() => {
            console.log('🔄 Reloading page after role change...')
            window.location.reload()
          }, 1500)
        } else {
          console.log('⏭️ Role change timestamp already handled - skipping reload')
        }
      } else {
        console.log('ℹ️ No role change detected in this API response')
      }
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
    clearRoleChangeHandled() // Clear flag on logout
    
    // Stop role checking
    if (roleCheckInterval) {
      clearInterval(roleCheckInterval)
      roleCheckInterval = null
    }
  }

  // Start periodic role checking for invited users
  const startRoleChecking = () => {
    // Only for invited users (those with a role)
    if (!user.value?.role) return
    
    // Don't start multiple intervals
    if (roleCheckInterval) {
      console.log('⏸️ Role checking interval already running')
      return
    }
    
    console.log('▶️ Starting role checking interval (every 15 seconds)')
    
    // Check every 15 seconds
    roleCheckInterval = setInterval(() => {
      if (isAuthenticated.value && user.value?.role) {
        console.log('⏰ Role check interval tick - fetching subscription...')
        fetchSubscription(true)
      }
    }, 15000)
  }

  // Stop periodic role checking
  const stopRoleChecking = () => {
    if (roleCheckInterval) {
      clearInterval(roleCheckInterval)
      roleCheckInterval = null
    }
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
    clearSubscription,
    startRoleChecking,
    stopRoleChecking
  }
}
