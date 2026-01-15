<template>
  <ClientOnly>
    <div>
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-display font-bold text-gray-900">{{ t('admin.impersonate.title') }}</h1>
        <p class="mt-1 text-gray-600">{{ t('admin.impersonate.subtitle') }}</p>
      </div>
    </div>

    <div class="grid lg:grid-cols-2 gap-6">
      <!-- Impersonate Form -->
      <div class="bg-white rounded-xl border border-gray-200 p-6">
        <ClientOnly>
          <div class="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
            <div class="flex items-start gap-3">
              <i class="fa-solid fa-triangle-exclamation text-yellow-600 mt-0.5"></i>
              <div>
                <h4 class="font-medium text-yellow-800">{{ t('admin.impersonate.warning.title') }}</h4>
                <p class="text-sm text-yellow-700 mt-1">
                  {{ t('admin.impersonate.warning.message') }}
                </p>
              </div>
            </div>
          </div>
          <template #fallback>
            <div class="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
              <h4 class="font-medium text-yellow-800">{{ t('admin.impersonate.warning.title') }}</h4>
              <p class="text-sm text-yellow-700 mt-1">
                {{ t('admin.impersonate.warning.message') }}
              </p>
            </div>
          </template>
        </ClientOnly>

        <form @submit.prevent="startImpersonation" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('admin.impersonate.form.userEmail') }}</label>
            <div class="relative">
              <input
                v-model="searchQuery"
                type="text"
                :placeholder="t('admin.impersonate.form.searchPlaceholder')"
                @focus="onFocus"
                @input="filterUsers"
                class="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                autocomplete="off"
              >
              <!-- Dropdown -->
              <div 
                v-if="showDropdown && filteredUsers.length > 0" 
                class="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto"
              >
                <button
                  v-for="user in filteredUsers"
                  :key="user.userId"
                  type="button"
                  @click="selectUser(user)"
                  class="w-full px-4 py-2.5 text-left hover:bg-gray-50 flex items-center justify-between"
                >
                  <div>
                    <div class="font-medium text-gray-900">{{ user.email }}</div>
                    <div v-if="user.name" class="text-sm text-gray-500">{{ user.name }}</div>
                  </div>
                </button>
              </div>
              <!-- No results -->
              <div 
                v-if="showDropdown && filteredUsers.length === 0 && !loadingUsers && allUsers.length > 0" 
                class="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg p-4 text-center text-gray-500"
              >
                {{ t('admin.impersonate.form.noMatches', { query: searchQuery }) }}
              </div>
              <!-- Loading or No users loaded -->
              <div 
                v-if="showDropdown && allUsers.length === 0 && !loadingUsers" 
                class="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg p-4 text-center text-gray-500"
              >
                {{ t('admin.impersonate.form.noUsersLoaded') }}
              </div>
              <!-- Loading -->
              <div 
                v-if="loadingUsers" 
                class="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg p-4 text-center"
              >
                <div class="w-5 h-5 border-2 border-red-200 border-t-red-600 rounded-full animate-spin mx-auto"></div>
              </div>
            </div>
            <!-- Selected user badge -->
            <div v-if="targetEmail" class="mt-2 flex items-center gap-2">
              <span class="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm flex items-center gap-2">
                {{ targetEmail }}
                <button type="button" @click="clearSelection" class="hover:text-red-900">
                  <i class="fa-solid fa-times"></i>
                </button>
              </span>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('admin.impersonate.form.reason') }}</label>
            <input
              v-model="reason"
              type="text"
              :placeholder="t('admin.impersonate.form.reasonPlaceholder')"
              class="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
              required
            >
          </div>

          <button
            type="submit"
            :disabled="impersonating"
            class="w-full px-4 py-2.5 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 transition flex items-center justify-center gap-2"
          >
            <ClientOnly>
              <i v-if="impersonating" class="fa-solid fa-spinner animate-spin"></i>
              <i v-else class="fa-solid fa-user-secret"></i>
              <template #fallback>
                <span v-if="impersonating">⟳</span>
                <span v-else>🕵</span>
              </template>
            </ClientOnly>
            {{ t('admin.impersonate.form.startButton') }}
          </button>
        </form>

        <div v-if="impersonationToken" class="mt-6 p-4 bg-green-50 border border-green-200 rounded-xl">
          <h4 class="font-medium text-green-800 mb-2 flex items-center gap-2">
            <i class="fa-solid fa-check-circle"></i>
            {{ t('admin.impersonate.success.title') }}
          </h4>
          <p class="text-sm text-green-700 mb-3">
            {{ t('admin.impersonate.success.message') }}
          </p>
          <button
            @click="useImpersonationToken"
            class="w-full px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition"
          >
            {{ t('admin.impersonate.success.loginButton', { email: targetEmail }) }}
          </button>
        </div>
      </div>

      <!-- Impersonation Log -->
      <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div class="p-4 border-b border-gray-200 flex items-center justify-between">
          <h2 class="font-medium text-gray-900 flex items-center gap-2">
            <i class="fa-solid fa-list text-gray-500"></i>
            {{ t('admin.impersonate.log.title') }}
          </h2>
          <button
            @click="loadLog"
            :disabled="loadingLog"
            class="p-1.5 text-gray-500 hover:text-gray-700 rounded"
          >
            <ClientOnly>
              <i class="fa-solid fa-rotate text-sm" :class="{ 'animate-spin': loadingLog }"></i>
              <template #fallback>
                <span class="text-sm">↻</span>
              </template>
            </ClientOnly>
          </button>
        </div>

        <!-- Loading -->
        <div v-if="loadingLog" class="text-center py-12">
          <div class="w-6 h-6 border-2 border-red-200 border-t-red-600 rounded-full animate-spin mx-auto"></div>
        </div>

        <!-- Log List -->
        <div v-else-if="log.length > 0" class="divide-y divide-gray-200 max-h-96 overflow-y-auto">
          <div v-for="entry in log" :key="entry.id" class="p-4">
            <div class="flex items-start justify-between">
              <div>
                <div class="font-medium text-gray-900">{{ entry.target_email }}</div>
                <div class="text-sm text-gray-500">by {{ entry.admin_email }}</div>
              </div>
              <span class="text-xs text-gray-400">{{ formatDate(entry.created_at) }}</span>
            </div>
            <div class="mt-2 text-sm text-gray-600 bg-gray-50 rounded-lg p-2">
              {{ entry.reason }}
            </div>
          </div>
        </div>

        <!-- Empty -->
        <div v-else class="p-12 text-center">
          <i class="fa-solid fa-shield-check text-gray-300 text-3xl mb-2"></i>
          <p class="text-gray-500">{{ t('admin.impersonate.log.empty') }}</p>
        </div>
      </div>
    </div>
    </div>
    <template #fallback>
      <div class="text-center py-12">
        <div class="w-8 h-8 border-4 border-red-200 border-t-red-600 rounded-full animate-spin mx-auto"></div>
        <p class="mt-2 text-gray-500">{{ t('admin.impersonate.loading') }}</p>
      </div>
    </template>
  </ClientOnly>
