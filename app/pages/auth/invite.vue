<template>
  <div class="min-h-screen bg-gradient-to-br from-primary-50 to-white flex items-center justify-center py-12 px-4">
    <div class="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
      <i class="fa-solid fa-spinner fa-spin text-4xl text-primary-600 mb-4"></i>
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
