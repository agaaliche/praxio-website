<template>
  <div class="min-h-screen bg-gradient-to-br from-primary-50 to-white flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full">
      <!-- Logo/Brand -->
      <div class="text-center mb-8">
        <NuxtLink to="/" class="inline-flex items-center gap-2">
          <span class="text-3xl font-display font-bold text-primary-600">Praxio</span>
        </NuxtLink>
        <h2 class="mt-6 text-3xl font-display font-bold text-gray-900">
          Create your account
        </h2>
        <p class="mt-2 text-gray-600">
          Start your free trial today
        </p>
      </div>

      <!-- Sign Up Card -->
      <div class="bg-white rounded-2xl shadow-xl p-8">
        <form @submit.prevent="handleSignUp" class="space-y-5">
          <!-- Display Name -->
          <div>
            <label for="displayName" class="block text-sm font-medium text-gray-700 mb-2">
              Full name
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
              Email address
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
              Password
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
              Confirm password
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
            <p v-if="passwordMismatch" class="mt-1 text-xs text-red-500">
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
            class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm"
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
              <i class="fa-solid fa-spinner fa-spin mr-2"></i>
              Creating account...
            </span>
            <span v-else>Create account</span>
          </button>

          <!-- Divider -->
          <div class="relative my-6">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-gray-300"></div>
            </div>
            <div class="relative flex justify-center text-sm">
              <span class="px-2 bg-white text-gray-500">Or continue with</span>
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
              <i class="fa-solid fa-spinner fa-spin mr-2"></i>
              Connecting...
            </span>
            <span v-else class="flex items-center">
              <i class="fa-brands fa-google text-red-500 mr-2"></i>
              Sign up with Google
            </span>
          </button>

          <!-- Sign In Link -->
          <p class="text-center text-gray-600 mt-6">
            Already have an account?
            <NuxtLink to="/signin" class="text-primary-600 hover:text-primary-700 font-semibold">
              Sign in
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

// Handle email/password sign up
const handleSignUp = async () => {
  if (!isFormValid.value) return
  
  errorMessage.value = ''
  successMessage.value = ''
  loading.value = true

  try {
    const result = await signUpWithEmail(email.value, password.value, displayName.value)
    
    if (result.success) {
      successMessage.value = 'Account created! Please check your email to verify your account.'
      // Don't redirect immediately - let them see the verification message
    } else {
      errorMessage.value = result.message || 'Sign up failed. Please try again.'
    }
  } catch (error: any) {
    errorMessage.value = error.message || 'An unexpected error occurred.'
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
