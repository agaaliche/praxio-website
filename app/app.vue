<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
  <GlobalNotification />
</template>

<script setup lang="ts">
import GlobalNotification from '~/components/GlobalNotification.vue'

// Start role checking for invited users
const { user, isAuthenticated } = useAuth()
const { startRoleChecking, stopRoleChecking } = useSubscription()

// Watch for authentication and start/stop role checking
watch([isAuthenticated, () => user.value?.role], ([authenticated, role]) => {
  if (authenticated && role) {
    // User is authenticated and has a role (invited user)
    startRoleChecking()
  } else {
    // User is not authenticated or is account owner
    stopRoleChecking()
  }
}, { immediate: true })

// Cleanup on unmount
onUnmounted(() => {
  stopRoleChecking()
})
</script>
