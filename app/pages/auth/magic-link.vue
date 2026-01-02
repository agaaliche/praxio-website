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
        <p class="text-gray-600">Veuillez patienter...</p>
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
        <p class="text-sm text-gray-500">Redirection en cours...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-white rounded-2xl shadow-xl p-8 text-center">
        <div class="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
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
          Retour à la connexion
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { signInWithCustomToken } from 'firebase/auth'

definePageMeta({
  layout: false
})

useHead({
  title: 'Validation de l\'invitation - Praxio'
})

const route = useRoute()
const router = useRouter()

// State
const loading = ref(true)
const loadingMessage = ref('Validation de votre invitation...')
const success = ref(false)
const successTitle = ref('')
const successMessage = ref('')
const error = ref(false)
const errorTitle = ref('')
const errorMessage = ref('')

// Get token from URL
const token = computed(() => route.query.token as string)

// Validate and authenticate on mount
onMounted(async () => {
  if (!token.value) {
    error.value = true
    errorTitle.value = 'Lien invalide'
    errorMessage.value = 'Aucun token d\'invitation n\'a été fourni. Veuillez utiliser le lien de votre email.'
    loading.value = false
    return
  }

  try {
    loadingMessage.value = 'Validation de votre invitation...'

    // Call the magic link validation endpoint
    const response = await $fetch<{
      success: boolean
      message: string
      firebaseToken?: string
      user?: {
        id: number
        email: string
        firstName: string
        lastName: string
        role: string
        accountOwnerId: string
      }
    }>('/api/users/auth/magic-link', {
      method: 'POST',
      body: { token: token.value }
    })

    if (response.success && response.firebaseToken) {
      loadingMessage.value = 'Connexion en cours...'

      // Sign in with custom token
      const { $auth } = useNuxtApp()
      if ($auth) {
        await signInWithCustomToken($auth, response.firebaseToken)
        
        // Show success state briefly before redirect
        loading.value = false
        success.value = true
        successTitle.value = 'Bienvenue sur Praxio !'
        successMessage.value = `Votre compte a été configuré avec succès. Vos identifiants de connexion ont été envoyés à ${response.user?.email}.`

        // Wait 2 seconds to show success message, then redirect
        await new Promise(resolve => setTimeout(resolve, 2000))
        router.push('/retroact')
      } else {
        throw new Error('Firebase not initialized')
      }
    } else {
      throw new Error(response.message || 'Validation failed')
    }
  } catch (e: any) {
    console.error('Magic link validation error:', e)
    loading.value = false
    error.value = true

    // Handle specific error cases
    if (e.data?.message?.includes('expired')) {
      errorTitle.value = 'Lien expiré'
      errorMessage.value = 'Votre lien d\'invitation a expiré. Veuillez demander une nouvelle invitation.'
    } else if (e.data?.message?.includes('already used') || e.data?.message?.includes('Invalid token')) {
      errorTitle.value = 'Lien déjà utilisé'
      errorMessage.value = 'Ce lien d\'invitation a déjà été utilisé. Si vous avez déjà un compte, connectez-vous.'
    } else if (e.data?.message?.includes('already has')) {
      errorTitle.value = 'Email déjà utilisé'
      errorMessage.value = e.data.message
    } else {
      errorTitle.value = 'Erreur de validation'
      errorMessage.value = e.data?.message || 'Une erreur s\'est produite lors de la validation. Veuillez réessayer.'
    }
  }
})
</script>
