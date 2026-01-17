<template>
  <div>
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-display font-bold text-gray-900">Accounts</h1>
        <p class="mt-1 text-gray-600">View all accounts and their subscription status</p>
      </div>
      <button
        @click="loadAccounts"
        :disabled="loading"
        class="px-4 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition"
      >
        <SpinnerIcon v-show="loading" />
        <svg v-show="!loading" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" class="w-4 h-4 fill-current"><path d="M142.9 142.9c-17.5 17.5-30.1 38-37.8 59.8c-5.9 16.7-24.2 25.4-40.8 19.5s-25.4-24.2-19.5-40.8C55.6 150.7 73.2 122 97.6 97.6c87.2-87.2 228.3-87.5 315.8-1L455 55c6.9-6.9 17.2-8.9 26.2-5.2s14.8 12.5 14.8 22.2l0 128c0 13.3-10.7 24-24 24l-8.4 0c0 0 0 0 0 0L344 224c-9.7 0-18.5-5.8-22.2-14.8s-1.7-19.3 5.2-26.2l41.1-41.1c-62.6-61.5-163.1-61.2-225.3 1zM16 312c0-13.3 10.7-24 24-24l7.6 0 .7 0L168 288c9.7 0 18.5 5.8 22.2 14.8s1.7 19.3-5.2 26.2l-41.1 41.1c62.6 61.5 163.1 61.2 225.3-1c17.5-17.5 30.1-38 37.8-59.8c5.9-16.7 24.2-25.4 40.8-19.5s25.4 24.2 19.5 40.8c-10.8 30.6-28.4 59.3-52.9 83.8c-87.2 87.2-228.3 87.5-315.8 1L57 457c-6.9 6.9-17.2 8.9-26.2 5.2S16 449.7 16 440l0-119.6 0-.7 0-7.6z"/></svg>
      </button>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div class="bg-white rounded-xl border border-gray-200 p-4">
        <div class="text-2xl font-bold text-gray-900">{{ accounts.length }}</div>
        <div class="text-sm text-gray-500">Total Accounts</div>
      </div>
      <div class="bg-white rounded-xl border border-gray-200 p-4">
        <div class="text-2xl font-bold text-green-600">{{ activeCount }}</div>
        <div class="text-sm text-gray-500">Active</div>
      </div>
      <div class="bg-white rounded-xl border border-gray-200 p-4">
        <div class="text-2xl font-bold text-yellow-600">{{ trialCount }}</div>
        <div class="text-sm text-gray-500">On Trial</div>
      </div>
      <div class="bg-white rounded-xl border border-gray-200 p-4">
        <div class="text-2xl font-bold text-blue-600">{{ totalPatients }}</div>
        <div class="text-sm text-gray-500">Total Patients</div>
      </div>
    </div>

    <!-- Search -->
    <div class="mb-4">
      <ClientOnly>
        <div class="relative max-w-md">
          <ClientOnly>
            <i class="fa-solid fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
          </ClientOnly>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search accounts..."
            class="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
          >
        </div>
        <template #fallback>
          <div class="relative max-w-md">
            <input
              type="text"
              placeholder="Search accounts..."
              class="w-full pl-4 pr-4 py-2.5 border border-gray-300 rounded-xl"
            >
          </div>
        </template>
      </ClientOnly>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12">
      <div class="w-8 h-8 border-4 border-red-200 border-t-red-600 rounded-full animate-spin mx-auto"></div>
      <p class="mt-2 text-gray-500">Loading accounts...</p>
    </div>

    <!-- Accounts Table -->
    <div v-else-if="filteredAccounts.length > 0" class="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50 border-b border-gray-200">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Account</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patients</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr v-for="account in filteredAccounts" :key="account.id" class="hover:bg-gray-50">
              <td class="px-4 py-4">
                <div class="font-medium text-gray-900">{{ account.name || 'Unnamed Account' }}</div>
                <div class="text-sm text-gray-500">{{ account.owner_email }}</div>
              </td>
              <td class="px-4 py-4">
                <span 
                  class="px-2.5 py-1 text-xs font-medium rounded-full"
                  :class="getStatusClass(account)"
                >
                  {{ getStatusLabel(account) }}
                </span>
              </td>
              <td class="px-4 py-4 text-gray-700">
                {{ account.patient_count || 0 }}
              </td>
              <td class="px-4 py-4 text-gray-700">
                {{ account.plan || 'Free' }}
              </td>
              <td class="px-4 py-4 text-gray-500 text-sm">
                {{ formatDate(account.created_at) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="bg-white rounded-xl border border-gray-200 p-12 text-center">
      <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <ClientOnly>
          <i class="fa-solid fa-building text-gray-400 text-2xl"></i>
        </ClientOnly>
      </div>
      <h3 class="text-lg font-medium text-gray-900 mb-1">No Accounts Found</h3>
      <p class="text-gray-500">{{ searchQuery ? 'No accounts match your search' : 'No accounts have been created yet' }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
const { getAuthHeaders } = useAuth()

interface Account {
  id: string
  name: string | null
  owner_email: string
  patient_count: number
  plan: string
  subscription_status: string | null
  trial_ends_at: string | null
  created_at: string
}

const accounts = ref<Account[]>([])
const loading = ref(false)
const searchQuery = ref('')

const filteredAccounts = computed(() => {
  if (!searchQuery.value) return accounts.value
  const q = searchQuery.value.toLowerCase()
  return accounts.value.filter(a => 
    a.name?.toLowerCase().includes(q) ||
    a.owner_email?.toLowerCase().includes(q)
  )
})

const activeCount = computed(() => 
  accounts.value.filter(a => a.subscription_status === 'active').length
)

const trialCount = computed(() => 
  accounts.value.filter(a => {
    if (!a.trial_ends_at) return false
    return new Date(a.trial_ends_at) > new Date()
  }).length
)

const totalPatients = computed(() => 
  accounts.value.reduce((sum, a) => sum + (a.patient_count || 0), 0)
)

const formatDate = (dateStr: string) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString()
}

const getStatusClass = (account: Account) => {
  if (account.subscription_status === 'active') return 'bg-green-100 text-green-700'
  if (account.trial_ends_at && new Date(account.trial_ends_at) > new Date()) return 'bg-yellow-100 text-yellow-700'
  return 'bg-gray-100 text-gray-700'
}

const getStatusLabel = (account: Account) => {
  if (account.subscription_status === 'active') return 'Active'
  if (account.trial_ends_at) {
    const trialEnd = new Date(account.trial_ends_at)
    if (trialEnd > new Date()) {
      const days = Math.ceil((trialEnd.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
      return `Trial (${days}d)`
    }
    return 'Trial Expired'
  }
  return 'Free'
}

const loadAccounts = async () => {
  loading.value = true
  try {
    const headers = await getAuthHeaders()
    const data = await $fetch<{ accounts: Account[] }>('/api/admin/accounts', { headers })
    accounts.value = data.accounts
  } catch (error: any) {
    console.error('Failed to load accounts:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadAccounts()
})
</script>
