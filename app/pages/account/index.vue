<template>
  <div>
    <!-- Welcome Section -->
    <div class="mb-8">
      <h1 class="text-3xl font-display font-bold text-gray-900">
        Welcome back, {{ displayName }}!
      </h1>
      <p class="mt-2 text-gray-600">
        Manage your Praxio account and access your products.
      </p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12">
      <i class="fa-solid fa-spinner fa-spin text-2xl text-primary-600"></i>
      <p class="mt-2 text-gray-500">Loading dashboard...</p>
    </div>

    <template v-else>
      <!-- Quick Stats -->
      <div class="grid md:grid-cols-3 gap-6 mb-8">
        <div class="bg-white rounded-xl p-6 border border-gray-200">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
              <i class="fa-solid fa-users-medical text-primary-600 text-xl"></i>
            </div>
            <div>
              <p class="text-2xl font-bold text-gray-900">{{ patientCount }}</p>
              <p class="text-sm text-gray-500">Active Patients</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-xl p-6 border border-gray-200">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-secondary-100 rounded-xl flex items-center justify-center">
              <i class="fa-solid fa-users text-secondary-600 text-xl"></i>
            </div>
            <div>
              <p class="text-2xl font-bold text-gray-900">{{ teamCount }}</p>
              <p class="text-sm text-gray-500">Team Members</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-xl p-6 border border-gray-200">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <i class="fa-solid fa-check-circle text-green-600 text-xl"></i>
            </div>
            <div>
              <p class="text-2xl font-bold text-gray-900">Active</p>
              <p class="text-sm text-gray-500">Subscription Status</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Products Grid -->
      <div class="mb-8">
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

      <!-- Quick Links -->
      <div class="mb-8">
        <h2 class="text-xl font-display font-bold text-gray-900 mb-6">Quick Actions</h2>
        <div class="grid md:grid-cols-2 gap-6">
          <NuxtLink 
            to="/account/patients"
            class="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg hover:border-primary-300 transition group"
          >
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-lg font-bold text-gray-900 group-hover:text-primary-600">
                  Manage Patients
                </h3>
                <p class="mt-1 text-sm text-gray-500">
                  View, add, and edit patient records
                </p>
              </div>
              <i class="fa-solid fa-arrow-right text-gray-400 group-hover:text-primary-600 group-hover:translate-x-1 transition-all"></i>
            </div>
          </NuxtLink>

          <NuxtLink 
            v-if="isAccountOwner"
            to="/account/team"
            class="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg hover:border-primary-300 transition group"
          >
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-lg font-bold text-gray-900 group-hover:text-primary-600">
                  Manage Team
                </h3>
                <p class="mt-1 text-sm text-gray-500">
                  Invite team members and manage roles
                </p>
              </div>
              <i class="fa-solid fa-arrow-right text-gray-400 group-hover:text-primary-600 group-hover:translate-x-1 transition-all"></i>
            </div>
          </NuxtLink>
        </div>
      </div>

      <!-- Account Settings -->
      <div>
        <h2 class="text-xl font-display font-bold text-gray-900 mb-6">Account Settings</h2>
        <div class="bg-white rounded-2xl border border-gray-200 divide-y divide-gray-200">
          <!-- Profile -->
          <NuxtLink
            to="/account/settings/profile"
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
            to="/account/settings/organization"
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

          <!-- Security -->
          <NuxtLink
            to="/account/settings/security"
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
    </template>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ['auth']
})

useHead({
  title: 'Account - Praxio'
})

const { user, isAccountOwner } = useAuth()

// Computed display name
const displayName = computed(() => {
  if (!user.value) return ''
  return user.value.displayName || user.value.email?.split('@')[0] || 'there'
})

const patientCount = ref(0)
const teamCount = ref(0)
const loading = ref(true)

// Fetch counts
onMounted(async () => {
  try {
    const { $auth } = useNuxtApp()
    const token = await $auth.currentUser?.getIdToken()
    
    if (token) {
      // Fetch patients
      const patientsRes = await $fetch('/api/patients', {
        headers: { Authorization: `Bearer ${token}` }
      })
      patientCount.value = Array.isArray(patientsRes) ? patientsRes.length : 0
      
      // Fetch team (only for account owners)
      try {
        const teamRes = await $fetch('/api/users/team', {
          headers: { Authorization: `Bearer ${token}` }
        })
        teamCount.value = Array.isArray(teamRes) ? teamRes.length : 0
      } catch {
        // Not an owner, skip
      }
    }
  } catch (error) {
    console.error('Error fetching counts:', error)
  } finally {
    loading.value = false
  }
})
</script>
