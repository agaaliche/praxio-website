<template>
  <div>
    <!-- Welcome Section -->
    <div class="mb-8">
      <h1 class="text-3xl font-display font-bold text-gray-900">
        Welcome back, {{ displayName }}!
      </h1>
      <p v-if="organizationName" class="mt-1 text-lg text-primary-600 font-medium">
        {{ organizationName }}
      </p>
      <p class="mt-2 text-gray-600">
        Manage your Praxio account and access your products.
      </p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12">
      <div class="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto"></div>
      <p class="mt-2 text-gray-500">Loading dashboard...</p>
    </div>

    <template v-else>
      <!-- Quick Stats -->
      <div class="grid md:grid-cols-3 gap-6 mb-8">
        <div class="bg-white rounded-xl p-6 border border-gray-200">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
              <i class="fa-duotone fa-users-medical text-primary-600 text-2xl"></i>
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
              <i class="fa-duotone fa-user-doctor text-secondary-600 text-2xl"></i>
            </div>
            <div>
              <p class="text-2xl font-bold text-gray-900">{{ teamCount }}</p>
              <p class="text-sm text-gray-500">Team Members</p>
            </div>
          </div>
        </div>

        <div v-if="isAccountOwner" class="bg-white rounded-xl p-6 border border-gray-200">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <i class="fa-duotone fa-check-circle text-green-600 text-2xl"></i>
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
              <i class="fa-kit-duotone fa-logo text-primary-600 text-4xl"></i>
              <div class="flex items-center gap-2">
                <span v-if="subscriptionLabel" :class="subscriptionBadgeClass">
                  {{ subscriptionLabel }}
                </span>
                <span v-if="daysLeft !== null" class="flex items-center gap-1 text-xs text-gray-500">
                  <i class="fa-regular fa-stopwatch"></i>
                  {{ daysLeft }}d
                </span>
              </div>
            </div>
            <p class="mt-2 text-sm text-gray-600">
              INR management for anticoagulant therapy. Track results, generate prescriptions, manage patients.
            </p>
            <div class="mt-4 flex items-center text-primary-600 text-sm font-medium">
              Open Retroact
              <i class="fa-solid fa-arrow-right ml-2 group-hover:translate-x-1 transition-transform"></i>
            </div>
          </a>

          <!-- More Products Coming Soon -->
          <div v-if="isAccountOwner" class="bg-white rounded-2xl p-6 border border-dashed border-gray-300">
            <div class="flex items-start justify-between mb-4">
              <h3 class="text-lg font-display font-bold text-gray-400">
                More Products
              </h3>
              <span class="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                Coming Soon
              </span>
            </div>
            <p class="mt-2 text-sm text-gray-400">
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
                <i class="fa-light fa-user text-primary-600 text-lg"></i>
              </div>
              <div>
                <h3 class="font-medium text-gray-900">Profile</h3>
                <p class="text-sm text-gray-500">Update your personal information</p>
              </div>
            </div>
            <i class="fa-solid fa-chevron-right text-gray-400"></i>
          </NuxtLink>

          <!-- Organization -->
          <NuxtLink
            to="/account/settings/organization"
            class="flex items-center justify-between p-6 hover:bg-gray-50 transition"
          >
            <div class="flex items-center gap-4">
              <div class="w-10 h-10 bg-secondary-100 rounded-xl flex items-center justify-center">
                <i class="fa-light fa-building text-secondary-600 text-lg"></i>
              </div>
              <div>
                <h3 class="font-medium text-gray-900">Organization</h3>
                <p class="text-sm text-gray-500">{{ organizationName || 'Set up your practice details' }}</p>
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
                <i class="fa-light fa-shield text-amber-600 text-lg"></i>
              </div>
              <div>
                <h3 class="font-medium text-gray-900">Security</h3>
                <p class="text-sm text-gray-500">Password and authentication settings</p>
              </div>
            </div>
            <i class="fa-solid fa-chevron-right text-gray-400"></i>
          </NuxtLink>

          <!-- Your Plan -->
          <NuxtLink
            to="/account/settings/subscription"
            class="flex items-center justify-between p-6 hover:bg-gray-50 transition"
          >
            <div class="flex items-center gap-4">
              <div class="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                <i class="fa-light fa-box-heart text-purple-600 text-lg"></i>
              </div>
              <div>
                <h3 class="font-medium text-gray-900">Your Plan</h3>
                <p class="text-sm text-gray-500">{{ isAccountOwner ? 'Manage your subscription' : 'View organization plan' }}</p>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <i v-if="isTrialExpired" class="fa-solid fa-triangle-exclamation text-red-600"></i>
              <i class="fa-solid fa-chevron-right text-gray-400"></i>
            </div>
          </NuxtLink>

          <!-- Billing (Account Owner Only) -->
          <NuxtLink
            v-if="isAccountOwner"
            to="/account/settings/billing"
            class="flex items-center justify-between p-6 hover:bg-gray-50 transition"
          >
            <div class="flex items-center gap-4">
              <div class="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                <i class="fa-light fa-credit-card text-green-600 text-lg"></i>
              </div>
              <div>
                <h3 class="font-medium text-gray-900">Billing</h3>
                <p class="text-sm text-gray-500">Payment methods and invoices</p>
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
const { subscription, isTrialExpired } = useSubscription()

