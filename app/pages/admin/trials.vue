<template>
  <div>
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-display font-bold text-gray-900">Trial Management</h1>
        <p class="mt-1 text-gray-600">Manage user trials and grant free time</p>
      </div>
      <button
        @click="loadTrialUsers"
        :disabled="loading"
        class="px-4 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition"
      >
        <SpinnerIcon v-show="loading" />
        <svg v-show="!loading" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" class="w-4 h-4 fill-current"><path d="M142.9 142.9c-17.5 17.5-30.1 38-37.8 59.8c-5.9 16.7-24.2 25.4-40.8 19.5s-25.4-24.2-19.5-40.8C55.6 150.7 73.2 122 97.6 97.6c87.2-87.2 228.3-87.5 315.8-1L455 55c6.9-6.9 17.2-8.9 26.2-5.2s14.8 12.5 14.8 22.2l0 128c0 13.3-10.7 24-24 24l-8.4 0c0 0 0 0 0 0L344 224c-9.7 0-18.5-5.8-22.2-14.8s-1.7-19.3 5.2-26.2l41.1-41.1c-62.6-61.5-163.1-61.2-225.3 1zM16 312c0-13.3 10.7-24 24-24l7.6 0 .7 0L168 288c9.7 0 18.5 5.8 22.2 14.8s1.7 19.3-5.2 26.2l-41.1 41.1c62.6 61.5 163.1 61.2 225.3-1c17.5-17.5 30.1-38 37.8-59.8c5.9-16.7 24.2-25.4 40.8-19.5s25.4 24.2 19.5 40.8c-10.8 30.6-28.4 59.3-52.9 83.8c-87.2 87.2-228.3 87.5-315.8 1L57 457c-6.9 6.9-17.2 8.9-26.2 5.2S16 449.7 16 440l0-119.6 0-.7 0-7.6z"/></svg>
      </button>
    </div>

    <div class="grid lg:grid-cols-3 gap-6">
      <!-- Trial Users List -->
      <div class="lg:col-span-2">
        <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div class="p-4 border-b border-gray-200 flex items-center justify-between">
            <h2 class="font-medium text-gray-900">Users on Trial</h2>
            <span class="text-sm text-gray-500">{{ trialUsers.length }} users</span>
          </div>

          <!-- Loading -->
          <div v-if="loading" class="text-center py-12">
            <div class="w-8 h-8 border-4 border-red-200 border-t-red-600 rounded-full animate-spin mx-auto"></div>
          </div>

          <!-- List -->
          <div v-else-if="trialUsers.length > 0" class="divide-y divide-gray-200 max-h-96 overflow-y-auto">
            <div 
              v-for="user in trialUsers" 
              :key="user.uid"
              class="p-4 hover:bg-gray-50 flex items-center justify-between"
            >
              <div>
                <div class="font-medium text-gray-900">{{ user.email }}</div>
                <div class="text-sm text-gray-500">
                  <!-- Show subscription info if active -->
                  <template v-if="hasActiveSubscription(user)">
                    <span class="text-green-600 font-medium">{{ user.plan_type }}</span>
                    <span class="ml-2 px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-700">
                      Active until {{ formatDate(user.subscription_end_date) }}
                    </span>
                  </template>
                  <!-- Show trial info otherwise -->
                  <template v-else>
                    Trial ends: {{ formatDate(user.trial_ends_at) }}
                    <span 
                      class="ml-2 px-2 py-0.5 text-xs rounded-full"
                      :class="getDaysLeftClass(user.trial_ends_at)"
                    >
                      {{ getDaysLeft(user.trial_ends_at) }}
                    </span>
                  </template>
                </div>
              </div>
              <!-- Only show buttons if user does NOT have an active subscription -->
              <div v-if="!hasActiveSubscription(user)" class="flex gap-2">
                <button
                  @click="openExtendModal(user)"
                  class="px-3 py-1.5 text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition"
                >
                  Extend
                </button>
                <button
                  @click="openFreeMonthModal(user)"
                  class="px-3 py-1.5 text-sm bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition"
                >
                  Free Month
                </button>
              </div>
              <!-- Show "Subscribed" badge instead of buttons -->
              <div v-else>
                <span class="px-3 py-1.5 text-sm bg-gray-100 text-gray-500 rounded-lg">
                  Subscribed
                </span>
              </div>
            </div>
          </div>

          <!-- Empty -->
          <div v-else class="p-12 text-center">
            <ClientOnly>
              <i class="fa-solid fa-hourglass-empty text-gray-300 text-3xl mb-2"></i>
            </ClientOnly>
            <p class="text-gray-500">No users currently on trial</p>
          </div>
        </div>
      </div>

      <!-- History -->
      <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div class="p-4 border-b border-gray-200 flex items-center justify-between">
          <h2 class="font-medium text-gray-900">Extension History</h2>
          <button
            @click="loadHistory"
            :disabled="loadingHistory"
            class="p-1.5 text-gray-500 hover:text-gray-700 rounded"
          >
            <SpinnerIcon v-show="loadingHistory" size="xs" />
            <svg v-show="!loadingHistory" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" class="w-3.5 h-3.5 fill-current"><path d="M142.9 142.9c-17.5 17.5-30.1 38-37.8 59.8c-5.9 16.7-24.2 25.4-40.8 19.5s-25.4-24.2-19.5-40.8C55.6 150.7 73.2 122 97.6 97.6c87.2-87.2 228.3-87.5 315.8-1L455 55c6.9-6.9 17.2-8.9 26.2-5.2s14.8 12.5 14.8 22.2l0 128c0 13.3-10.7 24-24 24l-8.4 0c0 0 0 0 0 0L344 224c-9.7 0-18.5-5.8-22.2-14.8s-1.7-19.3 5.2-26.2l41.1-41.1c-62.6-61.5-163.1-61.2-225.3 1zM16 312c0-13.3 10.7-24 24-24l7.6 0 .7 0L168 288c9.7 0 18.5 5.8 22.2 14.8s1.7 19.3-5.2 26.2l-41.1 41.1c62.6 61.5 163.1 61.2 225.3-1c17.5-17.5 30.1-38 37.8-59.8c5.9-16.7 24.2-25.4 40.8-19.5s25.4 24.2 19.5 40.8c-10.8 30.6-28.4 59.3-52.9 83.8c-87.2 87.2-228.3 87.5-315.8 1L57 457c-6.9 6.9-17.2 8.9-26.2 5.2S16 449.7 16 440l0-119.6 0-.7 0-7.6z"/></svg>
          </button>
        </div>

        <!-- Loading -->
        <div v-if="loadingHistory" class="text-center py-8">
          <div class="w-6 h-6 border-2 border-red-200 border-t-red-600 rounded-full animate-spin mx-auto"></div>
        </div>

        <!-- History List -->
        <div v-else-if="history.length > 0" class="divide-y divide-gray-200 max-h-80 overflow-y-auto">
          <div v-for="item in history" :key="item.id" class="p-3 text-sm">
            <div class="flex items-center justify-between">
              <span class="font-medium text-gray-900">{{ item.user_email }}</span>
              <span 
                class="px-2 py-0.5 text-xs rounded-full"
                :class="item.type === 'extension' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'"
              >
                {{ item.type === 'extension' ? 'Extended' : 'Free Month' }}
              </span>
            </div>
            <div class="text-gray-500 mt-1">
              +{{ item.days }} days • {{ formatDate(item.created_at) }}
            </div>
            <div v-if="item.reason" class="text-gray-400 text-xs mt-1">
              {{ item.reason }}
            </div>
          </div>
        </div>

        <!-- Empty -->
        <div v-else class="p-8 text-center">
          <ClientOnly>
            <i class="fa-solid fa-clock-rotate-left text-gray-300 text-2xl mb-2"></i>
          </ClientOnly>
          <p class="text-gray-500 text-sm">No extensions yet</p>
        </div>
      </div>
    </div>

    <!-- Extend Trial Modal -->
    <Teleport to="body">
      <div 
        v-if="showExtendModal" 
        class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        @click.self="showExtendModal = false"
      >
        <div class="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6">
          <h3 class="text-lg font-bold text-gray-900 mb-4">Extend Trial</h3>
          <p class="text-sm text-gray-600 mb-4">Extending trial for: {{ selectedUser?.email }}</p>
          
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Days to Add</label>
              <input
                v-model.number="extendDays"
                type="number"
                min="1"
                class="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Reason (optional)</label>
              <input
                v-model="extendReason"
                type="text"
                placeholder="Why are you extending?"
                class="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
            </div>
          </div>
          
          <div class="flex gap-3 mt-6">
            <button
              @click="showExtendModal = false"
              class="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              @click="extendTrial"
              :disabled="extending"
              class="flex-1 px-4 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition flex items-center justify-center gap-2"
            >
              <SpinnerIcon v-if="extending" />
              Extend Trial
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Free Month Modal -->
    <Teleport to="body">
      <div 
        v-if="showFreeMonthModal" 
        class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        @click.self="showFreeMonthModal = false"
      >
        <div class="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6">
          <h3 class="text-lg font-bold text-gray-900 mb-4">Give Free Month</h3>
          <p class="text-sm text-gray-600 mb-4">Giving free month to: {{ selectedUser?.email }}</p>
          
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Number of Months</label>
              <input
                v-model.number="freeMonths"
                type="number"
                min="1"
                class="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Reason (optional)</label>
              <input
                v-model="freeMonthReason"
                type="text"
                placeholder="Why are you giving free time?"
                class="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
            </div>
          </div>
          
          <div class="flex gap-3 mt-6">
            <button
              @click="showFreeMonthModal = false"
              class="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              @click="giveFreeMonth"
              :disabled="givingFreeMonth"
              class="flex-1 px-4 py-2.5 bg-green-600 text-white font-medium rounded-xl hover:bg-green-700 transition flex items-center justify-center gap-2"
            >
              <SpinnerIcon v-if="givingFreeMonth" />
              Give Free Month
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
const { getAuthHeaders } = useAuth()

