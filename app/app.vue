<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
  <GlobalNotification />
  <CookieConsent />
  
  <!-- Admin Messages Display -->
  <MessageSnackbar
    v-if="currentSnackbar"
    :message="currentSnackbar"
    @close="handleSnackbarClose"
    @read="markMessageAsRead"
  />
  <MessageDialog
    v-if="currentDialog"
    :message="currentDialog"
    @close="handleDialogClose"
    @read="markMessageAsRead"
  />
</template>

<script setup lang="ts">
import GlobalNotification from '~/components/GlobalNotification.vue'
import CookieConsent from '~/components/CookieConsent.vue'
import MessageSnackbar from '~/components/MessageSnackbar.vue'
import MessageDialog from '~/components/MessageDialog.vue'
import { showNotification } from '~/stores/notification'

// Start role checking for invited users
const { user, isAuthenticated, signOutUser } = useAuth()
const { startRoleChecking, stopRoleChecking } = useSubscription()

// Admin messages state
interface AdminMessage {
  id: number
  type: 'snackbar' | 'dialog'
  title?: string
  message: string
  source: 'direct' | 'broadcast'
  createdAt: string
}

const messageQueue = ref<AdminMessage[]>([])
const currentSnackbar = ref<AdminMessage | null>(null)
const currentDialog = ref<AdminMessage | null>(null)
const shownMessageIds = ref<Set<number>>(new Set())
let pollInterval: NodeJS.Timeout | null = null

// Load shown message IDs from localStorage
if (process.client) {
  const stored = localStorage.getItem('shownMessageIds')
  if (stored) {
    try {
      const ids = JSON.parse(stored)
      shownMessageIds.value = new Set(ids)
    } catch (e) {
      console.error('Failed to parse stored message IDs')
    }
  }
}

// Save shown message IDs to localStorage
const saveShownMessageIds = () => {
  if (process.client) {
    localStorage.setItem('shownMessageIds', JSON.stringify(Array.from(shownMessageIds.value)))
  }
}

// Fetch messages from server
const fetchMessages = async () => {
  if (!isAuthenticated.value) return
  
  try {
    const { getAuthHeaders } = useAuth()
    const headers = await getAuthHeaders()
    
    const response = await fetch('/api/messages/inbox', { headers })
    const data = await response.json()
    
    if (data.success && data.messages) {
      // Filter out messages we've already shown
      const newMessages = data.messages.filter((msg: AdminMessage) => 
        !shownMessageIds.value.has(msg.id)
      )
      
      if (newMessages.length > 0) {
        console.log(`📬 Received ${newMessages.length} new message(s)`)
        messageQueue.value.push(...newMessages)
        processMessageQueue()
      }
    }
  } catch (error) {
    console.error('❌ Error fetching messages:', error)
  }
}

// Process message queue
const processMessageQueue = () => {
  if (messageQueue.value.length === 0) return
  
  const nextMessage = messageQueue.value[0]
  
  // Show snackbar or dialog based on type
  if (nextMessage.type === 'snackbar') {
    if (!currentSnackbar.value) {
      currentSnackbar.value = nextMessage
      shownMessageIds.value.add(nextMessage.id)
      saveShownMessageIds()
      messageQueue.value.shift()
    }
  } else if (nextMessage.type === 'dialog') {
    if (!currentDialog.value) {
      currentDialog.value = nextMessage
      shownMessageIds.value.add(nextMessage.id)
      saveShownMessageIds()
      messageQueue.value.shift()
    }
  }
}

// Mark message as read
const markMessageAsRead = async (messageId: number) => {
  try {
    const { getAuthHeaders } = useAuth()
    const headers = await getAuthHeaders()
    
    await fetch(`/api/messages/${messageId}`, {
      method: 'PATCH',
      headers
    })
    console.log(`✅ Message ${messageId} marked as read`)
  } catch (error) {
    console.error('❌ Error marking message as read:', error)
  }
}

// Handle snackbar close
const handleSnackbarClose = () => {
  currentSnackbar.value = null
  // Process next message in queue after a short delay
  setTimeout(() => processMessageQueue(), 500)
}

// Handle dialog close
const handleDialogClose = () => {
  currentDialog.value = null
  // Process next message in queue after a short delay
  setTimeout(() => processMessageQueue(), 500)
}

// Start polling for messages when authenticated
watch(isAuthenticated, (authenticated) => {
  if (authenticated) {
    console.log('📨 Starting message polling')
    fetchMessages() // Fetch immediately
    pollInterval = setInterval(fetchMessages, 30000) // Poll every 30 seconds
  } else {
    console.log('📭 Stopping message polling')
    if (pollInterval) {
      clearInterval(pollInterval)
      pollInterval = null
    }
    messageQueue.value = []
    currentSnackbar.value = null
    currentDialog.value = null
    shownMessageIds.value.clear()
  }
}, { immediate: true })

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
  if (pollInterval) {
    clearInterval(pollInterval)
    pollInterval = null
  }
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
