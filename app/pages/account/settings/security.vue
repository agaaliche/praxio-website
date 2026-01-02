<template>
  <div>
    <div class="mb-6">
      <h1 class="text-2xl font-display font-bold text-gray-900">{{ t('account.settings.security.title') }}</h1>
      <p class="mt-1 text-gray-600">{{ t('account.settings.security.description') }}</p>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="bg-white rounded-2xl border border-gray-200 p-12 text-center">
      <div class="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto"></div>
      <p class="mt-2 text-gray-500">{{ t('common.loading') }}</p>
    </div>

    <div v-else class="space-y-6">
      <!-- Password Section -->
      <div class="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 class="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
          <i class="fa-light fa-key text-primary-600"></i>
          {{ t('account.settings.security.password') }}
        </h2>

        <div v-if="!showPasswordForm">
          <p class="text-gray-600 mb-4">{{ t('account.settings.security.passwordDescription') }}</p>
          <button
            @click="showPasswordForm = true"
            class="px-4 py-2 bg-primary-600 text-white font-medium rounded-xl hover:bg-primary-700 transition"
          >
            <i class="fa-solid fa-lock mr-2"></i>
            {{ t('account.settings.security.changePassword') }}
          </button>
        </div>

        <form v-else @submit.prevent="changePassword" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('account.settings.security.currentPassword') }}</label>
            <div class="relative">
              <input
                v-model="passwordForm.currentPassword"
                :type="showCurrentPassword ? 'text' : 'password'"
                required
                class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent pr-10"
              />
              <button
                type="button"
                @click="showCurrentPassword = !showCurrentPassword"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <i :class="showCurrentPassword ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'"></i>
              </button>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('account.settings.security.newPassword') }}</label>
            <div class="relative">
              <input
                v-model="passwordForm.newPassword"
                :type="showNewPassword ? 'text' : 'password'"
                required
                minlength="8"
                class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent pr-10"
              />
              <button
                type="button"
                @click="showNewPassword = !showNewPassword"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <i :class="showNewPassword ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'"></i>
              </button>
            </div>
            <p class="text-xs text-gray-500 mt-1">{{ t('account.settings.security.minCharacters') }}</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('account.settings.security.confirmPassword') }}</label>
            <div class="relative">
              <input
                v-model="passwordForm.confirmPassword"
                :type="showConfirmPassword ? 'text' : 'password'"
                required
                class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent pr-10"
              />
              <button
                type="button"
                @click="showConfirmPassword = !showConfirmPassword"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <i :class="showConfirmPassword ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'"></i>
              </button>
            </div>
          </div>

          <!-- Password Error -->
          <div v-if="passwordError" class="bg-red-50 border border-red-600 rounded-xl p-3 flex items-start gap-2">
            <i class="fa-solid fa-exclamation-circle text-red-600 mt-0.5"></i>
            <p class="text-sm text-red-600">{{ passwordError }}</p>
          </div>

          <!-- Password Success -->
          <div v-if="passwordSuccess" class="bg-green-50 border border-green-200 rounded-xl p-3 flex items-start gap-2">
            <i class="fa-solid fa-circle-check text-green-500 mt-0.5"></i>
            <p class="text-sm text-green-700">{{ t('account.settings.security.passwordChangeSuccess') }}</p>
          </div>

          <div class="flex items-center gap-3 pt-2">
            <button
              type="button"
              @click="cancelPasswordChange"
              class="px-4 py-2 text-gray-700 hover:bg-gray-100 font-medium rounded-xl transition"
            >
              {{ t('common.cancel') }}
            </button>
            <button
              type="submit"
              :disabled="changingPassword"
              class="px-4 py-2 bg-primary-600 text-white font-medium rounded-xl hover:bg-primary-700 transition disabled:opacity-50"
            >
              <SpinnerIcon v-if="changingPassword" class="mr-2" />
              {{ t('account.settings.security.updatePassword') }}
            </button>
          </div>
        </form>
      </div>

      <!-- Sessions Section -->
      <div class="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 class="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
          <i class="fa-light fa-desktop text-primary-600"></i>
          {{ t('account.settings.security.activeSessions') }}
        </h2>
        
        <!-- Loading sessions -->
        <div v-if="sessionsLoading" class="flex justify-center py-4">
          <div class="w-6 h-6 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
        </div>

        <!-- Sessions list -->
        <div v-else-if="sessions.length > 0" class="space-y-3">
          <div
            v-for="session in sessions"
            :key="session.sessionId"
            class="flex items-center gap-4 p-4 rounded-xl"
            :class="session.isCurrent ? 'bg-green-50 border border-green-200' : 'bg-gray-50'"
          >
            <div class="w-10 h-10 rounded-full flex items-center justify-center" :class="session.isCurrent ? 'bg-green-100' : 'bg-gray-200'">
              <i :class="session.isCurrent ? 'fa-solid fa-check text-green-600' : getDeviceIcon(session.deviceType) + ' text-gray-600'"></i>
            </div>
            <div class="flex-1">
              <p class="font-medium text-gray-900">
                {{ session.deviceName }}
                <span v-if="session.isCurrent" class="text-sm font-normal text-green-600 ml-2">({{ t('account.settings.security.thisDevice') }})</span>
              </p>
              <p class="text-sm text-gray-500">
                {{ session.browser }} {{ session.browserVersion }} • {{ formatSessionTime(session.lastActiveTime) }}
              </p>
              <p class="text-xs text-gray-400 mt-1">{{ session.ipAddress }}</p>
            </div>
          </div>
        </div>

        <!-- No other sessions -->
        <div v-else class="text-center py-4 text-gray-500">
          <p>{{ t('account.settings.security.onlyThisDevice') }}</p>
        </div>

        <!-- Pagination -->
        <div v-if="pagination && pagination.totalPages > 1" class="mt-4 flex items-center justify-between border-t border-gray-200 pt-4">
          <p class="text-sm text-gray-600">
            {{ t('common.showing') }} {{ (pagination.page - 1) * pagination.limit + 1 }}-{{ Math.min(pagination.page * pagination.limit, pagination.total) }} {{ t('common.of') }} {{ pagination.total }}
          </p>
          <div class="flex gap-2">
            <button
              @click="changePage(pagination.page - 1)"
              :disabled="!pagination.hasPrev || sessionsLoading"
              class="px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <i class="fa-solid fa-chevron-left"></i>
            </button>
            <button
              @click="changePage(pagination.page + 1)"
              :disabled="!pagination.hasNext || sessionsLoading"
              class="px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <i class="fa-solid fa-chevron-right"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- Danger Zone -->
      <div class="bg-white rounded-2xl border border-red-600 p-6">
        <h2 class="text-lg font-bold text-red-600 flex items-center gap-2 mb-4">
          <i class="fa-light fa-triangle-exclamation text-red-600"></i>
          {{ t('account.settings.security.dangerZone') }}
        </h2>
        
        <p class="text-gray-600 mb-4">
          {{ t('account.settings.security.deleteWarning') }}
        </p>
        
        <button
          @click="showDeleteConfirm = true"
          class="px-4 py-2 border border-red-600 text-red-600 font-medium rounded-xl hover:bg-red-50 transition"
        >
          <i class="fa-solid fa-trash mr-2"></i>
          Delete Account
        </button>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <Teleport to="body">
      <div v-if="showDeleteConfirm" class="fixed inset-0 z-50 overflow-y-auto">
        <div class="flex min-h-full items-center justify-center p-4">
          <div class="fixed inset-0 bg-black/50" @click="showDeleteConfirm = false"></div>
          <div class="relative bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <div class="text-center mb-6">
              <div class="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <i class="fa-solid fa-triangle-exclamation text-red-600 text-2xl"></i>
              </div>
              <h3 class="text-xl font-bold text-gray-900 mb-2">Delete Account?</h3>
              <p class="text-gray-600">
                This will permanently delete your account, all patients, team members, and data. 
                This action cannot be undone.
              </p>
            </div>
            
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Type <span class="font-mono font-bold text-red-600">DELETE</span> to confirm
              </label>
              <input
                v-model="deleteConfirmText"
                type="text"
                placeholder="DELETE"
                class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-600 focus:border-transparent"
              />
            </div>

            <div v-if="deleteError" class="bg-red-50 border border-red-600 rounded-xl p-3 mb-4">
              <p class="text-sm text-red-600">{{ deleteError }}</p>
            </div>
            
            <div class="flex gap-3">
              <button
                @click="showDeleteConfirm = false; deleteConfirmText = ''"
                class="flex-1 px-4 py-2.5 text-gray-700 hover:bg-gray-100 font-medium rounded-xl transition"
              >
                Cancel
              </button>
              <button
                @click="deleteAccount"
                :disabled="deleteConfirmText !== 'DELETE' || deleting"
                class="flex-1 px-4 py-2.5 bg-red-600 text-white font-medium rounded-xl hover:bg-red-600 transition disabled:opacity-50"
              >
                <SpinnerIcon v-if="deleting" class="mr-2" />
                Delete Forever
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { 
  EmailAuthProvider, 
  reauthenticateWithCredential, 
  updatePassword 
} from 'firebase/auth'