interface TrialUser {
  uid: string
  email: string
  trial_ends_at: string
  subscription_status: string | null
  plan_type: string | null
  subscription_end_date: string | null
}

interface HistoryItem {
  id: number
  user_email: string
  type: 'extension' | 'free_month'
  days: number
  reason: string
  created_at: string
}

const trialUsers = ref<TrialUser[]>([])
const loading = ref(false)

const history = ref<HistoryItem[]>([])
const loadingHistory = ref(false)

const showExtendModal = ref(false)
const showFreeMonthModal = ref(false)
const selectedUser = ref<TrialUser | null>(null)

const extendDays = ref(7)
const extendReason = ref('')
const extending = ref(false)

const freeMonths = ref(1)
const freeMonthReason = ref('')
const givingFreeMonth = ref(false)

const formatDate = (dateStr: string | null) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString()
}

const hasActiveSubscription = (user: TrialUser) => {
  return user.subscription_status === 'active' || user.subscription_status === 'trialing'
}

const getDaysLeft = (dateStr: string) => {
  const end = new Date(dateStr)
  const now = new Date()
  const days = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  if (days < 0) return 'Expired'
  if (days === 0) return 'Today'
  if (days === 1) return '1 day left'
  return `${days} days left`
}

const getDaysLeftClass = (dateStr: string) => {
  const end = new Date(dateStr)
  const now = new Date()
  const days = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  if (days <= 0) return 'bg-red-100 text-red-700'
  if (days <= 3) return 'bg-yellow-100 text-yellow-700'
  return 'bg-green-100 text-green-700'
}

