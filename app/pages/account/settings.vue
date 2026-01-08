<template>
  <ClientOnly>
    <!-- Breadcrumbs (Mobile Only) -->
    <nav class="mb-4 md:hidden">
      <ol class="flex items-center gap-2 text-sm text-primary-600">
        <li>
          <NuxtLink to="/account" class="hover:text-primary-700 transition">{{ t('account.title') }}</NuxtLink>
        </li>
        <li class="text-primary-400">
          <i class="fa-solid fa-chevron-right text-xs"></i>
        </li>
        <li>
          <NuxtLink to="/account/settings" class="hover:text-primary-700 transition">{{ t('account.settings.title') }}</NuxtLink>
        </li>
        <li class="text-primary-400">
          <i class="fa-solid fa-chevron-right text-xs"></i>
        </li>
        <li class="font-medium">
          {{ currentPageTitle }}
        </li>
      </ol>
    </nav>
    
    <div class="flex h-full min-w-0">
      <!-- Mobile Settings Selector (visible only on mobile) -->
      <div class="lg:hidden bg-gradient-to-r from-gray-50 to-white border-b border-gray-200 px-4 pt-0 pb-4 mt-0 absolute top-32 left-0 right-0 z-30">
      <div class="relative">
        <!-- Custom Dropdown Button -->
        <button @click="mobileDropdownOpen = !mobileDropdownOpen" class="w-full flex items-center justify-between px-4 py-3 bg-white border-2 border-gray-200 rounded-xl hover:border-primary-300 transition-colors">
          <span class="flex items-center gap-3 min-w-0 flex-1">
            <i :class="currentPageIcon" class="text-primary-600 w-5 text-center"></i>
            <div class="text-left min-w-0 flex-1">
              <div class="text-sm font-semibold text-gray-900">{{ currentPageTitle }}</div>
            </div>
          </span>
          <svg class="w-5 h-5 text-primary-600 transition-transform ml-2 flex-shrink-0" :class="{ 'rotate-180': mobileDropdownOpen }" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        <!-- Full-Screen Overlay Dropdown -->
        <Teleport to="body">
          <Transition enter-active-class="transition ease-out duration-200" enter-from-class="transform opacity-0" enter-to-class="transform opacity-100" leave-active-class="transition ease-in duration-150" leave-from-class="transform opacity-100" leave-to-class="transform opacity-0">
            <div v-if="mobileDropdownOpen" class="fixed inset-0 z-[100] flex items-start justify-center p-2.5 bg-primary-600/25" @click.self="mobileDropdownOpen = false">
              <div class="w-full max-w-2xl bg-white rounded-xl shadow-2xl overflow-hidden my-2">
                <!-- Header with Close Button -->
                <div class="sticky top-0 bg-white border-b border-gray-200">
                  <div class="px-4 py-4 flex items-center justify-between">
                    <h3 class="text-lg font-semibold text-gray-900">{{ t('account.settings.title') }}</h3>
                    <button @click="mobileDropdownOpen = false" class="w-9 h-9 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition">
                      <i class="fa-solid fa-xmark text-xl"></i>
                    </button>
                  </div>
                </div>
                
                <!-- Settings List -->
                <div class="overflow-y-auto" style="max-height: calc(100vh - 180px);">
                  <NuxtLink 
                    to="/account/settings/profile"
                    @click="mobileDropdownOpen = false"
                    class="w-full flex items-center gap-3 px-4 py-4 hover:bg-gray-50 transition-colors border-b border-gray-100"
                    :class="{ 'bg-primary-50': isActive('/account/settings/profile') || $route.path === '/account/settings' }"
                  >
                    <i class="fa-light fa-user-vneck w-5 text-center text-primary-600"></i>
                    <div class="flex-1 min-w-0 text-left">
                      <div class="text-sm font-medium text-gray-900">{{ t('account.dashboard.profile') }}</div>
                    </div>
                    <i v-if="isActive('/account/settings/profile') || $route.path === '/account/settings'" class="fa-solid fa-check text-primary-600"></i>
                  </NuxtLink>
                  
                  <NuxtLink 
                    to="/account/settings/organization"
                    @click="mobileDropdownOpen = false"
                    class="w-full flex items-center gap-3 px-4 py-4 hover:bg-gray-50 transition-colors border-b border-gray-100"
                    :class="{ 'bg-primary-50': isActive('/account/settings/organization') }"
                  >
                    <i class="fa-light fa-building-circle-check w-5 text-center text-primary-600"></i>
                    <div class="flex-1 min-w-0 text-left">
                      <div class="text-sm font-medium text-gray-900">{{ t('account.dashboard.organization') }}</div>
                    </div>
                    <i v-if="isActive('/account/settings/organization')" class="fa-solid fa-check text-primary-600"></i>
                  </NuxtLink>
                  
                  <NuxtLink 
                    to="/account/settings/security"
                    @click="mobileDropdownOpen = false"
                    class="w-full flex items-center gap-3 px-4 py-4 hover:bg-gray-50 transition-colors border-b border-gray-100"
                    :class="{ 'bg-primary-50': isActive('/account/settings/security') }"
                  >
                    <i class="fa-light fa-shield-keyhole w-5 text-center text-primary-600"></i>
                    <div class="flex-1 min-w-0 text-left">
                      <div class="text-sm font-medium text-gray-900">{{ t('account.dashboard.security') }}</div>
                    </div>
                    <i v-if="isActive('/account/settings/security')" class="fa-solid fa-check text-primary-600"></i>
                  </NuxtLink>
                  
                  <NuxtLink 
                    to="/account/settings/subscription"
                    @click="mobileDropdownOpen = false"
                    class="w-full flex items-center gap-3 px-4 py-4 hover:bg-gray-50 transition-colors border-b border-gray-100"
                    :class="{ 'bg-primary-50': isActive('/account/settings/subscription') }"
                  >
                    <i class="fa-light fa-box-heart w-5 text-center text-primary-600"></i>
                    <div class="flex-1 min-w-0 text-left">
                      <div class="flex items-center gap-2">
                        <span class="text-sm font-medium text-gray-900">{{ t('account.dashboard.yourPlan') }}</span>
                        <i v-if="isTrialExpired" class="fa-solid fa-triangle-exclamation text-red-600"></i>
                      </div>
                    </div>
                    <i v-if="isActive('/account/settings/subscription')" class="fa-solid fa-check text-primary-600"></i>
                  </NuxtLink>
                  
                  <NuxtLink 
                    v-if="isAccountOwner"
                    to="/account/settings/billing"
                    @click="mobileDropdownOpen = false"
                    class="w-full flex items-center gap-3 px-4 py-4 hover:bg-gray-50 transition-colors border-b border-gray-100"
                    :class="{ 'bg-primary-50': isActive('/account/settings/billing') }"
                  >
                    <i class="fa-light fa-credit-card w-5 text-center text-primary-600"></i>
                    <div class="flex-1 min-w-0 text-left">
                      <div class="text-sm font-medium text-gray-900">{{ t('account.dashboard.billing') }}</div>
                    </div>
                    <i v-if="isActive('/account/settings/billing')" class="fa-solid fa-check text-primary-600"></i>
                  </NuxtLink>
                </div>
              </div>
            </div>
          </Transition>
        </Teleport>
      </div>
    </div>
    
    <!-- Level 3 Tabs - Style: Collapsible Vertical Sidebar (hidden on mobile) -->
    <ClientOnly>
      <!-- Expanded Sidebar -->
      <aside 
        v-if="!isCollapsed"
        class="w-56 shrink-0 transition-all duration-300 hidden lg:block"
      >
        <div class="bg-white rounded-2xl border border-gray-200 p-3 sticky top-4">
          <nav class="space-y-1">
            <NuxtLink 
              to="/account/settings/profile"
              class="flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl transition"
              :class="isActive('/account/settings/profile') || $route.path === '/account/settings' 
                ? 'bg-primary-50 text-primary-700 border border-primary-100' 
                : 'text-gray-600 hover:bg-gray-50'"
            >
              <i class="fa-light fa-user-vneck w-5 text-center"></i>
              {{ t('account.dashboard.profile') }}
            </NuxtLink>
            <NuxtLink 
              to="/account/settings/organization"
              class="flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl transition"
              :class="isActive('/account/settings/organization') 
                ? 'bg-primary-50 text-primary-700 border border-primary-100' 
                : 'text-gray-600 hover:bg-gray-50'"
            >
              <i class="fa-light fa-building-circle-check w-5 text-center"></i>
              {{ t('account.dashboard.organization') }}
            </NuxtLink>
            <NuxtLink 
              to="/account/settings/security"
              class="flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl transition"
              :class="isActive('/account/settings/security') 
                ? 'bg-primary-50 text-primary-700 border border-primary-100' 
                : 'text-gray-600 hover:bg-gray-50'"
            >
              <i class="fa-light fa-shield-keyhole w-5 text-center"></i>
              {{ t('account.dashboard.security') }}
            </NuxtLink>
            <NuxtLink 
              to="/account/settings/subscription"
              class="flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl transition"
              :class="isActive('/account/settings/subscription') 
                ? 'bg-primary-50 text-primary-700 border border-primary-100' 
                : 'text-gray-600 hover:bg-gray-50'"
            >
              <i class="fa-light fa-box-heart w-5 text-center"></i>
              {{ t('account.dashboard.yourPlan') }}
              <i v-if="isTrialExpired" class="fa-solid fa-triangle-exclamation text-red-600 ml-auto"></i>
            </NuxtLink>
            <NuxtLink 
              v-if="isAccountOwner"
              to="/account/settings/billing"
              class="flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl transition"
              :class="isActive('/account/settings/billing') 
                ? 'bg-primary-50 text-primary-700 border border-primary-100' 
                : 'text-gray-600 hover:bg-gray-50'"
            >
              <i class="fa-light fa-credit-card w-5 text-center"></i>
              {{ t('account.dashboard.billing') }}
            </NuxtLink>
            
            <!-- Collapse Button (last item) -->
            <button 
              @click="toggleCollapse"
              class="w-full flex items-center justify-end px-3 py-2.5 text-sm font-medium rounded-xl transition text-gray-400 hover:bg-gray-50 hover:text-gray-600"
            >
              <i class="fa-regular fa-chevron-left w-5 text-center"></i>
            </button>
          </nav>
        </div>
      </aside>

      <!-- Collapsed Sidebar (hidden on mobile) -->
      <aside 
        v-else
        class="w-14 shrink-0 transition-all duration-300 hidden lg:block"
      >
        <div class="bg-white rounded-2xl border border-gray-200 p-2 sticky top-4">
          <!-- Expand Button with bars icon -->
          <button 
            @click="toggleCollapse"
            class="w-full flex items-center justify-center p-2.5 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-xl transition"
          >
            <i class="fa-regular fa-bars text-lg"></i>
          </button>
        </div>
      </aside>
      
      <template #fallback>
        <aside class="w-56 shrink-0">
          <div class="bg-white rounded-2xl border border-gray-200 p-3 sticky top-4">
            <div class="animate-pulse space-y-3">
              <div class="h-8 bg-gray-200 rounded"></div>
              <div class="h-10 bg-gray-200 rounded"></div>
              <div class="h-10 bg-gray-200 rounded"></div>
              <div class="h-10 bg-gray-200 rounded"></div>
            </div>
          </div>
        </aside>
      </template>
    </ClientOnly>

    <!-- Content (adjust padding for mobile dropdown) -->
    <div class="flex-1 lg:pl-6 transition-all duration-300 min-w-0" :class="{ 'pt-[75px] lg:pt-0': true }">
      <NuxtPage />
    </div>
    </div>
  </ClientOnly>
