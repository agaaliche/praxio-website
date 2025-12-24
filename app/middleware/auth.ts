/**
 * Auth middleware - protects routes that require authentication
 * 
 * Usage: Add to page meta:
 * definePageMeta({ middleware: 'auth' })
 */
export default defineNuxtRouteMiddleware(async (to, from) => {
  // Only run on client
  if (import.meta.server) return

  const { isAuthenticated, isLoading } = useAuth()

  // Wait for auth to initialize
  if (isLoading.value) {
    await new Promise<void>((resolve) => {
      const unwatch = watch(isLoading, (loading) => {
        if (!loading) {
          unwatch()
          resolve()
        }
      })
    })
  }

  // Redirect to signin if not authenticated
  if (!isAuthenticated.value) {
    return navigateTo({
      path: '/signin',
      query: { redirect: to.fullPath }
    })
  }
})
