<template>
  <!-- Backdrop -->
  <Transition name="backdrop">
    <div
      v-if="isOpen"
      class="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
      @click="emit('close')"
    />
  </Transition>

  <!-- Sliding Panel -->
  <Transition name="slide">
    <div
      v-if="isOpen"
      class="fixed top-0 right-0 h-full w-full sm:w-96 bg-white shadow-2xl z-50 flex flex-col"
    >
      <!-- Header -->
      <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
        <div class="flex items-center gap-2">
          <i class="fa-solid fa-bell text-blue-500 text-lg"></i>
          <h2 class="text-lg font-semibold text-gray-900">Notifications</h2>
          <span
            v-if="notifications.length > 0"
            class="bg-blue-500 text-white text-xs font-bold px-2 py-0.5 rounded-full"
          >
            {{ notifications.length }}
          </span>
        </div>
        <button
          @click="emit('close')"
          class="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <i class="fa-solid fa-times text-xl"></i>
        </button>
      </div>

      <!-- Notifications List -->
      <div class="flex-1 overflow-y-auto">
        <div v-if="loading" class="flex items-center justify-center py-12">
          <i class="fa-solid fa-spinner fa-spin text-gray-400 text-2xl"></i>
        </div>

        <div v-else-if="notifications.length === 0" class="flex flex-col items-center justify-center py-12 px-6 text-center">
          <i class="fa-solid fa-bell-slash text-gray-300 text-5xl mb-4"></i>
          <p class="text-gray-500 font-medium">No notifications</p>
          <p class="text-gray-400 text-sm mt-1">You're all caught up!</p>
        </div>

        <div v-else class="divide-y divide-gray-100">
          <div
            v-for="notification in notifications"
            :key="notification.id"
            class="relative group hover:bg-gray-50 transition-colors"
          >
            <div class="px-6 py-4 pr-12">
              <!-- Badge -->
              <div class="flex items-center gap-2 mb-2">
                <span
                  class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
                  :class="{
                    'bg-purple-100 text-purple-800': notification.source === 'broadcast',
                    'bg-blue-100 text-blue-800': notification.source === 'direct'
                  }"
                >
                  <i
                    class="fa-solid mr-1 text-xs"
                    :class="{
                      'fa-bullhorn': notification.source === 'broadcast',
                      'fa-envelope': notification.source === 'direct'
                    }"
                  ></i>
                  {{ notification.source === 'broadcast' ? 'Broadcast' : 'Direct' }}
                </span>
                <span
                  v-if="notification.type === 'dialog'"
                  class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700"
                >
                  <i class="fa-solid fa-comment-dots mr-1 text-xs"></i>
                  Dialog
                </span>
              </div>

              <!-- Title (if exists) -->
              <h3
                v-if="notification.title"
                class="font-semibold text-gray-900 mb-1"
              >
                {{ notification.title }}
              </h3>

              <!-- Message -->
              <p class="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                {{ notification.message }}
              </p>

              <!-- Timestamp -->
              <p class="text-xs text-gray-400 mt-2">
                {{ formatDate(notification.createdAt) }}
              </p>
            </div>

            <!-- Delete Button -->
            <button
              @click="deleteNotification(notification.id, notification.source)"
              class="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-500"
              title="Delete notification"
            >
              <i class="fa-solid fa-times text-lg"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- Footer Actions -->
      <div
        v-if="notifications.length > 0"
        class="px-6 py-4 border-t border-gray-200 bg-gray-50"
      >
        <button
          @click="clearAll"
          :disabled="clearing"
          class="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <i class="fa-solid fa-trash-can mr-2"></i>
          {{ clearing ? 'Clearing...' : 'Clear All' }}
        </button>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'

interface Notification {
  id: number
  type: 'snackbar' | 'dialog'
  title?: string
  message: string
  source: 'direct' | 'broadcast'
  createdAt: string
}

const props = defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  close: []
  refresh: []
}>()

const notifications = ref<Notification[]>([])
const loading = ref(false)
const clearing = ref(false)