</template>

<script setup lang="ts">
const { getAuthHeaders } = useAuth()
const { t } = useI18n()
// Force reload to pick up new translations

interface LogEntry {
  id: number
  admin_email: string
  target_email: string
  reason: string
  created_at: string
}

interface UserOption {
  userId: string
  email: string
  name: string | null
}

const targetEmail = ref('')
const reason = ref('')
const impersonating = ref(false)
const impersonationToken = ref<string | null>(null)

const log = ref<LogEntry[]>([])
const loadingLog = ref(false)

// User search
const allUsers = ref<UserOption[]>([])
const filteredUsers = ref<UserOption[]>([])
const searchQuery = ref('')
const showDropdown = ref(false)
const loadingUsers = ref(false)

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

const loadUsers = async () => {
  loadingUsers.value = true
  try {
    const headers = await getAuthHeaders()
    const data = await $fetch<{ users: UserOption[] }>('/api/admin/users-list', { headers })
    allUsers.value = data.users
    console.log('Loaded users:', data.users.length)
  } catch (error: any) {
    console.error('Failed to load users:', error)
  } finally {
    loadingUsers.value = false
  }
}

const filterUsers = () => {
  // Show all users if search is empty but dropdown is open
  if (searchQuery.value.length === 0) {
    filteredUsers.value = allUsers.value.slice(0, 10)
    return
  }
  if (searchQuery.value.length < 2) {
    filteredUsers.value = allUsers.value.slice(0, 10)
    return
  }
  const q = searchQuery.value.toLowerCase()
  filteredUsers.value = allUsers.value
    .filter(u => 
      u.email.toLowerCase().includes(q) || 
      u.name?.toLowerCase().includes(q)
    )
    .slice(0, 10) // Limit to 10 results
}

const onFocus = () => {
  showDropdown.value = true
  // Show first 10 users on focus if no filter applied
  if (filteredUsers.value.length === 0) {
    filteredUsers.value = allUsers.value.slice(0, 10)
  }
}

const selectUser = (user: UserOption) => {
  targetEmail.value = user.email
  searchQuery.value = user.email
  showDropdown.value = false
}

const clearSelection = () => {
  targetEmail.value = ''
  searchQuery.value = ''
  showDropdown.value = false
}

// Close dropdown when clicking outside
const handleClickOutside = (e: MouseEvent) => {
  const target = e.target as HTMLElement
  if (!target.closest('.relative')) {
    showDropdown.value = false
  }
}

const loadLog = async () => {
  loadingLog.value = true
  try {
    const headers = await getAuthHeaders()
    const data = await $fetch<{ log: LogEntry[] }>('/api/admin/impersonation-log', { headers })
    log.value = data.log
  } catch (error: any) {
    console.error('Failed to load impersonation log:', error)
  } finally {
    loadingLog.value = false
  }
}

const startImpersonation = async () => {
  impersonating.value = true
  impersonationToken.value = null
  try {
    const headers = await getAuthHeaders()
    const data = await $fetch<{ token: string }>('/api/admin/impersonate', {
      method: 'POST',
      headers,
      body: {
        targetEmail: targetEmail.value,
        reason: reason.value
      }
    })
    impersonationToken.value = data.token
    loadLog()
  } catch (error: any) {
    console.error('Failed to start impersonation:', error)
    alert(error.data?.message || 'Failed to start impersonation')
  } finally {
    impersonating.value = false
  }
}

const useImpersonationToken = async () => {
  if (!impersonationToken.value) return
  
  // Store the impersonation token and redirect
  // The actual implementation depends on how the app handles impersonation
  // This could be:
  // 1. Sign in with custom token
  // 2. Store in localStorage and reload
  // 3. Redirect to a special impersonation URL
  
  try {
    // For Firebase, we'd use signInWithCustomToken
    const { signInWithCustomToken } = await import('firebase/auth')
    const { auth } = useFirebase()
    
    await signInWithCustomToken(auth, impersonationToken.value)
    
    // Store that we're impersonating
    localStorage.setItem('isImpersonating', 'true')
    localStorage.setItem('impersonatingAs', targetEmail.value)
    
    // Redirect to the main app
    navigateTo('/account')
  } catch (error: any) {
    console.error('Failed to use impersonation token:', error)
    alert('Failed to login as user: ' + error.message)
  }
}

onMounted(() => {
  loadLog()
  loadUsers()
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>
