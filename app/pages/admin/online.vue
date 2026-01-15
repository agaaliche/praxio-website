<template>
  <div>
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-display font-bold text-gray-900">Online Users</h1>
        <p class="mt-1 text-gray-600">View and manage currently active users</p>
      </div>
      <ClientOnly>
        <div class="flex gap-3">
          <button
            @click="logoutAllUsers"
            :disabled="loggingOutAll"
            class="px-4 py-2.5 bg-red-100 text-red-700 font-medium rounded-xl hover:bg-red-200 transition flex items-center gap-2"
          >
            <i class="fa-solid fa-right-from-bracket"></i>
            Logout All
          </button>
          <button
            @click="loadOnlineUsers"
            :disabled="loading"
            class="px-4 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition"
          >
            <i class="fa-solid fa-rotate" :class="{ 'animate-spin': loading }"></i>
          </button>
        </div>
      </ClientOnly>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12">
      <div class="w-8 h-8 border-4 border-red-200 border-t-red-600 rounded-full animate-spin mx-auto"></div>
      <p class="mt-2 text-gray-500">Loading online users...</p>
    </div>

    <!-- Online Users Grid -->
    <div v-else-if="users.length > 0" class="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div 
        v-for="user in users" 
        :key="user.uid"
        class="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition"
      >
        <div class="flex items-start justify-between">
          <div class="flex items-center gap-3">
            <div class="relative">
              <div class="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-medium text-lg">
                {{ user.email?.charAt(0).toUpperCase() }}
              </div>
              <div class="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
            </div>
            <div>
              <div class="font-medium text-gray-900">{{ user.displayName || user.email }}</div>
              <div class="text-sm text-gray-500">{{ user.email }}</div>
            </div>
          </div>
          
          <button
            @click="logoutUser(user)"
            :disabled="loggingOut === user.uid"
            class="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
            title="Force logout"
          >
            <i v-if="loggingOut === user.uid" class="fa-solid fa-spinner animate-spin"></i>
            <i v-else class="fa-solid fa-right-from-bracket"></i>
          </button>
        </div>
        
        <div class="mt-3 pt-3 border-t border-gray-100 text-sm text-gray-500">
          <div class="flex items-center gap-2">
            <i class="fa-regular fa-clock text-gray-400"></i>
            Last activity: {{ formatTime(user.lastActivity) }}
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="bg-white rounded-xl border border-gray-200 p-12 text-center">
      <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <i class="fa-solid fa-users text-gray-400 text-2xl"></i>
      </div>
      <h3 class="text-lg font-medium text-gray-900 mb-1">No Active Users</h3>
      <p class="text-gray-500">No users have been active in the last hour</p>
    </div>
  </div>
</template>

<script setup lang="ts">
const { getAuthHeaders } = useAuth()

interface OnlineUser {
  uid: string
  email: string
  displayName?: string
  photoURL?: string
  lastActivity: string
}

const users = ref<OnlineUser[]>([])
const loading = ref(false)
const loggingOut = ref<string | null>(null)
const loggingOutAll = ref(false)

const formatTime = (time: string) => {
  if (!time) return 'Unknown'
  const date = new Date(time)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  
  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  return `${Math.floor(diffMins / 60)}h ${diffMins % 60}m ago`
}

const loadOnlineUsers = async () => {
  loading.value = true
  try {
    const headers = await getAuthHeaders()
    const data = await $fetch<{ users: OnlineUser[] }>('/api/admin/online-users', { headers })
    users.value = data.users
  } catch (error: any) {
    console.error('Failed to load online users:', error)
  } finally {
    loading.value = false
  }
}

const logoutUser = async (user: OnlineUser) => {
  loggingOut.value = user.uid
  try {
    const headers = await getAuthHeaders()
    await $fetch('/api/admin/logout-user', {
      method: 'POST',
      headers,
      body: { uid: user.uid }
    })
    // Remove from list
    users.value = users.value.filter(u => u.uid !== user.uid)
  } catch (error: any) {
    console.error('Failed to logout user:', error)
    alert(error.data?.message || 'Failed to logout user')
  } finally {
    loggingOut.value = null
  }
}

const logoutAllUsers = async () => {
  if (!confirm('Are you sure you want to logout all users?')) return
  
  loggingOutAll.value = true
  try {
    const headers = await getAuthHeaders()
    await $fetch('/api/admin/logout-all-users', {
      method: 'POST',
      headers
    })
    users.value = []
    alert('All users logged out')
  } catch (error: any) {
    console.error('Failed to logout all users:', error)
    alert(error.data?.message || 'Failed to logout all users')
  } finally {
    loggingOutAll.value = false
  }
}

onMounted(() => {
  loadOnlineUsers()
})
</script>
