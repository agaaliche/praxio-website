<template>
  <div class="min-h-screen bg-gradient-to-br from-primary-50 to-white flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full">
      <!-- Logo/Brand -->
      <div class="text-center mb-8">
        <NuxtLink to="/" class="inline-flex items-center justify-center">
          <svg width="105" height="27" viewBox="0 0 105 27" fill="none" xmlns="http://www.w3.org/2000/svg" class="h-8 w-auto">
            <path d="M2.03999 26.6C0.919994 26.6 -5.99027e-06 25.68 -5.99027e-06 24.56V9.56C-5.99027e-06 4.28 4.27999 -2.14577e-06 9.55999 -2.14577e-06C14.8 -2.14577e-06 19.08 4.28 19.08 9.56C19.08 14.84 14.8 19.12 9.55999 19.12C7.51999 19.12 5.63999 18.48 4.07999 17.4V24.56C4.07999 25.68 3.19999 26.6 2.03999 26.6ZM9.55999 15C12.56 15 15 12.56 15 9.56C15 6.56 12.56 4.12 9.55999 4.12C6.51999 4.12 4.07999 6.56 4.07999 9.56C4.07999 12.56 6.51999 15 9.55999 15ZM24.3056 19.12C23.1856 19.12 22.2656 18.2 22.2656 17.04V2.04C22.2656 0.919998 23.1856 -2.14577e-06 24.3056 -2.14577e-06C25.3456 -2.14577e-06 26.1856 0.759998 26.3456 1.72C27.9056 0.639998 29.7856 -2.14577e-06 31.8256 -2.14577e-06C32.9456 -2.14577e-06 33.8656 0.919998 33.8656 2.04C33.8656 3.2 32.9456 4.12 31.8256 4.12C28.8256 4.12 26.3856 6.56 26.3856 9.56V17.04C26.3856 18.2 25.4656 19.12 24.3056 19.12ZM51.7275 19.12C50.7275 19.12 49.8875 18.36 49.7275 17.36C48.1675 18.48 46.2875 19.12 44.2475 19.12C38.9675 19.12 34.6875 14.84 34.6875 9.56C34.6875 4.28 38.9675 -2.14577e-06 44.2475 -2.14577e-06C49.5275 -2.14577e-06 53.7675 4.28 53.7675 9.56V17.04C53.7675 18.2 52.8875 19.12 51.7275 19.12ZM44.2475 15C47.5675 15 49.6475 12.28 49.6875 9.56C49.6875 6.6 47.3275 4.12 44.2475 4.12C41.2475 4.12 38.8075 6.56 38.8075 9.56C38.8075 12.56 41.2475 15 44.2475 15ZM72.9531 19.12C72.3931 19.12 71.8731 18.88 71.4331 18.44L65.9931 12.56L60.5131 18.44C60.1131 18.88 59.5531 19.12 58.9931 19.12C57.8731 19.12 56.9531 18.12 56.9531 17.04C56.9531 16.52 57.1531 16.04 57.5131 15.64L63.1931 9.56L57.5131 3.44C57.1531 3.04 56.9531 2.56 56.9531 2.08C56.9531 0.959997 57.9131 -2.14577e-06 58.9931 -2.14577e-06C59.5531 -2.14577e-06 60.1131 0.239998 60.5131 0.679997L65.9931 6.56L71.4331 0.679997C71.8731 0.239998 72.3931 -2.14577e-06 72.9531 -2.14577e-06C74.0331 -2.14577e-06 74.9931 0.959997 74.9931 2.08C74.9931 2.56 74.8331 3.04 74.4331 3.44L68.7531 9.56L74.4331 15.64C74.8331 16.04 74.9931 16.52 74.9931 17.04C74.9931 18.16 74.0731 19.12 72.9531 19.12ZM80.2431 19.12C79.1231 19.12 78.2031 18.2 78.2031 17.04V2.04C78.2031 0.919998 79.1231 -2.14577e-06 80.2431 -2.14577e-06C81.3631 -2.14577e-06 82.2831 0.919998 82.2831 2.04V17.04C82.2831 18.2 81.3631 19.12 80.2431 19.12ZM94.9887 19.12C89.7087 19.12 85.4687 14.84 85.4687 9.56C85.4687 4.28 89.7087 -2.14577e-06 94.9887 -2.14577e-06C100.269 -2.14577e-06 104.549 4.28 104.549 9.56C104.549 14.84 100.269 19.12 94.9887 19.12ZM94.9887 15C97.9887 15 100.429 12.56 100.429 9.56C100.429 6.56 97.9887 4.12 94.9887 4.12C91.9887 4.12 89.5487 6.56 89.5487 9.56C89.5487 12.56 91.9887 15 94.9887 15Z" class="fill-primary-600"></path>
          </svg>
        </NuxtLink>
        <h2 class="mt-6 text-3xl font-display font-bold text-gray-900">
          {{ t('auth.signUpTitle') }}
        </h2>
        <p class="mt-2 text-gray-600">
          {{ t('auth.signUpSubtitle') }}
        </p>
      </div>

      <!-- Sign Up Card -->
      <div class="bg-white rounded-2xl shadow-xl p-8">
        <form @submit.prevent="handleSignUp" class="space-y-5">
          <!-- Display Name -->
          <div>
            <label for="displayName" class="block text-sm font-medium text-gray-700 mb-2">
              {{ t('auth.fullName') }}
            </label>
            <div class="relative">
              <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                <i class="fa-solid fa-user"></i>
              </span>
              <input
                id="displayName"
                v-model="displayName"
                type="text"
                autocomplete="name"
                required
                class="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition"
                placeholder="Dr. John Smith"
              />
            </div>
          </div>

          <!-- Email -->
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
              {{ t('auth.emailAddress') }}
            </label>
            <div class="relative">
              <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                <i class="fa-solid fa-envelope"></i>
              </span>
              <input
                id="email"
                v-model="email"
                type="email"
                autocomplete="email"
                required
                class="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <!-- Password -->
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 mb-2">
              {{ t('auth.password') }}
            </label>
            <div class="relative">
              <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                <i class="fa-solid fa-lock"></i>
              </span>
              <input
                id="password"
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                autocomplete="new-password"
                required
                minlength="6"
                class="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition"
                placeholder="••••••••"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                <i :class="showPassword ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'"></i>
              </button>
            </div>
            <p class="mt-1 text-xs text-gray-500">At least 6 characters</p>
          </div>

          <!-- Confirm Password -->
          <div>
            <label for="confirmPassword" class="block text-sm font-medium text-gray-700 mb-2">
              {{ t('auth.confirmPassword') }}
            </label>
            <div class="relative">
              <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                <i class="fa-solid fa-lock"></i>
              </span>
              <input
                id="confirmPassword"
                v-model="confirmPassword"
                :type="showPassword ? 'text' : 'password'"
                autocomplete="new-password"
                required
                class="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition"
                placeholder="••••••••"
              />
            </div>
            <p v-if="passwordMismatch" class="mt-1 text-xs text-red-600">
              Passwords don't match
            </p>
          </div>

          <!-- Terms Agreement -->
          <div class="flex items-start">
            <input
              id="terms"
              v-model="acceptedTerms"
              type="checkbox"
              required
              class="mt-1 h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
            />
            <label for="terms" class="ml-2 text-sm text-gray-600">
              I agree to the
              <NuxtLink to="/terms" class="text-primary-600 hover:text-primary-700">Terms of Service</NuxtLink>
              and
              <NuxtLink to="/privacy" class="text-primary-600 hover:text-primary-700">Privacy Policy</NuxtLink>
            </label>
          </div>

          <!-- Success Message -->
          <div
            v-if="successMessage"
            class="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm"
          >
            <i class="fa-solid fa-check-circle mr-2"></i>
            {{ successMessage }}
          </div>

          <!-- Error Message -->
          <div
            v-if="errorMessage"
            class="bg-red-50 border border-red-600 text-red-600 px-4 py-3 rounded-xl text-sm"
          >
            {{ errorMessage }}
          </div>

          <!-- Sign Up Button -->
          <button
            type="submit"
            :disabled="loading || !isFormValid"
            class="w-full flex justify-center items-center px-6 py-3 rounded-xl bg-primary-600 text-white font-semibold hover:bg-primary-700 transition shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="loading" class="flex items-center">
              <SpinnerIcon class="mr-2" />
              {{ t('auth.signingUp') }}
            </span>
            <span v-else>{{ t('auth.signUp') }}</span>
          </button>

          <!-- Divider -->
          <div class="relative my-6">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-gray-300"></div>
            </div>
            <div class="relative flex justify-center text-sm">
              <span class="px-2 bg-white text-gray-500">{{ t('auth.or') }}</span>
            </div>
          </div>

          <!-- Google Sign Up -->
          <button
            type="button"
            @click="handleGoogleSignUp"
            :disabled="loadingGoogle"
            class="w-full flex justify-center items-center px-6 py-3 rounded-xl bg-white text-gray-700 font-semibold border-2 border-gray-300 hover:bg-gray-50 transition"
          >
            <span v-if="loadingGoogle" class="flex items-center">
              <SpinnerIcon class="mr-2" />
              Connecting...
            </span>
            <span v-else class="flex items-center">
              <i class="fa-brands fa-google text-red-600 mr-2"></i>
              {{ t('auth.signUpWithGoogle') }}
            </span>
          </button>

          <!-- Sign In Link -->
          <p class="text-center text-gray-600 mt-6">
            {{ t('auth.alreadyHaveAccount') }}
            <NuxtLink to="/signin" class="text-primary-600 hover:text-primary-700 font-semibold">
              {{ t('auth.signIn') }}
            </NuxtLink>
          </p>
        </form>
      </div>

      <!-- Back to Home -->
      <p class="text-center mt-6">
        <NuxtLink to="/" class="text-gray-500 hover:text-gray-700 text-sm">
          <i class="fa-solid fa-arrow-left mr-1"></i>
          Back to home
        </NuxtLink>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false,
  middleware: 'guest'
})

