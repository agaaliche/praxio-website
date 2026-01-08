<template>
  <div class="min-h-screen bg-gradient-to-br from-primary-50 to-white flex items-center justify-center py-12 px-4">
    <div class="max-w-md w-full">
      <!-- Logo/Brand -->
      <div class="text-center mb-8">
        <NuxtLink to="/" class="inline-flex items-center gap-2">
          <svg width="105" height="27" viewBox="0 0 105 27" fill="none" xmlns="http://www.w3.org/2000/svg" class="h-8">
            <path d="M2.03999 26.6C0.919994 26.6 -5.99027e-06 25.68 -5.99027e-06 24.56V9.56C-5.99027e-06 4.28 4.27999 -2.14577e-06 9.55999 -2.14577e-06C14.8 -2.14577e-06 19.08 4.28 19.08 9.56C19.08 14.84 14.8 19.12 9.55999 19.12C7.51999 19.12 5.63999 18.48 4.07999 17.4V24.56C4.07999 25.68 3.19999 26.6 2.03999 26.6ZM9.55999 15C12.56 15 15 12.56 15 9.56C15 6.56 12.56 4.12 9.55999 4.12C6.51999 4.12 4.07999 6.56 4.07999 9.56C4.07999 12.56 6.51999 15 9.55999 15ZM24.3056 19.12C23.1856 19.12 22.2656 18.2 22.2656 17.04V2.04C22.2656 0.919998 23.1856 -2.14577e-06 24.3056 -2.14577e-06C25.3456 -2.14577e-06 26.1856 0.759998 26.3456 1.72C27.9056 0.639998 29.7856 -2.14577e-06 31.8256 -2.14577e-06C32.9456 -2.14577e-06 33.8656 0.919998 33.8656 2.04C33.8656 3.2 32.9456 4.12 31.8256 4.12C28.8256 4.12 26.3856 6.56 26.3856 9.56V17.04C26.3856 18.2 25.4656 19.12 24.3056 19.12ZM51.7275 19.12C50.7275 19.12 49.8875 18.36 49.7275 17.36C48.1675 18.48 46.2875 19.12 44.2475 19.12C38.9675 19.12 34.6875 14.84 34.6875 9.56C34.6875 4.28 38.9675 -2.14577e-06 44.2475 -2.14577e-06C49.5275 -2.14577e-06 53.7675 4.28 53.7675 9.56V17.04C53.7675 18.2 52.8875 19.12 51.7275 19.12ZM44.2475 15C47.5675 15 49.6475 12.28 49.6875 9.56C49.6875 6.6 47.3275 4.12 44.2475 4.12C41.2475 4.12 38.8075 6.56 38.8075 9.56C38.8075 12.56 41.2475 15 44.2475 15ZM72.9531 19.12C72.3931 19.12 71.8731 18.88 71.4331 18.44L65.9931 12.56L60.5131 18.44C60.1131 18.88 59.5531 19.12 58.9931 19.12C57.8731 19.12 56.9531 18.12 56.9531 17.04C56.9531 16.52 57.1531 16.04 57.5131 15.64L63.1931 9.56L57.5131 3.44C57.1531 3.04 56.9531 2.56 56.9531 2.08C56.9531 0.959997 57.9131 -2.14577e-06 58.9931 -2.14577e-06C59.5531 -2.14577e-06 60.1131 0.239998 60.5131 0.679997L65.9931 6.56L71.4331 0.679997C71.8731 0.239998 72.3931 -2.14577e-06 72.9531 -2.14577e-06C74.0331 -2.14577e-06 74.9931 0.959997 74.9931 2.08C74.9931 2.56 74.8331 3.04 74.4331 3.44L68.7531 9.56L74.4331 15.64C74.8331 16.04 74.9931 16.52 74.9931 17.04C74.9931 18.16 74.0731 19.12 72.9531 19.12ZM80.2431 19.12C79.1231 19.12 78.2031 18.2 78.2031 17.04V2.04C78.2031 0.919998 79.1231 -2.14577e-06 80.2431 -2.14577e-06C81.3631 -2.14577e-06 82.2831 0.919998 82.2831 2.04V17.04C82.2831 18.2 81.3631 19.12 80.2431 19.12ZM94.9887 19.12C89.7087 19.12 85.4687 14.84 85.4687 9.56C85.4687 4.28 89.7087 -2.14577e-06 94.9887 -2.14577e-06C100.269 -2.14577e-06 104.549 4.28 104.549 9.56C104.549 14.84 100.269 19.12 94.9887 19.12ZM94.9887 15C97.9887 15 100.429 12.56 100.429 9.56C100.429 6.56 97.9887 4.12 94.9887 4.12C91.9887 4.12 89.5487 6.56 89.5487 9.56C89.5487 12.56 91.9887 15 94.9887 15Z" fill="#2563eb"/>
          </svg>
        </NuxtLink>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="bg-white rounded-2xl shadow-xl p-8 text-center">
        <div class="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
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

      <!-- Password Reset Form -->
      <div v-else-if="showResetForm" class="bg-white rounded-2xl shadow-xl p-8">
        <div class="text-center mb-6">
          <div class="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i class="fa-solid fa-key text-3xl text-primary-600"></i>
          </div>
          <h2 class="text-xl font-display font-bold text-gray-900 mb-2">Reset Your Password</h2>
          <p class="text-gray-600">Enter your new password below</p>
        </div>

        <form @submit.prevent="submitPasswordReset" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">New Password</label>
            <input
              v-model="newPassword"
              type="password"
              required
              minlength="6"
              class="block w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
            <input
              v-model="confirmPassword"
              type="password"
              required
              class="block w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition"
              placeholder="••••••••"
            />
            <p v-if="passwordMismatch" class="mt-1 text-xs text-red-600">
              Passwords don't match
            </p>
          </div>

          <button
            type="submit"
            :disabled="resetting || passwordMismatch || !newPassword"
            class="w-full flex justify-center items-center px-6 py-3 rounded-xl bg-primary-600 text-white font-semibold hover:bg-primary-700 transition shadow-lg hover:shadow-xl disabled:opacity-50"
          >
            <span v-if="resetting" class="flex items-center">
              <SpinnerIcon class="mr-2" />
              Resetting...
            </span>
            <span v-else>
              <i class="fa-solid fa-check mr-2"></i>
              Reset Password
            </span>
          </button>
        </form>
      </div>

      <!-- Error State -->
      <div v-else class="bg-white rounded-2xl shadow-xl p-8 text-center">
        <div class="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <i class="fa-solid fa-exclamation-triangle text-3xl text-red-600"></i>
        </div>
        <h2 class="text-xl font-display font-bold text-gray-900 mb-2">
          {{ errorTitle }}
        </h2>
        <p class="text-gray-600 mb-6">{{ errorMessage }}</p>
        
        <button
          v-if="showResendButton && userEmail"
          @click="resendVerification"
          :disabled="resending"
          class="w-full flex justify-center items-center px-6 py-3 rounded-xl bg-primary-600 text-white font-semibold hover:bg-primary-700 transition shadow-lg hover:shadow-xl disabled:opacity-50 mb-3"
        >
          <span v-if="resending" class="flex items-center">
            <SpinnerIcon class="mr-2" />
            Sending...
          </span>
          <span v-else>
            <i class="fa-solid fa-envelope mr-2"></i>
            Resend Verification Email
          </span>
        </button>
        
        <NuxtLink
          to="/signin"
          class="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-primary-600 text-white font-semibold hover:bg-primary-700 transition w-full"
        >
          Go to Sign In
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { confirmPasswordReset } from 'firebase/auth'

