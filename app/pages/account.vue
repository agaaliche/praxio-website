<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Sub-header with tabs -->
    <div class="bg-white border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ClientOnly>
          <nav class="flex items-center gap-8 h-12">
            <NuxtLink 
              to="/account" 
              class="text-sm font-medium border-b-2 h-full flex items-center transition"
              :class="$route.path === '/account' ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-600 hover:text-primary-600'"
            >
              <i class="fa-solid fa-house mr-2"></i>
              Dashboard
            </NuxtLink>
            <NuxtLink 
              to="/account/patients" 
              class="text-sm font-medium border-b-2 h-full flex items-center transition"
              :class="$route.path.startsWith('/account/patients') ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-600 hover:text-primary-600'"
            >
              <i class="fa-solid fa-users-medical mr-2"></i>
              Patients
            </NuxtLink>
            <NuxtLink 
              v-if="isAccountOwner"
              to="/account/team" 
              class="text-sm font-medium border-b-2 h-full flex items-center transition"
              :class="$route.path.startsWith('/account/team') ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-600 hover:text-primary-600'"
            >
              <i class="fa-solid fa-users mr-2"></i>
              Team
            </NuxtLink>
            <NuxtLink 
              to="/account/settings" 
              class="text-sm font-medium border-b-2 h-full flex items-center transition"
              :class="$route.path.startsWith('/account/settings') ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-600 hover:text-primary-600'"
            >
              <i class="fa-solid fa-gear mr-2"></i>
              Settings
            </NuxtLink>
          </nav>
          <template #fallback>
            <nav class="flex items-center gap-8 h-12">
              <span class="text-sm font-medium h-full flex items-center text-gray-400">Loading...</span>
            </nav>
          </template>
        </ClientOnly>
      </div>
    </div>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <NuxtPage />
    </main>
  </div>
</template>

<script setup lang="ts">
const { isAccountOwner } = useAuth()
</script>
