<template>
  <div class="min-h-screen bg-gradient-to-br from-primary-50 to-white flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full">
      <!-- Logo/Brand -->
      <div class="text-center mb-8">
        <NuxtLink to="/" class="inline-flex items-center gap-2">
          <span class="text-3xl font-display font-bold text-primary-600">Praxio</span>
        </NuxtLink>
        <h2 class="mt-6 text-3xl font-display font-bold text-gray-900">
          Sign in to your account
        </h2>
        <p class="mt-2 text-gray-600">
          Access Retroact and all Praxio products
        </p>
      </div>

      <!-- Sign In Card -->
      <div class="bg-white rounded-2xl shadow-xl p-8">
        <form @submit.prevent="handleSignIn" class="space-y-6">
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
                autocomplete="current-password"
                required
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
          </div>

          <!-- Forgot Password -->
          <div class="text-right">
            <button
              type="button"
              @click="showResetModal = true"
              class="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              Forgot your password?
            </button>
          </div>

          <!-- Error Message -->
          <div
            v-if="errorMessage"
            class="bg-red-50 border border-red-600 text-red-600 px-4 py-3 rounded-xl text-sm"
          >
            {{ errorMessage }}
          </div>

          <!-- Sign In Button -->
          <button
            type="submit"
            :disabled="loading || !email || !password"
            class="w-full flex justify-center items-center px-6 py-3 rounded-xl bg-primary-600 text-white font-semibold hover:bg-primary-700 transition shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="loading" class="flex items-center">
              <SpinnerIcon class="mr-2" />
              Signing in...
            </span>
            <span v-else>Sign in</span>
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

          <!-- Google Sign In -->
          <button
            type="button"
            @click="handleGoogleSignIn"
            :disabled="loadingGoogle"
            class="w-full flex justify-center items-center px-6 py-3 rounded-xl bg-white text-gray-700 font-semibold border-2 border-gray-300 hover:bg-gray-50 transition"
          >
            <span v-if="loadingGoogle" class="flex items-center">
              <SpinnerIcon class="mr-2" />
              Connecting...
            </span>
            <span v-else class="flex items-center">
              <i class="fa-brands fa-google text-red-600 mr-2"></i>
              Sign in with Google
            </span>
          </button>

          <!-- Sign Up Link -->
          <p class="text-center text-gray-600 mt-6">
            Don't have an account?
            <NuxtLink to="/signup" class="text-primary-600 hover:text-primary-700 font-semibold">
              Sign up
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

    <!-- Password Reset Modal -->
    <Teleport to="body">
      <div
        v-if="showResetModal"
        class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        @click.self="showResetModal = false"
      >
        <div class="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
          <h3 class="text-xl font-display font-bold text-gray-900 mb-4">
            Reset your password
          </h3>
          <p class="text-gray-600 text-sm mb-6">
            Enter your email address and we'll send you a link to reset your password.
          </p>

          <form @submit.prevent="handleResetPassword" class="space-y-4">
            <div>
              <label for="reset-email" class="block text-sm font-medium text-gray-700 mb-2">
                Email address
              </label>
              <input
                id="reset-email"
                v-model="resetEmail"
                type="email"
                required
                class="block w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition"
                placeholder="you@example.com"
              />
            </div>

            <!-- Reset Messages -->
            <div
              v-if="resetMessage"
              :class="[
                'px-4 py-3 rounded-xl text-sm',
                resetSuccess ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-600 text-red-600'
              ]"
            >
              {{ resetMessage }}
            </div>

            <div class="flex gap-3">
              <button
                type="button"
                @click="showResetModal = false"
                class="flex-1 px-6 py-3 rounded-xl bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                :disabled="loadingReset || !resetEmail"
                class="flex-1 px-6 py-3 rounded-xl bg-primary-600 text-white font-semibold hover:bg-primary-700 transition disabled:opacity-50"
              >
                <span v-if="loadingReset">
                  <SpinnerIcon class="mr-1" size="xs" />
                </span>
                Send link
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false,
  middleware: 'guest'
})

useHead({
  title: 'Sign In - Praxio'
})

const router = useRouter()
const route = useRoute()
const { signInWithEmail, signInWithGoogle } = useAuth()

// Form state
const email = ref('')
const password = ref('')
const showPassword = ref(false)
const loading = ref(false)
const loadingGoogle = ref(false)
const errorMessage = ref('')

// Reset password state
const showResetModal = ref(false)
const resetEmail = ref('')
const resetMessage = ref('')
const resetSuccess = ref(false)
const loadingReset = ref(false)

// Handle email/password sign in
const handleSignIn = async () => {
  errorMessage.value = ''
  loading.value = true

  try {
    const result = await signInWithEmail(email.value, password.value)
    
    if (result.success) {
      // Redirect to intended destination or account page
      const redirect = route.query.redirect as string
      await router.push(redirect || '/account')
    } else {
      errorMessage.value = result.message || 'Sign in failed. Please try again.'
    }
  } catch (error: any) {
    errorMessage.value = error.message || 'An unexpected error occurred.'
  } finally {
    loading.value = false
  }
}

// Handle Google sign in
const handleGoogleSignIn = async () => {
  errorMessage.value = ''
  loadingGoogle.value = true

  try {
    const result = await signInWithGoogle()
    
    if (result.success) {
      const redirect = route.query.redirect as string
      await router.push(redirect || '/account')
    } else {
      errorMessage.value = result.message || 'Google sign in failed.'
    }
  } catch (error: any) {
    errorMessage.value = error.message || 'An unexpected error occurred.'
  } finally {
    loadingGoogle.value = false
  }
}

// Handle password reset
const handleResetPassword = async () => {
  resetMessage.value = ''
  resetSuccess.value = false
  loadingReset.value = true

  try {
    const { resetPassword } = useAuth()
    const result = await resetPassword(resetEmail.value)
    
    if (result.success) {
      resetSuccess.value = true
      resetMessage.value = 'Password reset email sent! Check your inbox.'
    } else {
      resetMessage.value = result.message || 'Failed to send reset email.'
    }
  } catch (error: any) {
    resetMessage.value = error.message || 'An error occurred.'
  } finally {
    loadingReset.value = false
  }
}

// Pre-fill reset email from sign in form
watch(showResetModal, (show) => {
  if (show && email.value) {
    resetEmail.value = email.value
  }
  if (!show) {
    resetMessage.value = ''
    resetSuccess.value = false
  }
})
</script>