useHead({
  title: 'Sign Up - Praxio'
})

const { t } = useI18n()
const router = useRouter()
const { signUpWithEmail, signInWithGoogle } = useAuth()

// Form state
const displayName = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)
const acceptedTerms = ref(false)
const loading = ref(false)
const loadingGoogle = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

// Validation
const passwordMismatch = computed(() => {
  return confirmPassword.value && password.value !== confirmPassword.value
})

const isFormValid = computed(() => {
  return (
    displayName.value.trim() &&
    email.value.trim() &&
    password.value.length >= 6 &&
    password.value === confirmPassword.value &&
    acceptedTerms.value
  )
})

// Handle email/password sign up - uses backend API for custom branded emails
const handleSignUp = async () => {
  if (!isFormValid.value) return
  
  errorMessage.value = ''
  successMessage.value = ''
  loading.value = true

  try {
    // Parse display name into first/last name
    const nameParts = displayName.value.trim().split(' ')
    const firstName = nameParts[0] || ''
    const lastName = nameParts.slice(1).join(' ') || ''
    
    // Call backend API to create user and send custom verification email
    const result = await $fetch('/api/auth/signup', {
      method: 'POST',
      body: {
        email: email.value,
        password: password.value,
        firstName,
        lastName
      }
    })
    
    if (result.success) {
      successMessage.value = 'Account created! Please check your email to verify your account.'
      // Don't redirect immediately - let them see the verification message
    } else {
      errorMessage.value = (result as any).message || 'Sign up failed. Please try again.'
    }
  } catch (error: any) {
    errorMessage.value = error.data?.message || error.message || 'An unexpected error occurred.'
  } finally {
    loading.value = false
  }
}

// Handle Google sign up
const handleGoogleSignUp = async () => {
  errorMessage.value = ''
  loadingGoogle.value = true

  try {
    const result = await signInWithGoogle()
    
    if (result.success) {
      await router.push('/account')
    } else {
      errorMessage.value = result.message || 'Google sign up failed.'
    }
  } catch (error: any) {
    errorMessage.value = error.message || 'An unexpected error occurred.'
  } finally {
    loadingGoogle.value = false
  }
}
</script>
