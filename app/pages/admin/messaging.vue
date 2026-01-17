<template>
  <ClientOnly>
    <div>
      <!-- Header -->
      <div class="mb-6">
        <h1 class="text-2xl font-display font-bold text-gray-900">Messaging</h1>
        <p class="mt-1 text-sm text-gray-600">Send messages to all users or specific accounts</p>
      </div>

      <div class="grid lg:grid-cols-2 gap-6">
        <!-- Broadcast Message -->
        <div class="bg-white rounded-xl border border-gray-200 p-6">
          <h2 class="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
            <ClientOnly>
              <i class="fa-light fa-bullhorn text-red-600"></i>
            </ClientOnly>
            Broadcast Message
          </h2>

          <form @submit.prevent="sendBroadcast" class="space-y-4">
            <!-- Message Type -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Message Type</label>
              <div class="space-y-2">
                <label class="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="radio" 
                    v-model="broadcast.type" 
                    value="snackbar"
                    class="w-4 h-4 text-red-600 border-gray-300 focus:ring-red-500"
                  >
                  <span class="text-sm text-gray-700">Snackbar (bottom notification)</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="radio" 
                    v-model="broadcast.type" 
                    value="dialog"
                    class="w-4 h-4 text-red-600 border-gray-300 focus:ring-red-500"
                  >
                  <span class="text-sm text-gray-700">Dialog (popup)</span>
                </label>
              </div>
            </div>

            <!-- Title (for dialog) -->
            <div v-if="broadcast.type === 'dialog'">
              <label class="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                v-model="broadcast.title"
                type="text"
                placeholder="Dialog title"
                class="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
            </div>

            <!-- Message -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Message</label>
              <textarea
                v-model="broadcast.message"
                rows="4"
                placeholder="Enter your message..."
                class="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                required
              ></textarea>
            </div>

            <!-- Target Audience -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Target Audience</label>
              <select
                v-model="broadcast.target"
                class="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="all">All Users</option>
                <option value="online">Online Users Only</option>
                <option value="trial">Free Trial Users</option>
                <option value="paid">Paid Users</option>
              </select>
            </div>

            <button
              type="submit"
              :disabled="sendingBroadcast || !broadcast.message"
              class="w-full px-4 py-2.5 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <SpinnerIcon v-if="sendingBroadcast" />
              <ClientOnly v-else>
                <i class="fa-light fa-paper-plane"></i>
              </ClientOnly>
              Send Broadcast
            </button>
          </form>
        </div>

        <!-- Direct Message -->
        <div class="bg-white rounded-xl border border-gray-200 p-6">
          <h2 class="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
            <ClientOnly>
              <i class="fa-light fa-message text-red-600"></i>
            </ClientOnly>
            Direct Message
          </h2>

          <form @submit.prevent="sendDirect" class="space-y-4">
            <!-- Recipient -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Select User</label>
              <div class="relative">
                <input
                  v-model="userSearchQuery"
                  type="text"
                  placeholder="Start typing to search users..."
                  @input="searchUsers"
                  @focus="showUserDropdown = true"
                  class="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                <ClientOnly v-if="loadingUsers">
                  <i class="fa-solid fa-spinner-third animate-spin absolute right-3 top-3 text-gray-400"></i>
                </ClientOnly>
                
                <!-- User Dropdown -->
                <div 
                  v-if="showUserDropdown && filteredUsers.length > 0"
                  class="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto"
                >
                  <button
                    v-for="user in filteredUsers"
                    :key="user.email"
                    type="button"
                    @click="selectUser(user)"
                    class="w-full px-4 py-2 text-left hover:bg-gray-50 first:rounded-t-xl last:rounded-b-xl"
                  >
                    <div class="text-sm font-medium text-gray-900">{{ user.email }}</div>
                    <div v-if="user.displayName" class="text-xs text-gray-500">{{ user.displayName }}</div>
                  </button>
                </div>
              </div>
              <div v-if="direct.userEmail" class="mt-2 flex items-center gap-2">
                <span class="text-sm text-gray-600">Selected: {{ direct.userEmail }}</span>
                <button
                  type="button"
                  @click="clearSelection"
                  class="text-red-600 hover:text-red-700"
                >
                  <ClientOnly>
                    <i class="fa-solid fa-xmark"></i>
                  </ClientOnly>
                </button>
              </div>
            </div>

            <!-- Message Type -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Message Type</label>
              <div class="space-y-2">
                <label class="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="radio" 
                    v-model="direct.type" 
                    value="snackbar"
                    class="w-4 h-4 text-red-600 border-gray-300 focus:ring-red-500"
                  >
                  <span class="text-sm text-gray-700">Snackbar (bottom notification)</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="radio" 
                    v-model="direct.type" 
                    value="dialog"
                    class="w-4 h-4 text-red-600 border-gray-300 focus:ring-red-500"
                  >
                  <span class="text-sm text-gray-700">Dialog (popup)</span>
                </label>
              </div>
            </div>

            <!-- Title (for dialog) -->
            <div v-if="direct.type === 'dialog'">
              <label class="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                v-model="direct.title"
                type="text"
                placeholder="Dialog title"
                class="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
            </div>

            <!-- Message -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Message</label>
              <textarea
                v-model="direct.message"
                rows="4"
                placeholder="Enter your message..."
                class="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                required
              ></textarea>
            </div>

            <button
              type="submit"
              :disabled="sendingDirect || !direct.userEmail || !direct.message"
              class="w-full px-4 py-2.5 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <SpinnerIcon v-if="sendingDirect" />
              <ClientOnly v-else>
                <i class="fa-light fa-paper-plane"></i>
              </ClientOnly>
              Send Message
            </button>
          </form>
        </div>

      </div>

      <!-- Message History -->
      <div class="bg-white rounded-xl border border-gray-200 p-6 mt-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-medium text-gray-900 flex items-center gap-2">
            <ClientOnly>
              <i class="fa-light fa-clock-rotate-left text-red-600"></i>
            </ClientOnly>
            Message History
          </h2>
          <button
            @click="loadHistory"
            :disabled="loadingHistory"
            class="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition"
          >
            <ClientOnly>
              <i v-if="loadingHistory" class="fa-solid fa-spinner-third animate-spin"></i>
              <i v-else class="fa-light fa-rotate"></i>
            </ClientOnly>
          </button>
        </div>

        <!-- Loading -->
        <div v-if="loadingHistory" class="text-center py-8">
          <div class="w-6 h-6 border-2 border-red-200 border-t-red-600 rounded-full animate-spin mx-auto"></div>
        </div>

        <!-- History Table -->
        <div v-else-if="history.length > 0" class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-gray-200">
                <th class="text-left py-3 px-2 font-medium text-gray-700">Type</th>
                <th class="text-left py-3 px-2 font-medium text-gray-700">Target</th>
                <th class="text-left py-3 px-2 font-medium text-gray-700">Message</th>
                <th class="text-left py-3 px-2 font-medium text-gray-700">Sent By</th>
                <th class="text-left py-3 px-2 font-medium text-gray-700">Date</th>
              </tr>
            </thead>
            <tbody>
              <tr 
                v-for="item in history" 
                :key="item.id || `${item.type}-${item.createdAt}`"
                class="border-b border-gray-100 hover:bg-gray-50"
              >
                <td class="py-3 px-2">
                  <span 
                    class="px-2 py-0.5 text-xs font-medium rounded-full"
                    :class="item.type === 'broadcast' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'"
                  >
                    {{ item.type }}
                  </span>
                </td>
                <td class="py-3 px-2 text-gray-600">{{ item.target || 'N/A' }}</td>
                <td class="py-3 px-2 text-gray-900">
                  <div class="max-w-md truncate">{{ item.message }}</div>
                </td>
                <td class="py-3 px-2 text-gray-600">{{ item.sentBy || 'System' }}</td>
                <td class="py-3 px-2 text-gray-500 whitespace-nowrap">{{ formatDate(item.createdAt) }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Empty State -->
        <div v-else class="text-center py-8">
          <ClientOnly>
            <i class="fa-light fa-inbox text-gray-300 text-3xl mb-2"></i>
          </ClientOnly>
          <p class="text-gray-500 text-sm">No messages sent yet</p>
        </div>
      </div>
    </div>
    <template #fallback>
      <div class="text-center py-12">
        <div class="w-8 h-8 border-4 border-red-200 border-t-red-600 rounded-full animate-spin mx-auto"></div>
        <p class="mt-2 text-gray-500">Loading messaging...</p>
      </div>
    </template>
  </ClientOnly>
</template>

<script setup lang="ts">
const { getAuthHeaders } = useAuth()

interface User {
  uid: string
  email: string
  displayName?: string
}

interface MessageHistory {
  type: 'direct' | 'broadcast'
  target?: string
  message: string
  sentBy?: string
  createdAt: string
}

// Broadcast form
const broadcast = ref({
  type: 'snackbar' as 'snackbar' | 'dialog',
  title: '',
  message: '',
  target: 'all'
})

// Direct message form
const direct = ref({
  userEmail: '',
  type: 'snackbar' as 'snackbar' | 'dialog',
  title: '',
  message: ''
})

const sendingBroadcast = ref(false)
const sendingDirect = ref(false)

// User search
const userSearchQuery = ref('')
const showUserDropdown = ref(false)
const loadingUsers = ref(false)
const allUsers = ref<User[]>([])
const filteredUsers = ref<User[]>([])

// History
const history = ref<MessageHistory[]>([])
const loadingHistory = ref(false)

const formatDate = (dateStr: string) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleString()
}