definePageMeta({
  layout: false
})

useHead({
  title: 'Account Action - Praxio'
})

const route = useRoute()
const router = useRouter()
const { applyActionCode, checkActionCode } = useAuth()
const { $auth } = useNuxtApp()

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
const showResendButton = ref(false)
const resending = ref(false)
const userEmail = ref('')
const showResetForm = ref(false)
const newPassword = ref('')
const confirmPassword = ref('')
const resetting = ref(false)
const resetActionCode = ref('')

const passwordMismatch = computed(() => {
  return confirmPassword.value && newPassword.value !== confirmPassword.value
})

// Get action parameters from URL
const mode = computed(() => route.query.mode as string)
const oobCode = computed(() => route.query.oobCode as string)

// Process the action
const processAction = async () => {
  // For email change, we use 'token' parameter instead of 'oobCode'
  if (mode.value === 'changeEmail') {
    const token = route.query.token as string
    if (!token) {
      loading.value = false
      errorTitle.value = 'Invalid Link'
      errorMessage.value = 'This email change link is invalid. Please request a new one.'
      return
    }
    try {
      loadingMessage.value = 'Changing your email address...'
      await handleChangeEmail()
    } catch (error: any) {
      loading.value = false
      errorTitle.value = 'Email Change Failed'
      errorMessage.value = error.message || 'Unable to complete this action. The link may have expired.'
    }
    return
  }
  
  // For other actions, check oobCode
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
  try {
    const info = await checkActionCode(oobCode.value)
    if (info.success && info.data?.email) {
      userEmail.value = info.data.email
    }
    
    const result = await applyActionCode(oobCode.value)
    
    if (result.success) {
      // Check if user is already signed in
      const currentUser = $auth.currentUser
      
      if (currentUser) {
        // User is signed in, reload to get updated emailVerified status
        await currentUser.reload()
        loading.value = false
        success.value = true
        successTitle.value = 'Email Verified!'
        successMessage.value = 'Your email has been verified successfully.'
        redirectPath.value = '/account'
        redirectLabel.value = 'Go to Dashboard'
      } else {
        // User is not signed in, redirect to signin page
        loading.value = false
        success.value = true
        successTitle.value = 'Email Verified!'
        successMessage.value = 'Your email has been verified successfully. Please sign in to continue.'
        redirectPath.value = '/signin'
        redirectLabel.value = 'Sign In'
      }
    } else {
      throw new Error(result.message)
    }
  } catch (error: any) {
    loading.value = false
    
    if (error.code === 'auth/expired-action-code') {
      errorTitle.value = 'Verification Link Expired'
      errorMessage.value = 'Your verification link has expired. Click below to receive a new verification email.'
      showResendButton.value = true
    } else if (error.code === 'auth/invalid-action-code') {
      errorTitle.value = 'Link Already Used'
      errorMessage.value = 'This verification link has already been used. Your email may already be verified.'
    } else {
      errorTitle.value = 'Verification Failed'
      errorMessage.value = error.message || 'Unable to verify your email address. Please try again or contact support.'
    }
  }
}

