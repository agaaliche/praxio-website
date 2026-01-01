<template>
  <div class="min-h-screen bg-gradient-to-br from-primary-50 to-white flex items-center justify-center py-12 px-4">
    <div class="max-w-md w-full text-center">
      <!-- Loading State -->
      <div v-if="loading" class="bg-white rounded-2xl shadow-xl p-8">
        <div class="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
        <h2 class="text-xl font-display font-bold text-gray-900 mb-2">
          Connecting to Retroact...
        </h2>
        <p class="text-gray-600">Generating secure access token</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-white rounded-2xl shadow-xl p-8">
        <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <i class="fa-solid fa-exclamation-triangle text-red-600 text-2xl"></i>
        </div>
        <h2 class="text-xl font-display font-bold text-gray-900 mb-2">
          Authentication Required
        </h2>
        <p class="text-gray-600 mb-6">{{ error }}</p>
        <NuxtLink 
          :to="`/signin?redirect=${encodeURIComponent(redirectPath)}`"
          class="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-primary-600 text-white font-semibold hover:bg-primary-700 transition"
        >
          Sign in to Praxio
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * SSO Login Page (renamed from redirect-to-retroact)
 * 
 * This page is accessed when users try to login to retroact directly.
 * It checks if user is authenticated in praxio:
 * - If authenticated: generates SSO token and redirects to retroact
 * - If not authenticated: redirects to praxio signin
 */

definePageMeta({
  layout: false
})

const route = useRoute()
const { isAuthenticated, isLoading, getIdToken, getCurrentUser } = useAuth()
const loading = ref(true)
const error = ref('')

// Get the intended retroact destination
const returnUrl = (route.query.returnUrl as string) || 'http://localhost:8081'
const redirectPath = `/sso/login?returnUrl=${encodeURIComponent(returnUrl)}`

onMounted(async () => {
  console.log('🔐 SSO Login - returnUrl:', returnUrl)
  
  // Wait for auth to initialize
  console.log('⏳ Waiting for auth initialization...')
  while (isLoading.value) {
    await new Promise(resolve => setTimeout(resolve, 100))
  }
  console.log('✅ Auth initialized, isAuthenticated:', isAuthenticated.value)

  if (!isAuthenticated.value) {
    // Not logged in - show error and link to signin
    console.log('❌ Not authenticated, showing signin link')
    loading.value = false
    error.value = 'Please sign in to access Retroact'
    return
  }

  // Double check we have a current user
  const user = getCurrentUser()
  console.log('👤 Current user:', user ? `${user.email} (uid: ${user.uid})` : 'NULL')
  
  if (!user) {
    console.error('❌ No current user despite isAuthenticated being true')
    loading.value = false
    error.value = 'Authentication state error. Please try signing in again.'
    return
  }

  console.log('✅ User authenticated, generating SSO token for retroact')
  
  try {
    // Get Firebase ID token from auth composable
    console.log('🔑 Attempting to get Firebase ID token...')
    
    console.log('📞 Calling getIdToken()...')
    const idToken = await getIdToken()
    console.log('🔍 getIdToken result:', idToken ? `Token received (length: ${idToken.length})` : 'NULL/UNDEFINED')
    
    if (!idToken) {
      throw new Error('Unable to get authentication token - getIdToken() returned null')
    }
    
    console.log('🎫 Got Firebase token, calling generate-token API...')
    
    // Generate SSO token
    const response = await $fetch('/api/sso/generate-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`
      }
    })
    
    console.log('📦 API response:', response)
    console.log('📦 Response keys:', Object.keys(response || {}))
    console.log('📦 Response.ssoToken:', (response as any)?.ssoToken)

    if ((response as any)?.ssoToken) {
      console.log('✅ SSO token generated, redirecting to retroact')
      
      // Parse returnUrl to get the path
      const retroactUrl = new URL(returnUrl)
      const retroactAuthUrl = new URL('http://localhost:8081/auth/sso')
      retroactAuthUrl.searchParams.set('token', (response as any).ssoToken)
      
      // Add return path if not root
      if (retroactUrl.pathname && retroactUrl.pathname !== '/' && retroactUrl.pathname !== '/signin') {
        retroactAuthUrl.searchParams.set('returnUrl', retroactUrl.pathname)
      }
      
      // Redirect to retroact with SSO token
      window.location.href = retroactAuthUrl.toString()
    } else {
      throw new Error('No token received')
    }
  } catch (e: any) {
    console.error('❌ SSO token generation failed:', e)
    loading.value = false
    error.value = e.data?.message || 'Failed to generate access token. Please try again.'
  }
})
</script>