// Load all users on mount
const loadUsers = async () => {
  loadingUsers.value = true
  try {
    const headers = await getAuthHeaders()
    const data = await $fetch<{ users: User[] }>('/api/admin/users', { headers })
    allUsers.value = data.users || []
  } catch (error: any) {
    console.error('Failed to load users:', error)
  } finally {
    loadingUsers.value = false
  }
}

// Search users
const searchUsers = () => {
  const query = userSearchQuery.value.toLowerCase()
  if (!query) {
    filteredUsers.value = []
    return
  }
  
  filteredUsers.value = allUsers.value.filter(user => 
    user.email.toLowerCase().includes(query) ||
    (user.displayName && user.displayName.toLowerCase().includes(query))
  ).slice(0, 10)
}

// Select user from dropdown
const selectUser = (user: User) => {
  direct.value.userEmail = user.email
  userSearchQuery.value = user.email
  showUserDropdown.value = false
  filteredUsers.value = []
}

// Clear selection
const clearSelection = () => {
  direct.value.userEmail = ''
  userSearchQuery.value = ''
  filteredUsers.value = []
}

// Close dropdown when clicking outside
if (process.client) {
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement
    if (!target.closest('.relative')) {
      showUserDropdown.value = false
    }
  })
}

const loadHistory = async () => {
  loadingHistory.value = true
  try {
    const headers = await getAuthHeaders()
    const data = await $fetch<{ messages: MessageHistory[] }>('/api/admin/message-history', { headers })
    history.value = data.messages || []
  } catch (error: any) {
    console.error('Failed to load message history:', error)
  } finally {
    loadingHistory.value = false
  }
}