</template>

<script setup lang="ts">
const { t } = useI18n()
const route = useRoute()
const { isAccountOwner } = useAuth()
const { isTrialExpired } = useSubscription()

const isCollapsed = ref(false)
const mobileDropdownOpen = ref(false)

const isActive = (path: string) => route.path === path

const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value
}

// Computed properties for mobile dropdown
const settingsPages = computed(() => {
  const pages = [
    { path: '/account/settings/profile', title: t('account.dashboard.profile'), icon: 'fa-light fa-user-vneck' },
    { path: '/account/settings/organization', title: t('account.dashboard.organization'), icon: 'fa-light fa-building-circle-check' },
    { path: '/account/settings/security', title: t('account.dashboard.security'), icon: 'fa-light fa-shield-keyhole' },
    { path: '/account/settings/subscription', title: t('account.dashboard.yourPlan'), icon: 'fa-light fa-box-heart' }
  ]
  
  if (isAccountOwner.value) {
    pages.push({ path: '/account/settings/billing', title: t('account.dashboard.billing'), icon: 'fa-light fa-credit-card' })
  }
  
  return pages
})

const currentPageTitle = computed(() => {
  const currentPath = route.path
  if (currentPath === '/account/settings') {
    return t('account.dashboard.profile')
  }
  const page = settingsPages.value.find(p => p.path === currentPath)
  return page?.title || t('account.settings.title')
})

const currentPageIcon = computed(() => {
  const currentPath = route.path
  if (currentPath === '/account/settings') {
    return 'fa-light fa-user-vneck'
  }
  const page = settingsPages.value.find(p => p.path === currentPath)
  return page?.icon || 'fa-light fa-gear'
})
</script>

<style scoped>
/* No custom styles needed */
</style>
