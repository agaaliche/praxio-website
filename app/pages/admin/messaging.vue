<template>
  <ClientOnly>
    <div>
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-display font-bold text-gray-900">Messaging</h1>
          <p class="mt-1 text-gray-600">Send messages to users and view history</p>
        </div>
      </div>

      <div class="grid lg:grid-cols-2 gap-6">
        <!-- Send Message Form -->
        <div class="bg-white rounded-xl border border-gray-200 p-6">
          <h2 class="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
            <i class="fa-solid fa-paper-plane text-red-600"></i>
            Send Message
          </h2>

          <form @submit.prevent="sendMessage" class="space-y-4">
            <!-- Message Type -->
            <div class="flex gap-4">
              <label class="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  v-model="messageType" 
                  value="direct"
                  class="w-4 h-4 text-red-600 border-gray-300 focus:ring-red-500"
                >
                <span class="text-sm text-gray-700">Direct Message</span>
              </label>
              <label class="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  v-model="messageType" 
                  value="broadcast"
                  class="w-4 h-4 text-red-600 border-gray-300 focus:ring-red-500"
                >
                <span class="text-sm text-gray-700">Broadcast</span>
              </label>
            </div>

            <!-- Recipient (for direct) -->
            <div v-if="messageType === 'direct'">
              <label class="block text-sm font-medium text-gray-700 mb-1">Recipient Email</label>
              <input
                v-model="recipientEmail"
                type="email"
                placeholder="user@example.com"
                class="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                required
              >
            </div>

            <!-- Subject -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Subject</label>
              <input
                v-model="subject"
                type="text"
                placeholder="Message subject"
                class="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                required
              >
            </div>

            <!-- Message -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Message</label>
              <textarea
                v-model="message"
                rows="4"
                placeholder="Enter your message..."
                class="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                required
              ></textarea>
            </div>

            <button
              type="submit"
              :disabled="sending"
              class="w-full px-4 py-2.5 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 transition flex items-center justify-center gap-2"
            >
              <i v-if="sending" class="fa-solid fa-spinner animate-spin"></i>
              <i v-else class="fa-solid fa-paper-plane"></i>
              {{ messageType === 'broadcast' ? 'Send Broadcast' : 'Send Message' }}
            </button>
          </form>
        </div>

        <!-- Message History -->
        <div class="bg-white rounded-xl border border-gray-200 p-6">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-medium text-gray-900 flex items-center gap-2">
              <i class="fa-solid fa-clock-rotate-left text-red-600"></i>
              Message History
            </h2>
            <button
              @click="loadHistory"
              :disabled="loadingHistory"
              class="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition"
            >
              <i class="fa-solid fa-rotate" :class="{ 'animate-spin': loadingHistory }"></i>
            </button>
          </div>

          <!-- Loading -->
          <div v-if="loadingHistory" class="text-center py-8">
            <div class="w-6 h-6 border-2 border-red-200 border-t-red-600 rounded-full animate-spin mx-auto"></div>
          </div>

          <!-- History List -->
          <div v-else-if="history.length > 0" class="space-y-3 max-h-96 overflow-y-auto">
            <div 
              v-for="item in history" 
              :key="item.id"
              class="p-3 bg-gray-50 rounded-lg border border-gray-100"
            >
              <div class="flex items-start justify-between gap-2">
                <div class="flex items-center gap-2">
                  <span 
                    class="px-2 py-0.5 text-xs font-medium rounded-full"
                    :class="item.type === 'broadcast' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'"
                  >
                    {{ item.type === 'broadcast' ? 'Broadcast' : 'Direct' }}
                  </span>
                  <span class="text-sm font-medium text-gray-900">{{ item.subject }}</span>
                </div>
                <span class="text-xs text-gray-500 whitespace-nowrap">{{ formatDate(item.created_at) }}</span>
              </div>
              <p class="text-sm text-gray-600 mt-1 line-clamp-2">{{ item.message }}</p>
              <div v-if="item.recipient_email" class="text-xs text-gray-400 mt-1">
                To: {{ item.recipient_email }}
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div v-else class="text-center py-8">
            <i class="fa-solid fa-inbox text-gray-300 text-3xl mb-2"></i>
            <p class="text-gray-500 text-sm">No messages sent yet</p>
          </div>
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

interface MessageHistory {
  id: number
  type: 'direct' | 'broadcast'
  subject: string
  message: string
  recipient_email?: string
  created_at: string
}

const messageType = ref<'direct' | 'broadcast'>('direct')
const recipientEmail = ref('')
const subject = ref('')
const message = ref('')
const sending = ref(false)

const history = ref<MessageHistory[]>([])
const loadingHistory = ref(false)

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

const loadHistory = async () => {
  loadingHistory.value = true
  try {
    const headers = await getAuthHeaders()
    const data = await $fetch<{ messages: MessageHistory[] }>('/api/admin/message-history', { headers })
    history.value = data.messages
  } catch (error: any) {
    console.error('Failed to load message history:', error)
  } finally {
    loadingHistory.value = false
  }
}

const sendMessage = async () => {
  sending.value = true
  try {
    const headers = await getAuthHeaders()
    const endpoint = messageType.value === 'broadcast' ? '/api/admin/broadcast-message' : '/api/admin/send-message'
    
    const body: any = {
      subject: subject.value,
      message: message.value
    }
    
    if (messageType.value === 'direct') {
      body.recipientEmail = recipientEmail.value
    }
    
    await $fetch(endpoint, {
      method: 'POST',
      headers,
      body
    })
    
    // Reset form
    recipientEmail.value = ''
    subject.value = ''
    message.value = ''
    
    // Reload history
    loadHistory()
    
    alert('Message sent successfully')
  } catch (error: any) {
    console.error('Failed to send message:', error)
    alert(error.data?.message || 'Failed to send message')
  } finally {
    sending.value = false
  }
}

onMounted(() => {
  loadHistory()
})
</script>