definePageMeta({
  middleware: ['auth']
})

const { t } = useI18n()
const { user, getAuthHeaders, signOutUser } = useAuth()

const loading = ref(false)

// Sessions
const sessions = ref<any[]>([])
const sessionsLoading = ref(false)
const revokingSession = ref<string | null>(null)
const revokingAll = ref(false)
const sessionError = ref('')
const sessionSuccess = ref('')
const currentPage = ref(1)
const pagination = ref<any>(null)

// Password change
const showPasswordForm = ref(false)
const showCurrentPassword = ref(false)
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)
const changingPassword = ref(false)
const passwordError = ref('')
const passwordSuccess = ref(false)

const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const cancelPasswordChange = () => {
  showPasswordForm.value = false
  passwordForm.value = { currentPassword: '', newPassword: '', confirmPassword: '' }
  passwordError.value = ''
  passwordSuccess.value = false
}

const changePassword = async () => {
  passwordError.value = ''
  passwordSuccess.value = false
  
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    passwordError.value = 'Passwords do not match'
    return
  }
  
  if (passwordForm.value.newPassword.length < 8) {
    passwordError.value = 'Password must be at least 8 characters'
    return
  }
  
  changingPassword.value = true
  
  try {
    // Get the actual Firebase User object (not our custom AuthUser)
    const { $auth } = useNuxtApp()
    const currentUser = $auth.currentUser
    if (!currentUser || !currentUser.email) {
      throw new Error('Not authenticated')
    }
    
    // Re-authenticate user before changing password
    const credential = EmailAuthProvider.credential(
      currentUser.email,
      passwordForm.value.currentPassword
    )
    
    await reauthenticateWithCredential(currentUser, credential)
    await updatePassword(currentUser, passwordForm.value.newPassword)
    
    passwordSuccess.value = true
    passwordForm.value = { currentPassword: '', newPassword: '', confirmPassword: '' }
    
    setTimeout(() => {
      showPasswordForm.value = false
      passwordSuccess.value = false
    }, 2000)
  } catch (e: any) {
    console.error('Password change error:', e)
    if (e.code === 'auth/wrong-password') {
      passwordError.value = 'Current password is incorrect'
    } else if (e.code === 'auth/weak-password') {
      passwordError.value = 'Password is too weak'
    } else {
      passwordError.value = e.message || 'Failed to change password'
    }
  } finally {
    changingPassword.value = false
  }
}

