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
