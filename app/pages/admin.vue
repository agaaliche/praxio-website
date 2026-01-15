<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Sub-header with tabs (hidden on mobile) -->
    <TheSubHeader :hide-on-scroll-down="true" class="hidden md:block">
      <ClientOnly>
        <NuxtLink 
          to="/admin" 
          class="text-sm font-medium border-b-2 h-full flex items-center transition"
          :class="$route.path === '/admin' ? 'border-red-600 text-red-600' : 'border-transparent text-gray-600 hover:text-red-600'"
        >
          <i class="fa-solid fa-users mr-2"></i>
          Users
        </NuxtLink>
        <NuxtLink 
          to="/admin/online" 
          class="text-sm font-medium border-b-2 h-full flex items-center transition"
          :class="$route.path === '/admin/online' ? 'border-red-600 text-red-600' : 'border-transparent text-gray-600 hover:text-red-600'"
        >
          <i class="fa-solid fa-circle text-xs mr-2"></i>
          Online
        </NuxtLink>
        <NuxtLink 
          to="/admin/messaging" 
          class="text-sm font-medium border-b-2 h-full flex items-center transition"
          :class="$route.path === '/admin/messaging' ? 'border-red-600 text-red-600' : 'border-transparent text-gray-600 hover:text-red-600'"
        >
          <i class="fa-solid fa-message mr-2"></i>
          Messaging
        </NuxtLink>
        <NuxtLink 
          to="/admin/accounts" 
          class="text-sm font-medium border-b-2 h-full flex items-center transition"
          :class="$route.path === '/admin/accounts' ? 'border-red-600 text-red-600' : 'border-transparent text-gray-600 hover:text-red-600'"
        >
          <i class="fa-solid fa-user-gear mr-2"></i>
          Accounts
        </NuxtLink>
        <NuxtLink 
          to="/admin/trials" 
          class="text-sm font-medium border-b-2 h-full flex items-center transition"
          :class="$route.path === '/admin/trials' ? 'border-red-600 text-red-600' : 'border-transparent text-gray-600 hover:text-red-600'"
        >
          <i class="fa-solid fa-calendar-clock mr-2"></i>
          Trials
        </NuxtLink>
        <NuxtLink 
          to="/admin/impersonate" 
          class="text-sm font-medium border-b-2 h-full flex items-center transition"
          :class="$route.path === '/admin/impersonate' ? 'border-red-600 text-red-600' : 'border-transparent text-gray-600 hover:text-red-600'"
        >
          <i class="fa-solid fa-user-secret mr-2"></i>
          Impersonate
        </NuxtLink>
        <template #fallback>
          <span class="text-sm font-medium h-full flex items-center text-gray-400">Loading...</span>
        </template>
      </ClientOnly>
    </TheSubHeader>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-8">
      <!-- Mobile Tabs -->
      <div class="md:hidden mb-6 overflow-x-auto">
        <ClientOnly>
          <div class="flex gap-2 min-w-max pb-2">
            <NuxtLink 
              to="/admin" 
              class="px-3 py-2 text-sm font-medium rounded-lg transition"
              :class="$route.path === '/admin' ? 'bg-red-100 text-red-700' : 'bg-white text-gray-600 hover:bg-gray-100'"
            >
              <i class="fa-solid fa-users mr-1.5"></i>Users
            </NuxtLink>
            <NuxtLink 
              to="/admin/online" 
              class="px-3 py-2 text-sm font-medium rounded-lg transition"
              :class="$route.path === '/admin/online' ? 'bg-red-100 text-red-700' : 'bg-white text-gray-600 hover:bg-gray-100'"
            >
              <i class="fa-solid fa-circle text-xs mr-1.5"></i>Online
            </NuxtLink>
            <NuxtLink 
              to="/admin/messaging" 
              class="px-3 py-2 text-sm font-medium rounded-lg transition"
              :class="$route.path === '/admin/messaging' ? 'bg-red-100 text-red-700' : 'bg-white text-gray-600 hover:bg-gray-100'"
            >
              <i class="fa-solid fa-message mr-1.5"></i>Messaging
            </NuxtLink>
            <NuxtLink 
              to="/admin/accounts" 
              class="px-3 py-2 text-sm font-medium rounded-lg transition"
              :class="$route.path === '/admin/accounts' ? 'bg-red-100 text-red-700' : 'bg-white text-gray-600 hover:bg-gray-100'"
            >
              <i class="fa-solid fa-user-gear mr-1.5"></i>Accounts
            </NuxtLink>
            <NuxtLink 
              to="/admin/trials" 
              class="px-3 py-2 text-sm font-medium rounded-lg transition"
              :class="$route.path === '/admin/trials' ? 'bg-red-100 text-red-700' : 'bg-white text-gray-600 hover:bg-gray-100'"
            >
              <i class="fa-solid fa-calendar-clock mr-1.5"></i>Trials
            </NuxtLink>
            <NuxtLink 
              to="/admin/impersonate" 
              class="px-3 py-2 text-sm font-medium rounded-lg transition"
              :class="$route.path === '/admin/impersonate' ? 'bg-red-100 text-red-700' : 'bg-white text-gray-600 hover:bg-gray-100'"
            >
              <i class="fa-solid fa-user-secret mr-1.5"></i>Impersonate
            </NuxtLink>
          </div>
          <template #fallback>
            <div class="flex gap-2 min-w-max pb-2">
              <span class="px-3 py-2 text-sm text-gray-400">Loading...</span>
            </div>
          </template>
        </ClientOnly>
      </div>
      
      <NuxtPage />
    </main>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ['auth', 'siteadmin']
})
</script>
