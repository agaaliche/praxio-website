<template>
  <div>
    <div class="mb-6">
      <h1 class="text-2xl font-display font-bold text-gray-900">{{ t('account.settings.profile.title') }}</h1>
      <p class="mt-1 text-gray-600">{{ t('account.settings.profile.description') }}</p>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="bg-white rounded-2xl border border-gray-200 p-12 text-center">
      <div class="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto"></div>
      <p class="mt-2 text-gray-500">{{ t('common.loading') }}</p>
    </div>

    <form v-else @submit.prevent="saveProfile" class="space-y-6">
      <!-- Profile Info Card -->
      <div class="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
        <h2 class="text-lg font-bold text-gray-900 flex items-center gap-2">
          <i class="fa-light fa-user text-primary-600"></i>
          {{ t('account.settings.profile.personalInfo') }}
        </h2>

        <div class="grid md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('account.settings.profile.firstName') }}</label>
            <input
              v-model="form.firstName"
              type="text"
              :readonly="isViewer"
              class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              :class="{ 'cursor-not-allowed opacity-60': isViewer }"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('account.settings.profile.lastName') }}</label>
            <input
              v-model="form.lastName"
              type="text"
              :readonly="isViewer"
              class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              :class="{ 'cursor-not-allowed opacity-60': isViewer }"
            />
          </div>
        </div>

        <!-- Current Email (readonly) -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('account.settings.profile.emailAddress') }}</label>
          <input
            v-model="form.email"
            type="email"
            disabled
            class="w-full px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-xl cursor-not-allowed opacity-60"
          />
        </div>

        <!-- Change Email Section -->
        <div v-if="showEmailChange && !isViewer" class="space-y-3">
          <div class="relative">
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('account.settings.profile.newEmail') }}</label>
            <div class="relative">
              <input
                v-model="newEmail"
                type="email"
                :placeholder="t('account.settings.profile.enterNewEmail')"
                class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent pr-10"
              />
              <button
                type="button"
                @click="cancelEmailChange"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <i class="fa-solid fa-xmark"></i>
              </button>
            </div>
            <p v-if="emailChangeError" class="text-xs text-red-600 mt-1">{{ emailChangeError }}</p>
          </div>
          
          <button
            type="button"
            @click="sendEmailVerification"
            :disabled="!isValidNewEmail || emailChangeLoading"
            class="px-4 py-2 bg-primary-100 text-primary-700 font-medium rounded-xl hover:bg-primary-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <SpinnerIcon v-if="emailChangeLoading" class="mr-2" />
            <i v-else class="fa-light fa-envelope mr-2"></i>
            {{ t('account.settings.profile.sendVerification') }}
          </button>
        </div>

        <!-- Change Email Button (when not expanded) -->
        <button
          v-if="!showEmailChange && !isViewer"
          type="button"
          @click="showEmailChange = true"
          class="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
        >
          <i class="fa-light fa-pen"></i>
          {{ t('account.settings.profile.changeEmail') }}
        </button>

        <!-- Phone Number -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('account.settings.profile.phoneNumber') }}</label>
          <input
            v-model="form.phoneNumber"
            type="tel"
            :readonly="isViewer"
            class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            :class="{ 'cursor-not-allowed opacity-60': isViewer }"
          />
        </div>
      </div>

      <!-- Viewer Notice -->
      <div v-if="isViewer" class="bg-blue-50 border border-blue-600 rounded-xl p-4 flex items-start gap-3">
        <i class="fa-solid fa-info-circle text-blue-600 mt-0.5"></i>
        <div>
          <p class="font-medium text-blue-600">{{ t('account.settings.profile.viewOnlyAccess') }}</p>
          <p class="text-sm text-blue-600">{{ t('account.settings.profile.viewOnlyMessage') }}</p>
        </div>
      </div>

      <!-- Error Message -->
      <div v-if="error" class="bg-red-50 border border-red-600 rounded-xl p-4 flex items-start gap-2">
        <i class="fa-solid fa-exclamation-circle text-red-600 mt-0.5"></i>
        <p class="text-sm text-red-600">{{ error }}</p>
      </div>

      <!-- Success Message -->
      <div v-if="success" class="bg-green-50 border border-green-200 rounded-xl p-4 flex items-start gap-2">
        <i class="fa-solid fa-circle-check text-green-500 mt-0.5"></i>
        <p class="text-sm text-green-700">{{ t('account.settings.profile.updateSuccess') }}</p>
      </div>

      <!-- Save Button -->
      <div v-if="!isViewer" class="flex justify-end">
        <button
          type="submit"
          :disabled="saving"
          class="px-6 py-2.5 bg-primary-600 text-white font-medium rounded-xl hover:bg-primary-700 transition disabled:opacity-50"
        >
          <span v-if="saving" class="inline-flex items-center">
            <SpinnerIcon class="mr-2" />
            {{ t('account.settings.profile.saving') }}
          </span>
          <span v-else>{{ t('common.save') }}</span>
        </button>
      </div>
    </form>

    <!-- Snackbar/Toast (matching INRManager pattern) -->
    <Transition name="fade">
      <div 
        v-if="snackbar.show" 
        class="fixed bottom-4 right-4 px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 z-50"
        :class="snackbar.color === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'"
      >
        <i :class="snackbar.color === 'success' ? 'fa-solid fa-circle-check' : 'fa-solid fa-exclamation-circle'"></i>
        <span class="text-sm font-medium">{{ snackbar.message }}</span>
        <button @click="snackbar.show = false" class="ml-2 hover:opacity-80">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ['auth']
})