// Handle password reset - show inline form like inrManager
const handleResetPassword = async () => {
  try {
    const result = await checkActionCode(oobCode.value)
    
    if (result.success) {
      if (result.data?.email) {
        userEmail.value = result.data.email
      }
      resetActionCode.value = oobCode.value
      loading.value = false
      showResetForm.value = true
    } else {
      throw new Error(result.message)
    }
  } catch (error: any) {
    loading.value = false
    
    if (error.code === 'auth/expired-action-code') {
      errorTitle.value = 'Reset Link Expired'
      errorMessage.value = 'Your password reset link has expired. Please request a new one from the sign in page.'
    } else if (error.code === 'auth/invalid-action-code') {
      errorTitle.value = 'Link Already Used'
      errorMessage.value = 'This password reset link has already been used or is invalid.'
    } else {
      errorTitle.value = 'Reset Failed'
      errorMessage.value = error.message || 'Unable to process your password reset request. Please try again or contact support.'
    }
  }
}

// Submit password reset
const submitPasswordReset = async () => {
  if (newPassword.value !== confirmPassword.value || !newPassword.value) {
    return
  }

  resetting.value = true
  
  try {
    await confirmPasswordReset($auth, resetActionCode.value, newPassword.value)
    
    showResetForm.value = false
    success.value = true
    successTitle.value = 'Password Reset Successful!'
    successMessage.value = 'Your password has been reset successfully. You can now sign in with your new password.'
    redirectPath.value = '/signin'
    redirectLabel.value = 'Sign In'
    
  } catch (error: any) {
    console.error('Password reset submission error:', error)
    showResetForm.value = false
    errorTitle.value = 'Reset Failed'
    errorMessage.value = error.message || 'Failed to reset password. Please try again.'
  } finally {
    resetting.value = false
  }
}

// Resend verification email using custom email API
const resendVerification = async () => {
  if (!userEmail.value) return
  
  resending.value = true
  
  try {
    await $fetch('/api/auth/resend-verification', {
      method: 'POST',
      body: { email: userEmail.value }
    })
    
    success.value = true
    successTitle.value = 'Verification Email Sent'
    successMessage.value = 'A new verification email has been sent to your inbox. Please check your email and click the verification link.'
    showResendButton.value = false
    redirectPath.value = '/signin'
    redirectLabel.value = 'Go to Sign In'
    
  } catch (err: any) {
    errorMessage.value = 'Failed to resend verification email. Please try again later.'
  } finally {
    resending.value = false
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

// Handle email change (using custom token from our API)
const handleChangeEmail = async () => {
  const token = route.query.token as string
  
  if (!token) {
    loading.value = false
    errorTitle.value = 'Invalid Link'
    errorMessage.value = 'This email change link is invalid. Please request a new one.'
    return
  }
  
  try {
    const result = await $fetch<any>('/api/auth/verify-email-change', {
      method: 'POST',
      body: { token }
    })
    
    if (result.success) {
      loading.value = false
      success.value = true
      successTitle.value = 'Email Changed!'
      successMessage.value = `Your email has been changed to ${result.newEmail}. Please sign in with your new email address.`
      redirectPath.value = '/signin'
      redirectLabel.value = 'Sign In'
    } else {
      throw new Error(result.message || 'Failed to change email')
    }
  } catch (error: any) {
    loading.value = false
    
    if (error.data?.message?.includes('expired')) {
      errorTitle.value = 'Link Expired'
      errorMessage.value = 'This email change link has expired. Please request a new one from your profile settings.'
    } else if (error.data?.message?.includes('already in use')) {
      errorTitle.value = 'Email Unavailable'
      errorMessage.value = 'This email address is now in use by another account. Please try a different email.'
    } else {
      errorTitle.value = 'Email Change Failed'
      errorMessage.value = error.data?.message || error.message || 'Unable to change your email. Please try again.'
    }
  }
}

// Process on mount
onMounted(() => {
  processAction()
})
</script>