// Delete account
const showDeleteConfirm = ref(false)
const deleteConfirmText = ref('')
const deleting = ref(false)
const deleteError = ref('')

const deleteAccount = async () => {
  if (deleteConfirmText.value !== 'DELETE') return
  
  deleting.value = true
  deleteError.value = ''
  
  try {
    const headers = await getAuthHeaders()
    await $fetch('/api/users/account', {
      method: 'DELETE',
      headers
    })
    
    await signOutUser()
    await navigateTo('/')
  } catch (e: any) {
    deleteError.value = e.data?.message || 'Failed to delete account'
  } finally {
    deleting.value = false
  }
}

// Load sessions on mount
onMounted(async () => {
  await fetchSessions()
})

async function fetchSessions() {
  sessionsLoading.value = true
  sessionError.value = ''
  
  try {
    const headers = await getAuthHeaders()
    const response = await $fetch<{ sessions: any[], pagination: any }>('/api/sessions/list', {
      headers,
      query: {
        page: currentPage.value,
        limit: 10
      }
    })
    sessions.value = response.sessions
    pagination.value = response.pagination
  } catch (e: any) {
    sessionError.value = e.data?.message || 'Failed to load sessions'
  } finally {
    sessionsLoading.value = false
  }
}

function changePage(page: number) {
  currentPage.value = page
  fetchSessions()
}

async function revokeSession(sessionId: string) {
  revokingSession.value = sessionId
  sessionError.value = ''
  sessionSuccess.value = ''
  
  try {
    const headers = await getAuthHeaders()
    await $fetch('/api/sessions/revoke', {
      method: 'POST',
      headers,
      body: { sessionId }
    })
    
    sessionSuccess.value = 'Session signed out successfully'
    await fetchSessions()
    
    setTimeout(() => {
      sessionSuccess.value = ''
    }, 3000)
  } catch (e: any) {
    sessionError.value = e.data?.message || 'Failed to sign out session'
  } finally {
    revokingSession.value = null
  }
}

async function revokeAllSessions() {
  revokingAll.value = true
  sessionError.value = ''
  sessionSuccess.value = ''
  
  try {
    const headers = await getAuthHeaders()
    const response = await $fetch<{ revokedCount: number }>('/api/sessions/revoke-all', {
      method: 'POST',
      headers
    })
    
    sessionSuccess.value = `Signed out ${response.revokedCount} device${response.revokedCount === 1 ? '' : 's'} successfully`
    await fetchSessions()
    
    setTimeout(() => {
      sessionSuccess.value = ''
    }, 3000)
  } catch (e: any) {
    sessionError.value = e.data?.message || 'Failed to sign out all sessions'
  } finally {
    revokingAll.value = false
  }
}

function getDeviceIcon(deviceType: string) {
  if (deviceType === 'Mobile') return 'fa-solid fa-mobile'
  if (deviceType === 'Tablet') return 'fa-solid fa-tablet'
  return 'fa-solid fa-desktop'
}

function formatSessionTime(dateStr: string) {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  
  if (diffMins < 1) return 'Active now'
  if (diffMins < 60) return `${diffMins} min ago`
  
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`
  
  const diffDays = Math.floor(diffHours / 24)
  if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`
  
  return date.toLocaleDateString()
}
</script>
