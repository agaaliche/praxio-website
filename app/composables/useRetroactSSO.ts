export const useRetroactSSO = () => {
  const config = useRuntimeConfig()
  const { user } = useAuth()

  const getRetroactURL = () => {
    // Use runtime config for retroact URL
    return config.public.retroactUrl
  }

  const generateSSOLink = async () => {
    if (!user.value) {
      throw new Error('User not authenticated')
    }

    try {
      // Get Firebase auth instance and current user
      const { getFirebaseAuth } = await import('~/plugins/01.firebase.client')
      const auth = getFirebaseAuth()
      const firebaseUser = auth.currentUser
      
      if (!firebaseUser) {
        throw new Error('Firebase user not found')
      }

      // Get Firebase ID token
      const idToken = await firebaseUser.getIdToken()
      
      // Generate SSO token from backend
      const response = await $fetch('/api/sso/generate-token', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${idToken}`
        }
      })

      if (!response.ssoToken) {
        throw new Error('Failed to generate SSO token')
      }

      // Build Retroact URL with SSO token
      const retroactURL = getRetroactURL()
      return `${retroactURL}/auth/sso?token=${response.ssoToken}`
    } catch (error) {
      console.error('Failed to generate SSO link:', error)
      throw error
    }
  }

  const launchRetroact = async () => {
    try {
      const ssoLink = await generateSSOLink()
      
      console.log('🚀 Opening Retroact with SSO link:', ssoLink)
      
      // Open in new tab (simple approach)
      const retroactWindow = window.open(ssoLink, '_blank')
      
      if (!retroactWindow) {
        console.error('❌ Popup blocked! Please allow popups for this site.')
        alert('Please allow popups for this site to launch Retroact with SSO.')
        return
      }

      console.log('✅ Retroact opened in new tab')
      
    } catch (error) {
      console.error('Failed to launch Retroact:', error)
      // Fallback to direct link in new tab
      window.open(getRetroactURL(), '_blank')
    }
  }

  return {
    getRetroactURL,
    generateSSOLink,
    launchRetroact
  }
}
