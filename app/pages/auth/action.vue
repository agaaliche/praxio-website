<template>
  <div class="min-h-screen bg-gradient-to-br from-primary-50 to-white flex items-center justify-center py-12 px-4">
    <div class="max-w-md w-full">
      <!-- Logo/Brand -->
      <div class="text-center mb-8">
        <NuxtLink to="/" class="inline-flex items-center gap-2">
          <span class="text-3xl font-display font-bold text-primary-600">Praxio</span>
        </NuxtLink>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="bg-white rounded-2xl shadow-xl p-8 text-center">
        <i class="fa-solid fa-spinner fa-spin text-4xl text-primary-600 mb-4"></i>
        <h2 class="text-xl font-display font-bold text-gray-900 mb-2">
          {{ loadingMessage }}
        </h2>
        <p class="text-gray-600">Please wait...</p>
      </div>

      <!-- Success State -->
      <div v-else-if="success" class="bg-white rounded-2xl shadow-xl p-8 text-center">
        <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <i class="fa-solid fa-check text-3xl text-green-600"></i>
        </div>
        <h2 class="text-xl font-display font-bold text-gray-900 mb-2">
          {{ successTitle }}
        </h2>
        <p class="text-gray-600 mb-6">{{ successMessage }}</p>
        <NuxtLink
          :to="redirectPath"
          class="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-primary-600 text-white font-semibold hover:bg-primary-700 transition"
        >
          {{ redirectLabel }}
        </NuxtLink>
      </div>

      <!-- Error State -->
      <div v-else class="bg-white rounded-2xl shadow-xl p-8 text-center">
        <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <i class="fa-solid fa-exclamation-triangle text-3xl text-red-600"></i>
        </div>
        <h2 class="text-xl font-display font-bold text-gray-900 mb-2">
          {{ errorTitle }}
        </h2>
        <p class="text-gray-600 mb-6">{{ errorMessage }}</p>
        <NuxtLink
          to="/signin"
          class="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-primary-600 text-white font-semibold hover:bg-primary-700 transition"
        >
          Go to Sign In
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false
})

useHead({
  title: 'Account Action - Praxio'
})

const route = useRoute()
const { applyActionCode, checkActionCode } = useAuth()

// State
const loading = ref(true)
const success = ref(false)
const loadingMessage = ref('Processing...')
const successTitle = ref('')
const successMessage = ref('')
const errorTitle = ref('Something went wrong')
const errorMessage = ref('')
const redirectPath = ref('/signin')
const redirectLabel = ref('Continue')

// Get action parameters from URL
const mode = computed(() => route.query.mode as string)
const oobCode = computed(() => route.query.oobCode as string)

// Process the action
const processAction = async () => {
  if (!oobCode.value) {
    loading.value = false
    errorTitle.value = 'Invalid Link'
    errorMessage.value = 'This link is invalid or has expired. Please request a new one.'
    return
  }

  try {
    switch (mode.value) {
      case 'verifyEmail':
        loadingMessage.value = 'Verifying your email...'
        await handleVerifyEmail()
        break

      case 'resetPassword':
        loadingMessage.value = 'Validating reset link...'
        await handleResetPassword()
        break

      case 'recoverEmail':
        loadingMessage.value = 'Recovering your email...'
        await handleRecoverEmail()
        break

      default:
        loading.value = false
        errorTitle.value = 'Unknown Action'
        errorMessage.value = 'This action is not recognized.'
    }
  } catch (error: any) {
    loading.value = false
    errorTitle.value = 'Action Failed'
    errorMessage.value = error.message || 'Unable to complete this action. The link may have expired.'
  }
}

// Handle email verification
const handleVerifyEmail = async () => {
  const result = await applyActionCode(oobCode.value)
  
  if (result.success) {
    loading.value = false
    success.value = true
    successTitle.value = 'Email Verified!'
    successMessage.value = 'Your email has been verified successfully. You can now sign in to your account.'
    redirectPath.value = '/signin'
    redirectLabel.value = 'Sign In'
  } else {
    throw new Error(result.message)
  }
}

// Handle password reset - redirect to reset form
const handleResetPassword = async () => {
  // Check if the code is valid first
  const result = await checkActionCode(oobCode.value)
  
  if (result.success) {
    // Redirect to password reset form with the code
    navigateTo({
      path: '/auth/reset-password',
      query: { oobCode: oobCode.value }
    })
  } else {
    throw new Error(result.message)
  }
}

// Handle email recovery
const handleRecoverEmail = async () => {
  const result = await applyActionCode(oobCode.value)
  
  if (result.success) {
    loading.value = false
    success.value = true
    successTitle.value = 'Email Recovered!'
    successMessage.value = 'Your email address has been restored. You may want to reset your password for security.'
    redirectPath.value = '/signin'
    redirectLabel.value = 'Sign In'
  } else {
    throw new Error(result.message)
  }
}

// Process on mount
onMounted(() => {
  processAction()
})
</script>
