<template>
  <AlertPage 
    v-if="loading"
    type="loading"
    :title="loadingTitle"
    :message="loadingMessage"
  />
  
  <AlertPage 
    v-else-if="error"
    type="error"
    :title="errorTitle"
    :message="errorMessage"
  >
    <template #actions>
      <NuxtLink 
        :to="`/signin?redirect=${encodeURIComponent(redirectPath)}`"
        class="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-primary-600 text-white font-semibold hover:bg-primary-700 transition"
      >
        {{ signInButtonText }}
      </NuxtLink>
    </template>
  </AlertPage>
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

import AlertPage from '~/../../packages/messaging/components/alerts/AlertPage.vue'

definePageMeta({
  layout: false
})

const { locale, t } = useI18n()
const route = useRoute()
const { isAuthenticated, isLoading, getIdToken, getCurrentUser } = useAuth()
const loading = ref(true)
const error = ref(false)

// Use i18n t function directly for better reliability
const loadingTitle = computed(() => t('auth.sso.connecting'))
const loadingMessage = computed(() => t('auth.sso.generatingToken'))
const errorTitle = computed(() => t('auth.sso.required'))
const errorMessage = computed(() => t('auth.sso.pleaseSignIn'))
const signInButtonText = computed(() => t('auth.sso.signInToPraxio'))

// Get runtime config for retroact URL
const config = useRuntimeConfig()
const retroactBaseUrl = config.public.retroactUrl

// Get the intended retroact destination
const returnUrl = (route.query.returnUrl as string) || retroactBaseUrl
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
    error.value = true
    return
  }

  // Double check we have a current user
  const user = getCurrentUser()
  console.log('👤 Current user:', user ? `${user.email} (uid: ${user.uid})` : 'NULL')
  
  if (!user) {
    console.error('❌ No current user despite isAuthenticated being true')
    loading.value = false
    error.value = true
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
      
      // Parse returnUrl to get the host and path
      const retroactUrl = new URL(returnUrl)
      const retroactAuthUrl = new URL('/auth/sso', retroactUrl.origin)
      retroactAuthUrl.searchParams.set('token', (response as any).ssoToken)
      
      // Add current language preference to URL
      retroactAuthUrl.searchParams.set('lang', locale.value)
      console.log(`🌍 Passing language preference to Retroact: ${locale.value}`)
      
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
    error.value = true
  }
})
</script>
