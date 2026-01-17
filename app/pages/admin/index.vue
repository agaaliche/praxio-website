<template>
  <div>
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-display font-bold text-gray-900">User Management</h1>
        <p class="mt-1 text-gray-600">View, add, and manage all Firebase users</p>
      </div>
    </div>

    <!-- Search and Actions -->
    <ClientOnly>
      <div class="flex flex-wrap items-center gap-3 mb-6">
        <div class="relative flex-1 max-w-md">
          <ClientOnly>
            <i class="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
          </ClientOnly>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search users..."
            class="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
        </div>
        
        <button
          v-if="selectedUsers.length > 0"
          @click="confirmDeleteSelected"
          class="px-4 py-2.5 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 transition flex items-center gap-2"
        >
          <ClientOnly>
            <i class="fa-solid fa-trash"></i>
          </ClientOnly>
          Delete {{ selectedUsers.length }}
        </button>
        
        <button
          @click="showAddUserModal = true"
          class="px-4 py-2.5 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 transition flex items-center gap-2"
        >
          <ClientOnly>
            <i class="fa-solid fa-plus"></i>
          </ClientOnly>
          Add User
        </button>
        
        <button
          @click="loadUsers"
          :disabled="loading"
          class="px-4 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition"
        >
          <SpinnerIcon v-show="loading" />
          <svg v-show="!loading" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" class="w-4 h-4 fill-current"><path d="M142.9 142.9c-17.5 17.5-30.1 38-37.8 59.8c-5.9 16.7-24.2 25.4-40.8 19.5s-25.4-24.2-19.5-40.8C55.6 150.7 73.2 122 97.6 97.6c87.2-87.2 228.3-87.5 315.8-1L455 55c6.9-6.9 17.2-8.9 26.2-5.2s14.8 12.5 14.8 22.2l0 128c0 13.3-10.7 24-24 24l-8.4 0c0 0 0 0 0 0L344 224c-9.7 0-18.5-5.8-22.2-14.8s-1.7-19.3 5.2-26.2l41.1-41.1c-62.6-61.5-163.1-61.2-225.3 1zM16 312c0-13.3 10.7-24 24-24l7.6 0 .7 0L168 288c9.7 0 18.5 5.8 22.2 14.8s1.7 19.3-5.2 26.2l-41.1 41.1c62.6 61.5 163.1 61.2 225.3-1c17.5-17.5 30.1-38 37.8-59.8c5.9-16.7 24.2-25.4 40.8-19.5s25.4 24.2 19.5 40.8c-10.8 30.6-28.4 59.3-52.9 83.8c-87.2 87.2-228.3 87.5-315.8 1L57 457c-6.9 6.9-17.2 8.9-26.2 5.2S16 449.7 16 440l0-119.6 0-.7 0-7.6z"/></svg>
        </button>
      </div>
      <template #fallback>
        <div class="flex flex-wrap items-center gap-3 mb-6">
          <div class="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search users..."
              class="w-full pl-4 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl"
            />
          </div>
        </div>
      </template>
    </ClientOnly>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12">
      <div class="w-8 h-8 border-4 border-red-200 border-t-red-600 rounded-full animate-spin mx-auto"></div>
      <p class="mt-2 text-gray-500">Loading users...</p>
    </div>

    <!-- Users Table -->
    <div v-else class="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <table class="w-full">
        <thead class="bg-gray-50 border-b border-gray-200">
          <tr>
            <th class="w-12 px-4 py-3">
              <input 
                type="checkbox" 
                :checked="allSelected"
                @change="toggleSelectAll"
                class="rounded border-gray-300 text-red-600 focus:ring-red-500"
              />
            </th>
            <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">User</th>
            <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">Site Admin</th>
            <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">Status</th>
            <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">Verified</th>
            <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr 
            v-for="user in filteredUsers" 
            :key="user.uid"
            class="hover:bg-gray-50 transition"
          >
            <td class="px-4 py-3">
              <input 
                type="checkbox" 
                :checked="selectedUsers.includes(user.uid)"
                @change="toggleSelectUser(user.uid)"
                class="rounded border-gray-300 text-red-600 focus:ring-red-500"
              />
            </td>
            <td class="px-4 py-3">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-medium">
                  {{ user.email?.charAt(0).toUpperCase() }}
                </div>
                <div>
                  <div class="font-medium text-gray-900">{{ user.displayName || user.email }}</div>
                  <div class="text-sm text-gray-500">{{ user.email }}</div>
                </div>
              </div>
            </td>
            <td class="px-4 py-3">
              <span 
                v-if="user.customClaims?.siteadmin" 
                class="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700"
              >
                Site Admin
              </span>
              <span v-else class="text-gray-400">-</span>
            </td>
            <td class="px-4 py-3">
              <span 
                :class="user.disabled ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'"
                class="px-2 py-1 text-xs font-medium rounded-full"
              >
                {{ user.disabled ? 'Disabled' : 'Active' }}
              </span>
            </td>
            <td class="px-4 py-3">
              <ClientOnly>
                <i 
                  :class="user.emailVerified ? 'fa-solid fa-check-circle text-green-600' : 'fa-solid fa-times-circle text-gray-400'"
                ></i>
              </ClientOnly>
            </td>
            <td class="px-4 py-3">
              <div class="flex items-center gap-2">
                <button
                  @click="toggleSiteAdmin(user)"
                  class="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                  :title="user.customClaims?.siteadmin ? 'Remove site admin' : 'Make site admin'"
                >
                  <ClientOnly>
                    <i class="fa-solid fa-shield"></i>
                  </ClientOnly>
                </button>
                <button
                  @click="toggleDisabled(user)"
                  class="p-2 text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition"
                  :title="user.disabled ? 'Enable account' : 'Disable account'"
                >
                  <ClientOnly>
                    <i :class="user.disabled ? 'fa-solid fa-toggle-off' : 'fa-solid fa-toggle-on'"></i>
                  </ClientOnly>
                </button>
                <button
                  @click="sendPasswordReset(user)"
                  class="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                  title="Send password reset"
                >
                  <ClientOnly>
                    <i class="fa-solid fa-key"></i>
                  </ClientOnly>
                </button>
                <button
                  @click="confirmDeleteUser(user)"
                  class="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                  title="Delete user"
                >
                  <ClientOnly>
                    <i class="fa-solid fa-trash"></i>
                  </ClientOnly>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      
      <div v-if="filteredUsers.length === 0" class="px-4 py-12 text-center text-gray-500">
        No users found
      </div>
    </div>

    <!-- Add User Modal -->
    <div v-if="showAddUserModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" @click.self="showAddUserModal = false">
      <div class="bg-white rounded-2xl p-6 w-full max-w-md mx-4 shadow-xl">
        <h2 class="text-xl font-bold text-gray-900 mb-4">Add New User</h2>
        
        <form @submit.prevent="createUser" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              v-model="newUser.email"
              type="email"
              required
              class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              v-model="newUser.password"
              type="password"
              required
              minlength="6"
              class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
            <input
              v-model="newUser.displayName"
              type="text"
              class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
          
          <label class="flex items-center gap-2 cursor-pointer">
            <input
              v-model="newUser.makeSiteAdmin"
              type="checkbox"
              class="rounded border-gray-300 text-red-600 focus:ring-red-500"
            />
            <span class="text-sm text-gray-700">Make site admin</span>
          </label>
          
          <div class="flex justify-end gap-3 pt-4">
            <button
              type="button"
              @click="showAddUserModal = false"
              class="px-4 py-2.5 text-gray-700 font-medium rounded-xl hover:bg-gray-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="creating"
              class="px-4 py-2.5 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 transition disabled:opacity-50"
            >
              {{ creating ? 'Creating...' : 'Create User' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Confirm Delete Modal -->
    <div v-if="showDeleteModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" @click.self="showDeleteModal = false">
      <div class="bg-white rounded-2xl p-6 w-full max-w-md mx-4 shadow-xl">
        <h2 class="text-xl font-bold text-gray-900 mb-2">Confirm Delete</h2>
        <p class="text-gray-600 mb-6">
          Are you sure you want to delete {{ deleteTarget === 'multiple' ? `${selectedUsers.length} users` : userToDelete?.email }}? This action cannot be undone.
        </p>
        
        <div class="flex justify-end gap-3">
          <button
            @click="showDeleteModal = false"
            class="px-4 py-2.5 text-gray-700 font-medium rounded-xl hover:bg-gray-100 transition"
          >
            Cancel
          </button>
          <button
            @click="executeDelete"
            :disabled="deleting"
            class="px-4 py-2.5 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 transition disabled:opacity-50"
          >
            {{ deleting ? 'Deleting...' : 'Delete' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { getAuthHeaders } = useAuth()

interface User {
  uid: string
  email: string
  displayName?: string
  photoURL?: string
  emailVerified: boolean
  disabled: boolean
  customClaims?: Record<string, any>
  metadata?: {
    creationTime?: string
    lastSignInTime?: string
  }
}

const users = ref<User[]>([])
const loading = ref(false)
const searchQuery = ref('')
const selectedUsers = ref<string[]>([])

// Add user
const showAddUserModal = ref(false)
const creating = ref(false)
const newUser = ref({
  email: '',
  password: '',
  displayName: '',
  makeSiteAdmin: false
})

// Delete
const showDeleteModal = ref(false)
const deleting = ref(false)
const deleteTarget = ref<'single' | 'multiple'>('single')
const userToDelete = ref<User | null>(null)

const filteredUsers = computed(() => {
  if (!searchQuery.value) return users.value
  const q = searchQuery.value.toLowerCase()
  return users.value.filter(u => 
    u.email?.toLowerCase().includes(q) || 
    u.displayName?.toLowerCase().includes(q)
  )
})

const allSelected = computed(() => 
  filteredUsers.value.length > 0 && 
  filteredUsers.value.every(u => selectedUsers.value.includes(u.uid))
)

const loadUsers = async () => {
  loading.value = true
  try {
    const headers = await getAuthHeaders()
    const data = await $fetch<{ users: User[] }>('/api/admin/users', { headers })
    users.value = data.users
  } catch (error: any) {
    console.error('Failed to load users:', error)
  } finally {
    loading.value = false
  }
}

const toggleSelectAll = () => {
  if (allSelected.value) {
    selectedUsers.value = []
  } else {
    selectedUsers.value = filteredUsers.value.map(u => u.uid)
  }
}

const toggleSelectUser = (uid: string) => {
  const index = selectedUsers.value.indexOf(uid)
  if (index > -1) {
    selectedUsers.value.splice(index, 1)
  } else {
    selectedUsers.value.push(uid)
  }
}

const createUser = async () => {
  creating.value = true
  try {
    const headers = await getAuthHeaders()
    await $fetch('/api/admin/users', {
      method: 'POST',
      headers,
      body: newUser.value
    })
    showAddUserModal.value = false
    newUser.value = { email: '', password: '', displayName: '', makeSiteAdmin: false }
    await loadUsers()
  } catch (error: any) {
    console.error('Failed to create user:', error)
    alert(error.data?.message || 'Failed to create user')
  } finally {
    creating.value = false
  }
}

const toggleSiteAdmin = async (user: User) => {
  try {
    const headers = await getAuthHeaders()
    await $fetch('/api/admin/users/set-siteadmin', {
      method: 'POST',
      headers,
      body: { uid: user.uid, siteadmin: !user.customClaims?.siteadmin }
    })
    await loadUsers()
  } catch (error: any) {
    console.error('Failed to toggle siteadmin:', error)
    alert(error.data?.message || 'Failed to update user')
  }
}

const toggleDisabled = async (user: User) => {
  try {
    const headers = await getAuthHeaders()
    await $fetch('/api/admin/users/toggle-disabled', {
      method: 'POST',
      headers,
      body: { uid: user.uid, disabled: !user.disabled }
    })
    await loadUsers()
  } catch (error: any) {
    console.error('Failed to toggle disabled:', error)
    alert(error.data?.message || 'Failed to update user')
  }
}

const sendPasswordReset = async (user: User) => {
  try {
    const headers = await getAuthHeaders()
    await $fetch('/api/admin/users/send-password-reset', {
      method: 'POST',
      headers,
      body: { email: user.email }
    })
    alert('Password reset email sent')
  } catch (error: any) {
    console.error('Failed to send password reset:', error)
    alert(error.data?.message || 'Failed to send password reset')
  }
}

const confirmDeleteUser = (user: User) => {
  userToDelete.value = user
  deleteTarget.value = 'single'
  showDeleteModal.value = true
}

const confirmDeleteSelected = () => {
  deleteTarget.value = 'multiple'
  showDeleteModal.value = true
}

const executeDelete = async () => {
  deleting.value = true
  try {
    const headers = await getAuthHeaders()
    
    if (deleteTarget.value === 'single' && userToDelete.value) {
      await $fetch(`/api/admin/users/${userToDelete.value.uid}`, {
        method: 'DELETE',
        headers
      })
    } else {
      await $fetch('/api/admin/users/delete-multiple', {
        method: 'POST',
        headers,
        body: { uids: selectedUsers.value }
      })
      selectedUsers.value = []
    }
    
    showDeleteModal.value = false
    await loadUsers()
  } catch (error: any) {
    console.error('Failed to delete:', error)
    alert(error.data?.message || 'Failed to delete')
  } finally {
    deleting.value = false
  }
}

onMounted(() => {
  loadUsers()
})
</script>
