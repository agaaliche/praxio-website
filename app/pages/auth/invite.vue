<template>
  <div class="min-h-screen bg-gradient-to-br from-primary-50 to-white flex items-center justify-center py-12 px-4">
    <div class="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
      <div class="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
      <h2 class="text-xl font-display font-bold text-gray-900 mb-2">
        Redirection...
      </h2>
      <p class="text-gray-600">Veuillez patienter...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * Legacy invite page - redirects to magic-link page
 * Kept for backwards compatibility with old invite links
 */

definePageMeta({
  layout: false
})

const route = useRoute()
const router = useRouter()

// Redirect to magic-link page with same token
onMounted(() => {
  const token = route.query.token as string
  if (token) {
    router.replace(`/auth/magic-link?token=${token}`)
  } else {
    router.replace('/signin')
  }
})
</script>