// Fetch notifications
const fetchNotifications = async () => {
  loading.value = true
  try {
    const { getAuthHeaders } = useAuth()
    const headers = await getAuthHeaders()
    
    const response = await fetch('/api/messages/all', { headers })
    const data = await response.json()
    
    if (data.success) {
      notifications.value = data.messages || []
      console.log('📬 Fetched notifications:', notifications.value.length)
      
      // Mark all unread direct messages as read
      const unreadDirectMessages = notifications.value.filter(
        n => n.source === 'direct' && !n.readAt
      )
      
      // Get all broadcasts to mark as dismissed
      const broadcastMessages = notifications.value.filter(n => n.source === 'broadcast')
      
      console.log('📝 Unread direct messages:', unreadDirectMessages.length)
      console.log('📢 Broadcasts to dismiss:', broadcastMessages.length)
      
      const promises = []
      
      // Mark direct messages as read
      if (unreadDirectMessages.length > 0) {
        unreadDirectMessages.forEach(msg => {
          promises.push(
            fetch(`/api/messages/${msg.id}`, {
              method: 'PATCH',
              headers
            }).then(() => console.log(`✅ Marked message ${msg.id} as read`))
            .catch(err => console.error(`❌ Failed to mark ${msg.id} as read:`, err))
          )
        })
      }
      
      // Mark broadcasts as dismissed
      if (broadcastMessages.length > 0) {
        broadcastMessages.forEach(msg => {
          promises.push(
            fetch(`/api/messages/${msg.id}/dismiss`, {
              method: 'POST',
              headers
            }).then(() => console.log(`✅ Dismissed broadcast ${msg.id}`))
            .catch(err => console.error(`❌ Failed to dismiss ${msg.id}:`, err))
          )
        })
      }
      
      if (promises.length > 0) {
        await Promise.all(promises)
        console.log('🔄 Refreshing unread count...')
        // Refresh unread count in header
        emit('refresh')
      }
    }
  } catch (error) {
    console.error('❌ Error fetching notifications:', error)
  } finally {
    loading.value = false
  }
}

// Mark all direct messages as read (removed - integrated into fetchNotifications)


// Delete single notification
const deleteNotification = async (id: number, source: 'direct' | 'broadcast') => {
  try {
    const { getAuthHeaders } = useAuth()
    const headers = await getAuthHeaders()
    
    await fetch(`/api/messages/${id}?source=${source}`, {
      method: 'DELETE',
      headers
    })
    
    // Remove from list
    notifications.value = notifications.value.filter(n => n.id !== id)
    emit('refresh')
  } catch (error) {
    console.error('❌ Error deleting notification:', error)
  }
}

// Clear all notifications
const clearAll = async () => {
  if (!confirm('Delete all notifications?')) return
  
  clearing.value = true
  try {
    const deletePromises = notifications.value.map(n => 
      deleteNotification(n.id, n.source)
    )
    await Promise.all(deletePromises)
    notifications.value = []
    emit('refresh')
  } catch (error) {
    console.error('❌ Error clearing notifications:', error)
  } finally {
    clearing.value = false
  }
}

// Format date
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)
  
  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  })
}

// Watch isOpen to fetch when opened
watch(() => props.isOpen, (open) => {
  if (open) {
    fetchNotifications()
    // Hide main window scrollbar and prevent scroll
    document.body.style.overflow = 'hidden'
  } else {
    // Restore main window scrollbar
    document.body.style.overflow = ''
  }
})

// Fetch on mount if already open
onMounted(() => {
  if (props.isOpen) {
    fetchNotifications()
    document.body.style.overflow = 'hidden'
  }
})

// Cleanup on unmount
onUnmounted(() => {
  document.body.style.overflow = ''
})
</script>

<style scoped>
.backdrop-enter-active,
.backdrop-leave-active {
  transition: opacity 0.3s ease;
}

.backdrop-enter-from,
.backdrop-leave-to {
  opacity: 0;
}

.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(100%);
}
</style>