const sendBroadcast = async () => {
  sendingBroadcast.value = true
  try {
    const headers = await getAuthHeaders()
    
    await $fetch('/api/admin/broadcast-message', {
      method: 'POST',
      headers,
      body: {
        type: broadcast.value.type,
        title: broadcast.value.title,
        message: broadcast.value.message,
        target: broadcast.value.target
      }
    })
    
    // Reset form
    broadcast.value = {
      type: 'snackbar',
      title: '',
      message: '',
      target: 'all'
    }
    
    // Reload history
    await loadHistory()
    
    alert('Broadcast sent successfully')
  } catch (error: any) {
    console.error('Failed to send broadcast:', error)
    alert(error.data?.message || 'Failed to send broadcast')
  } finally {
    sendingBroadcast.value = false
  }
}

const sendDirect = async () => {
  sendingDirect.value = true
  try {
    const headers = await getAuthHeaders()
    
    await $fetch('/api/admin/send-message', {
      method: 'POST',
      headers,
      body: {
        recipientEmail: direct.value.userEmail,
        type: direct.value.type,
        title: direct.value.title,
        message: direct.value.message
      }
    })
    
    // Reset form
    direct.value = {
      userEmail: '',
      type: 'snackbar',
      title: '',
      message: ''
    }
    clearSelection()
    
    // Reload history
    await loadHistory()
    
    alert('Message sent successfully')
  } catch (error: any) {
    console.error('Failed to send message:', error)
    alert(error.data?.message || 'Failed to send message')
  } finally {
    sendingDirect.value = false
  }
}

onMounted(() => {
  loadUsers()
  loadHistory()
})
</script>
