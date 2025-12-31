<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Sub-header with tabs (hidden on mobile) -->
    <TheSubHeader :hide-on-scroll-down="true" class="hidden md:block">
      <ClientOnly>
        <NuxtLink 
          v-if="hasAccess"
          to="/account" 
          class="text-sm font-medium border-b-2 h-full flex items-center transition"
          :class="$route.path === '/account' ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-600 hover:text-primary-600'"
        >
          <i class="fa-solid fa-house mr-2"></i>
          {{ t('account.dashboard.title') }}
        </NuxtLink>
        <span 
          v-else
          class="text-sm font-medium border-b-2 border-transparent h-full flex items-center text-gray-300 cursor-not-allowed"
          title="Subscribe to access Dashboard"
        >
          <i class="fa-solid fa-house mr-2"></i>
          {{ t('account.dashboard.title') }}
        </span>
        <NuxtLink 
          v-if="hasAccess"
          to="/account/patients" 
          class="text-sm font-medium border-b-2 h-full flex items-center transition"
          :class="$route.path.startsWith('/account/patients') ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-600 hover:text-primary-600'"
        >
          <i class="fa-solid fa-users-medical mr-2"></i>
          {{ t('account.patients.title') }}
        </NuxtLink>
        <span 
          v-else
          class="text-sm font-medium border-b-2 border-transparent h-full flex items-center text-gray-300 cursor-not-allowed"
          title="Subscribe to access Patients"
        >
          <i class="fa-solid fa-users-medical mr-2"></i>
          {{ t('account.patients.title') }}
        </span>
        <NuxtLink 
          v-if="isAccountOwner && hasAccess"
          to="/account/team" 
          class="text-sm font-medium border-b-2 h-full flex items-center transition"
          :class="$route.path.startsWith('/account/team') ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-600 hover:text-primary-600'"
        >
          <i class="fa-solid fa-users mr-2"></i>
          {{ t('account.team.title') }}
        </NuxtLink>
        <span 
          v-else-if="isAccountOwner && !hasAccess"
          class="text-sm font-medium border-b-2 border-transparent h-full flex items-center text-gray-300 cursor-not-allowed"
          title="Subscribe to access Team"
        >
          <i class="fa-solid fa-users mr-2"></i>
          {{ t('account.team.title') }}
        </span>
        <NuxtLink 
          to="/account/settings" 
          class="text-sm font-medium border-b-2 h-full flex items-center transition"
          :class="$route.path.startsWith('/account/settings') ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-600 hover:text-primary-600'"
        >
          <i class="fa-solid fa-gear mr-2"></i>
          {{ t('account.settings.title') }}
        </NuxtLink>
        <template #fallback>
          <span class="text-sm font-medium h-full flex items-center text-gray-400">Loading...</span>
        </template>
      </ClientOnly>
    </TheSubHeader>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-8">
      <NuxtPage />
    </main>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()
const { isAccountOwner } = useAuth()
const { needsSubscription, isTrialExpired, subscriptionFetched, fetchSubscription } = useSubscription()

// Has access = trial active OR has subscription
const hasAccess = computed(() => !needsSubscription.value)

// Fetch subscription on mount
onMounted(async () => {
  if (!subscriptionFetched.value) {
    await fetchSubscription()
  }
})

definePageMeta({
  middleware: ['auth', 'subscription']
})
</script>
