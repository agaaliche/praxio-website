/**
 * Subscription middleware - blocks access if trial expired and no subscription
 * 
 * Usage: Add to page meta:
 * definePageMeta({ middleware: ['auth', 'subscription'] })
 * 
 * Note: Should be used AFTER auth middleware
 */
export default defineNuxtRouteMiddleware(async (to, from) => {
  // Only run on client
  if (import.meta.server) return

  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const { fetchSubscription, needsSubscription, subscriptionLoading, subscriptionFetched } = useSubscription()

  // Wait for auth to initialize
  if (authLoading.value) {
    await new Promise<void>((resolve) => {
      const unwatch = watch(authLoading, (loading) => {
        if (!loading) {
          unwatch()
          resolve()
        }
      })
    })
  }

  // If not authenticated, let auth middleware handle it
  if (!isAuthenticated.value) {
    return
  }

  // Fetch subscription if not already fetched
  if (!subscriptionFetched.value) {
    await fetchSubscription()
  }

  // Wait for subscription to load
  if (subscriptionLoading.value) {
    await new Promise<void>((resolve) => {
      const unwatch = watch(subscriptionLoading, (loading) => {
        if (!loading) {
          unwatch()
          resolve()
        }
      })
    })
  }

  // Redirect to subscribe page if subscription is required
  if (needsSubscription.value) {
    // Only allow settings when user has no plan
    const allowedPaths = [
      '/subscribe', 
      '/pricing', 
      '/signout',
      '/account/settings'
    ]
    if (allowedPaths.some(path => to.path === path || to.path.startsWith(path + '/'))) {
      return
    }
    
    // Redirect /account (dashboard) to settings when no plan
    if (to.path === '/account') {
      return navigateTo('/account/settings')
    }

    return navigateTo('/subscribe')
  }
})
