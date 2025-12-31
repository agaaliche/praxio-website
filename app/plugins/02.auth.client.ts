/**
 * Auth initialization plugin
 * Runs after firebase.client.ts to set up auth state listener
 */
export default defineNuxtPlugin(() => {
  const { initAuth } = useAuth()
  
  // Initialize auth state listener
  initAuth()
})
