<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
  <GlobalNotification />
  <CookieConsent />
</template>

<script setup lang="ts">
import GlobalNotification from '~/components/GlobalNotification.vue'
import CookieConsent from '~/components/CookieConsent.vue'
import { showNotification } from '~/stores/notification'

// Start role checking for invited users
const { user, isAuthenticated, signOutUser } = useAuth()
const { startRoleChecking, stopRoleChecking } = useSubscription()

console.log('🎬 app.vue mounted - setting up role checking watcher')

// Listen for session revoked event - ONLY on client side
let isHandlingRevocation = false

onMounted(() => {
  if (typeof window !== 'undefined') {
    const handleSessionRevoked = async (event: any) => {
      // Prevent multiple simultaneous handlers
      if (isHandlingRevocation) {
        console.log('⚠️ Session revocation already in progress, ignoring duplicate event')
        return
      }
      
      isHandlingRevocation = true
      console.log('🚪 Session revoked event received:', event.detail)
      
      // Show countdown notification
      let countdown = 5
      const updateMessage = () => {
        showNotification(
          `Your session has been signed out from another device.<br>Redirecting in <strong>${countdown}</strong> seconds...`,
          'error',
          1000,
          false
        )
      }
      
      updateMessage()
      
      const countdownInterval = setInterval(() => {
        countdown--
        if (countdown > 0) {
          updateMessage()
        } else {
          clearInterval(countdownInterval)
          signOutUser()
          navigateTo('/signin')
        }
      }, 1000)
    }
    
    window.addEventListener('session-revoked', handleSessionRevoked)
    
    onUnmounted(() => {
      window.removeEventListener('session-revoked', handleSessionRevoked)
    })
  }
})

// Watch for authentication and start/stop role checking
watch([isAuthenticated, () => user.value?.role], ([authenticated, role]) => {
  console.log('👀 app.vue role checking watcher triggered:', {
    authenticated,
    role,
    email: user.value?.email
  })
  
  if (authenticated && role) {
    // User is authenticated and has a role (invited user)
    console.log('▶️ Starting role checking for invited user:', user.value?.email)
    startRoleChecking()
  } else {
    // User is not authenticated or is account owner
    console.log('⏹️ Stopping role checking')
    stopRoleChecking()
  }
}, { immediate: true })

// Cleanup on unmount
onUnmounted(() => {
  console.log('🧹 app.vue unmounting - stopping role checking')
  stopRoleChecking()
})

// Delete session when window/tab closes
if (typeof window !== 'undefined') {
  const deleteSessionOnClose = async () => {
    const { getAuthInstance } = useAuth()
    try {
      const auth = getAuthInstance()
      const token = await auth.currentUser?.getIdToken()
      if (token) {
        // Use fetch with keepalive for reliable cleanup on page unload
        fetch('/api/sessions/delete-current', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({}),
          keepalive: true
        }).catch(() => {
          // Ignore errors during unload
        })
      }
    } catch (e) {
      // Ignore errors during unload
    }
  }

  window.addEventListener('beforeunload', deleteSessionOnClose)
  
  onUnmounted(() => {
    window.removeEventListener('beforeunload', deleteSessionOnClose)
  })
}
</script>
