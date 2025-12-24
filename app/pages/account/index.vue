<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <NuxtLink to="/" class="flex items-center gap-2">
            <span class="text-2xl font-display font-bold text-primary-600">Praxio</span>
          </NuxtLink>

          <div class="flex items-center gap-4">
            <span class="text-sm text-gray-600">{{ user?.email }}</span>
            <button
              @click="handleSignOut"
              class="text-sm text-gray-500 hover:text-gray-700 font-medium"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <!-- Welcome Section -->
      <div class="mb-10">
        <h1 class="text-3xl font-display font-bold text-gray-900">
          Welcome back, {{ displayName }}!
        </h1>
        <p class="mt-2 text-gray-600">
          Manage your Praxio account and access your products.
        </p>
      </div>

      <!-- Products Grid -->
      <div class="mb-12">
        <h2 class="text-xl font-display font-bold text-gray-900 mb-6">Your Products</h2>
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <!-- Retroact -->
          <a
            href="https://retroact.app"
            class="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-lg hover:border-primary-300 transition group"
          >
            <div class="flex items-start justify-between mb-4">
              <div class="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                <i class="fa-solid fa-droplet text-primary-600 text-xl"></i>
              </div>
              <span class="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                Active
              </span>
            </div>
            <h3 class="text-lg font-display font-bold text-gray-900 group-hover:text-primary-600 transition">
              Retroact
            </h3>
            <p class="mt-2 text-sm text-gray-600">
              INR management for anticoagulant therapy. Track results, generate prescriptions, manage patients.
            </p>
            <div class="mt-4 flex items-center text-primary-600 text-sm font-medium">
              Open Retroact
              <i class="fa-solid fa-arrow-right ml-2 group-hover:translate-x-1 transition-transform"></i>
            </div>
          </a>

          <!-- More Products Coming Soon -->
          <div class="bg-gray-100 rounded-2xl p-6 border border-dashed border-gray-300">
            <div class="flex items-start justify-between mb-4">
              <div class="w-12 h-12 bg-gray-200 rounded-xl flex items-center justify-center">
                <i class="fa-solid fa-puzzle-piece text-gray-400 text-xl"></i>
              </div>
              <span class="text-xs font-medium text-gray-500 bg-gray-200 px-2 py-1 rounded-full">
                Coming Soon
              </span>
            </div>
            <h3 class="text-lg font-display font-bold text-gray-500">
              More Products
            </h3>
            <p class="mt-2 text-sm text-gray-500">
              We're working on new medical software solutions. Stay tuned for updates!
            </p>
          </div>
        </div>
      </div>

      <!-- Account Management -->
      <div>
        <h2 class="text-xl font-display font-bold text-gray-900 mb-6">Account Settings</h2>
        <div class="bg-white rounded-2xl border border-gray-200 divide-y divide-gray-200">
          <!-- Profile -->
          <NuxtLink
            to="/account/profile"
            class="flex items-center justify-between p-6 hover:bg-gray-50 transition"
          >
            <div class="flex items-center gap-4">
              <div class="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
                <i class="fa-solid fa-user text-primary-600"></i>
              </div>
              <div>
                <h3 class="font-medium text-gray-900">Profile</h3>
                <p class="text-sm text-gray-500">Update your personal information</p>
              </div>
            </div>
            <i class="fa-solid fa-chevron-right text-gray-400"></i>
          </NuxtLink>

          <!-- Organization (Account Owner Only) -->
          <NuxtLink
            v-if="isAccountOwner"
            to="/account/organization"
            class="flex items-center justify-between p-6 hover:bg-gray-50 transition"
          >
            <div class="flex items-center gap-4">
              <div class="w-10 h-10 bg-secondary-100 rounded-xl flex items-center justify-center">
                <i class="fa-solid fa-building text-secondary-600"></i>
              </div>
              <div>
                <h3 class="font-medium text-gray-900">Organization</h3>
                <p class="text-sm text-gray-500">Manage your practice details</p>
              </div>
            </div>
            <i class="fa-solid fa-chevron-right text-gray-400"></i>
          </NuxtLink>

          <!-- Team (Account Owner Only) -->
          <NuxtLink
            v-if="isAccountOwner"
            to="/account/team"
            class="flex items-center justify-between p-6 hover:bg-gray-50 transition"
          >
            <div class="flex items-center gap-4">
              <div class="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <i class="fa-solid fa-users text-blue-600"></i>
              </div>
              <div>
                <h3 class="font-medium text-gray-900">Team Members</h3>
                <p class="text-sm text-gray-500">Invite and manage team access</p>
              </div>
            </div>
            <i class="fa-solid fa-chevron-right text-gray-400"></i>
          </NuxtLink>

          <!-- Billing (Account Owner Only) -->
          <NuxtLink
            v-if="isAccountOwner"
            to="/account/billing"
            class="flex items-center justify-between p-6 hover:bg-gray-50 transition"
          >
            <div class="flex items-center gap-4">
              <div class="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                <i class="fa-solid fa-credit-card text-green-600"></i>
              </div>
              <div>
                <h3 class="font-medium text-gray-900">Billing & Subscription</h3>
                <p class="text-sm text-gray-500">Manage your plan and payment methods</p>
              </div>
            </div>
            <i class="fa-solid fa-chevron-right text-gray-400"></i>
          </NuxtLink>

          <!-- Security -->
          <NuxtLink
            to="/account/security"
            class="flex items-center justify-between p-6 hover:bg-gray-50 transition"
          >
            <div class="flex items-center gap-4">
              <div class="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                <i class="fa-solid fa-shield text-amber-600"></i>
              </div>
              <div>
                <h3 class="font-medium text-gray-900">Security</h3>
                <p class="text-sm text-gray-500">Password and authentication settings</p>
              </div>
            </div>
            <i class="fa-solid fa-chevron-right text-gray-400"></i>
          </NuxtLink>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false,
  middleware: 'auth'
})

useHead({
  title: 'Account - Praxio'
})

const router = useRouter()
const { user, signOutUser, isAccountOwner } = useAuth()

// Computed display name
const displayName = computed(() => {
  if (!user.value) return ''
  return user.value.displayName || user.value.email?.split('@')[0] || 'there'
})

// Handle sign out
const handleSignOut = async () => {
  await signOutUser()
  router.push('/signin')
}
</script>
