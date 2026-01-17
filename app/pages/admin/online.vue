<template>
  <div>
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-display font-bold text-gray-900">Online Users</h1>
        <p class="mt-1 text-gray-600">View and manage currently active users</p>
      </div>
      <div class="flex gap-3">
        <button
          @click="logoutAllUsers"
          :disabled="loggingOutAll"
          class="px-4 py-2.5 bg-red-100 text-red-700 font-medium rounded-xl hover:bg-red-200 transition flex items-center gap-2"
        >
          <ClientOnly>
            <i class="fa-solid fa-right-from-bracket"></i>
          </ClientOnly>
          Logout All
        </button>
        <button
          @click="loadOnlineUsers"
          :disabled="loading"
          class="px-4 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition"
        >
          <SpinnerIcon v-show="loading" />
          <svg v-show="!loading" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" class="w-4 h-4 fill-current"><path d="M142.9 142.9c-17.5 17.5-30.1 38-37.8 59.8c-5.9 16.7-24.2 25.4-40.8 19.5s-25.4-24.2-19.5-40.8C55.6 150.7 73.2 122 97.6 97.6c87.2-87.2 228.3-87.5 315.8-1L455 55c6.9-6.9 17.2-8.9 26.2-5.2s14.8 12.5 14.8 22.2l0 128c0 13.3-10.7 24-24 24l-8.4 0c0 0 0 0 0 0L344 224c-9.7 0-18.5-5.8-22.2-14.8s-1.7-19.3 5.2-26.2l41.1-41.1c-62.6-61.5-163.1-61.2-225.3 1zM16 312c0-13.3 10.7-24 24-24l7.6 0 .7 0L168 288c9.7 0 18.5 5.8 22.2 14.8s1.7 19.3-5.2 26.2l-41.1 41.1c62.6 61.5 163.1 61.2 225.3-1c17.5-17.5 30.1-38 37.8-59.8c5.9-16.7 24.2-25.4 40.8-19.5s25.4 24.2 19.5 40.8c-10.8 30.6-28.4 59.3-52.9 83.8c-87.2 87.2-228.3 87.5-315.8 1L57 457c-6.9 6.9-17.2 8.9-26.2 5.2S16 449.7 16 440l0-119.6 0-.7 0-7.6z"/></svg>
        </button>
      </div>
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
            <SpinnerIcon v-if="loggingOut === user.uid" />
            <ClientOnly v-else>
              <i class="fa-solid fa-right-from-bracket"></i>
            </ClientOnly>
          </button>
        </div>
        
        <div class="mt-3 pt-3 border-t border-gray-100 text-sm text-gray-500">
          <div class="flex items-center gap-2">
            <ClientOnly>
              <i class="fa-regular fa-clock text-gray-400"></i>
            </ClientOnly>
            Last activity: {{ formatTime(user.lastActivity) }}
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="bg-white rounded-xl border border-gray-200 p-12 text-center">
      <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <ClientOnly>
          <i class="fa-solid fa-users text-gray-400 text-2xl"></i>
        </ClientOnly>
      </div>
      <h3 class="text-lg font-medium text-gray-900 mb-1">No Active Users</h3>
      <p class="text-gray-500">No users have been active in the last 15 minutes</p>
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