const { t } = useI18n()
const { getAuthHeaders } = useAuth()

const loading = ref(true)
const saving = ref(false)
const error = ref('')
const success = ref(false)

const isViewer = ref(false)

const form = ref({
  firstName: '',
  lastName: '',
  email: '',
  phoneNumber: ''
})

// Email change state (matching INRManager's ProfileSettings.vue)
const showEmailChange = ref(false)
const newEmail = ref('')
const emailChangeLoading = ref(false)
const emailChangeError = ref('')

// Snackbar/toast state
const snackbar = ref({
  show: false,
  message: '',
  color: 'success'
})

// Auto-hide snackbar after 4 seconds
watch(() => snackbar.value.show, (show) => {
  if (show) {
    setTimeout(() => {
      snackbar.value.show = false
    }, 4000)
  }
})

// Email validation
const isValidNewEmail = computed(() => {
  if (!newEmail.value) return false
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return pattern.test(newEmail.value) && newEmail.value !== form.value.email
})

const cancelEmailChange = () => {
  showEmailChange.value = false
  newEmail.value = ''
  emailChangeError.value = ''
}

const sendEmailVerification = async () => {
  if (!isValidNewEmail.value) return
  
  emailChangeLoading.value = true
  emailChangeError.value = ''
  
  try {
    const headers = await getAuthHeaders()
    const result = await $fetch<any>('/api/auth/request-email-change', {
      method: 'POST',
      headers,
      body: {
        newEmail: newEmail.value,
        firstName: form.value.firstName,
        lastName: form.value.lastName
      }
    })
    
    if (result.success) {
      snackbar.value = {
        show: true,
        message: result.message || 'Verification email sent! Please check your inbox.',
        color: 'success'
      }
      cancelEmailChange()
    } else {
      emailChangeError.value = result.message || 'Failed to send verification email'
    }
  } catch (e: any) {
    emailChangeError.value = e.data?.message || 'An error occurred'
    snackbar.value = {
      show: true,
      message: e.data?.message || 'An error occurred',
      color: 'error'
    }
  } finally {
    emailChangeLoading.value = false
  }
}

const loadProfile = async () => {
  try {
    loading.value = true
    const headers = await getAuthHeaders()
    const data = await $fetch<any>('/api/users/current', { headers })
    
    form.value = {
      firstName: data.firstName || '',
      lastName: data.lastName || '',
      email: data.email || '',
      phoneNumber: data.phoneNumber || ''
    }
    
    isViewer.value = data.role === 'viewer'
  } catch (e: any) {
    error.value = e.data?.message || 'Failed to load profile'
  } finally {
    loading.value = false
  }
}

const saveProfile = async () => {
  if (isViewer.value) return
  
  saving.value = true
  error.value = ''
  success.value = false
  
  try {
    const headers = await getAuthHeaders()
    
    if (!headers.Authorization || headers.Authorization === 'Bearer null') {
      throw new Error('Not authenticated. Please sign in again.')
    }
    
    const result = await $fetch<{ success: boolean; message?: string }>('/api/users/profile', {
      method: 'PUT',
      headers,
      body: {
        firstName: form.value.firstName,
        lastName: form.value.lastName,
        phoneNumber: form.value.phoneNumber
      }
    })
    
    if (result.success) {
      success.value = true
      snackbar.value = {
        show: true,
        message: 'Profile updated successfully!',
        color: 'success'
      }
      setTimeout(() => { success.value = false }, 3000)
    }
  } catch (e: any) {
    console.error('Profile save error:', e)
    error.value = e.data?.message || e.message || 'Failed to save profile'
    snackbar.value = {
      show: true,
      message: error.value,
      color: 'error'
    }
  } finally {
    saving.value = false
  }
}

onMounted(loadProfile)
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
