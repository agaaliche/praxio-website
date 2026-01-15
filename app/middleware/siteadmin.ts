/**
 * Site Admin Middleware
 * Redirects non-siteadmin users away from admin pages
 */
export default defineNuxtRouteMiddleware(async (to, from) => {
  // Only run on client
  if (import.meta.server) return
  
  const { isSiteAdmin, isAuthenticated, isLoading } = useAuth()
  
  // Wait for auth to initialize
  if (isLoading.value) {
    await new Promise<void>((resolve) => {
      const unwatch = watch(isLoading, (loading) => {
        if (!loading) {
          unwatch()
          resolve()
        }
      }, { immediate: true })
    })
  }
  
  // If not authenticated, redirect to signin
  if (!isAuthenticated.value) {
    return navigateTo('/signin')
  }
  
  // If not site admin, redirect to account
  if (!isSiteAdmin.value) {
    return navigateTo('/account')
  }
})
