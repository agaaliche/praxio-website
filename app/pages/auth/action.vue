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
            <p v-if="passwordMismatch" class="mt-1 text-xs text-red-500">
              Passwords don't match
            </p>
          </div>

          <button
            type="submit"
            :disabled="resetting || passwordMismatch || !newPassword"
            class="w-full flex justify-center items-center px-6 py-3 rounded-xl bg-primary-600 text-white font-semibold hover:bg-primary-700 transition shadow-lg hover:shadow-xl disabled:opacity-50"
          >
            <span v-if="resetting" class="flex items-center">
              <i class="fa-solid fa-spinner fa-spin mr-2"></i>
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
        <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
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
            <i class="fa-solid fa-spinner fa-spin mr-2"></i>
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

      case 'changeEmail':
        loadingMessage.value = 'Changing your email address...'
        await handleChangeEmail()
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
      loading.value = false
      success.value = true
      successTitle.value = 'Email Verified!'
      successMessage.value = 'Your email has been verified successfully. You can now sign in to your account.'
      redirectPath.value = '/signin'
      redirectLabel.value = 'Sign In'
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