// Computed display name
const displayName = computed(() => {
  if (!user.value) return ''
  return user.value.displayName || user.value.email?.split('@')[0] || 'there'
})

const patientCount = ref(0)
const teamCount = ref(0)
const organizationName = ref('')
const loading = ref(true)

// Subscription label and badge
const subscriptionLabel = computed(() => {
  if (!subscription.value) return null
  
  // Check if user has a trial (trial dates exist but no Stripe subscription)
  const hasTrial = subscription.value.trialEndDate && !subscription.value.subscriptionId
  
  if (hasTrial) {
    return 'Free Trial'
  }
  
  // Stripe subscription status
  const status = subscription.value.status
  const priceId = subscription.value.priceId || ''
  
  if (status === 'trialing' || status === 'trial') return 'Free Trial'
  if (status === 'active') {
    // Check price ID to determine plan type
    if (priceId.includes('price_1SYzfRP4c4Gc3Rfa')) return 'Annual Plan'
    if (priceId.includes('price_1SOJ4XP4c4Gc3Rfa')) return 'Monthly Flex'
    return 'Active'
  }
  if (status === 'canceled' || status === 'cancel_at_period_end') return 'Canceling'
  
  return null
})

const subscriptionBadgeClass = computed(() => {
  const label = subscriptionLabel.value
  if (label === 'Annual Plan') return 'text-xs font-medium text-white bg-primary-600 px-2 py-1 rounded-full'
  if (label === 'Monthly Flex') return 'text-xs font-medium text-white bg-secondary-600 px-2 py-1 rounded-full'
  if (label === 'Canceling') return 'text-xs font-medium text-white bg-red-600 px-2 py-1 rounded-full'
  return 'text-xs font-medium text-white bg-amber-500 px-2 py-1 rounded-full' // Free Trial
})

// Days left (for trial or canceling subscriptions)
const daysLeft = computed(() => {
  if (!subscription.value) return null
  
  // Check user's trial end date (for non-Stripe trials)
  const trialEnd = subscription.value.trialEndDate
  if (trialEnd && !subscription.value.subscriptionId) {
    const endDate = new Date(trialEnd)
    const now = new Date()
    const diffTime = endDate.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays > 0 ? diffDays : 0
  }
  
  // Check Stripe subscription status
  const status = subscription.value.status
  if (status === 'trialing' || status === 'trial' || status === 'cancel_at_period_end') {
    const endDate = subscription.value.endDate || subscription.value.nextBillingDate
    if (endDate) {
      const end = new Date(endDate)
      const now = new Date()
      const diffTime = end.getTime() - now.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      return diffDays > 0 ? diffDays : 0
    }
  }
  return null
})

// Fetch counts
onMounted(async () => {
  try {
    const { $auth } = useNuxtApp()
    const token = await $auth.currentUser?.getIdToken()
    
    if (token) {
      // Fetch current user data (includes organization)
      try {
        const userData = await $fetch('/api/users/current', {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (userData.organization?.name) {
          organizationName.value = userData.organization.name
        }
      } catch (err) {
        console.error('Error fetching user data:', err)
      }
      
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
