<template>
  <div class="flex h-full">
    <!-- Level 3 Tabs - Style: Collapsible Vertical Sidebar -->
    <ClientOnly>
      <!-- Expanded Sidebar -->
      <aside 
        v-if="!isCollapsed"
        class="w-56 shrink-0 transition-all duration-300"
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
              Profile
            </NuxtLink>
            <NuxtLink 
              v-if="isAccountOwner"
              to="/account/settings/organization"
              class="flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl transition"
              :class="isActive('/account/settings/organization') 
                ? 'bg-primary-50 text-primary-700 border border-primary-100' 
                : 'text-gray-600 hover:bg-gray-50'"
            >
              <i class="fa-light fa-building-circle-check w-5 text-center"></i>
              Organization
            </NuxtLink>
            <NuxtLink 
              to="/account/settings/security"
              class="flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl transition"
              :class="isActive('/account/settings/security') 
                ? 'bg-primary-50 text-primary-700 border border-primary-100' 
                : 'text-gray-600 hover:bg-gray-50'"
            >
              <i class="fa-light fa-shield-keyhole w-5 text-center"></i>
              Security
            </NuxtLink>
            <NuxtLink 
              v-if="isAccountOwner"
              to="/account/settings/subscription"
              class="flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl transition"
              :class="isActive('/account/settings/subscription') 
                ? 'bg-primary-50 text-primary-700 border border-primary-100' 
                : 'text-gray-600 hover:bg-gray-50'"
            >
              <i class="fa-light fa-box-heart w-5 text-center"></i>
              Your Plan
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
              Billing
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

      <!-- Collapsed Sidebar -->
      <aside 
        v-else
        class="w-14 shrink-0 transition-all duration-300"
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

    <!-- Content -->
    <div class="flex-1 pl-6 transition-all duration-300">
      <NuxtPage />
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const { isAccountOwner } = useAuth()

const isCollapsed = ref(false)

const isActive = (path: string) => route.path === path

const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value
}
</script>

<style scoped>
/* No custom styles needed */
</style>
