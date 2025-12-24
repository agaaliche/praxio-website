/**
 * Guest middleware - redirects authenticated users away from auth pages
 * 
 * Usage: Add to signin/signup pages:
 * definePageMeta({ middleware: 'guest' })
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

  // Redirect authenticated users to account or redirect param
  if (isAuthenticated.value) {
    const redirect = to.query.redirect as string
    return navigateTo(redirect || '/account')
  }
})