const loadTrialUsers = async () => {
  loading.value = true
  try {
    const headers = await getAuthHeaders()
    const data = await $fetch<{ users: TrialUser[] }>('/api/admin/trial-users', { headers })
    trialUsers.value = data.users
  } catch (error: any) {
    console.error('Failed to load trial users:', error)
  } finally {
    loading.value = false
  }
}

const loadHistory = async () => {
  loadingHistory.value = true
  try {
    const headers = await getAuthHeaders()
    const data = await $fetch<{ history: HistoryItem[] }>('/api/admin/trial-history', { headers })
    history.value = data.history
  } catch (error: any) {
    console.error('Failed to load history:', error)
  } finally {
    loadingHistory.value = false
  }
}

const openExtendModal = (user: TrialUser) => {
  selectedUser.value = user
  extendDays.value = 7
  extendReason.value = ''
  showExtendModal.value = true
}

const openFreeMonthModal = (user: TrialUser) => {
  selectedUser.value = user
  freeMonths.value = 1
  freeMonthReason.value = ''
  showFreeMonthModal.value = true
}

const extendTrial = async () => {
  if (!selectedUser.value) return
  extending.value = true
  try {
    const headers = await getAuthHeaders()
    await $fetch('/api/admin/extend-trial', {
      method: 'POST',
      headers,
      body: {
        uid: selectedUser.value.uid,
        days: extendDays.value,
        reason: extendReason.value
      }
    })
    showExtendModal.value = false
    loadTrialUsers()
    loadHistory()
  } catch (error: any) {
    console.error('Failed to extend trial:', error)
    alert(error.data?.message || 'Failed to extend trial')
  } finally {
    extending.value = false
  }
}

const giveFreeMonth = async () => {
  if (!selectedUser.value) return
  givingFreeMonth.value = true
  try {
    const headers = await getAuthHeaders()
    await $fetch('/api/admin/give-free-month', {
      method: 'POST',
      headers,
      body: {
        uid: selectedUser.value.uid,
        months: freeMonths.value,
        reason: freeMonthReason.value
      }
    })
    showFreeMonthModal.value = false
    loadTrialUsers()
    loadHistory()
  } catch (error: any) {
    console.error('Failed to give free month:', error)
    alert(error.data?.message || 'Failed to give free month')
  } finally {
    givingFreeMonth.value = false
  }
}

onMounted(() => {
  loadTrialUsers()
  loadHistory()
})
</script>
