<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
    <div class="max-w-lg w-full">
      <!-- Card -->
      <div class="bg-white rounded-2xl shadow-xl p-8 text-center">
        <!-- Icon -->
        <div class="w-20 h-20 bg-gradient-to-br from-red-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <i class="fa-regular fa-clock text-4xl text-red-500"></i>
        </div>

        <!-- Title -->
        <h1 class="text-2xl font-display font-bold text-gray-900 mb-2">
          Your Trial Has Expired
        </h1>

        <!-- Message -->
        <p class="text-gray-600 mb-6">
          Your 14-day free trial ended 
          <span class="font-semibold text-gray-900">{{ trialDaysExpired }} day{{ trialDaysExpired === 1 ? '' : 's' }} ago</span>.
          Subscribe now to restore access to all your patients and data.
        </p>

        <!-- Benefits reminder -->
        <div class="bg-gray-50 rounded-xl p-4 mb-6 text-left">
          <p class="font-medium text-gray-900 mb-3">
            <i class="fa-solid fa-shield-halved text-green-500 mr-2"></i>
            Your data is safe
          </p>
          <ul class="space-y-2 text-sm text-gray-600">
            <li class="flex items-center gap-2">
              <i class="fa-solid fa-check text-green-500"></i>
              All patient records preserved
            </li>
            <li class="flex items-center gap-2">
              <i class="fa-solid fa-check text-green-500"></i>
              INR history maintained
            </li>
            <li class="flex items-center gap-2">
              <i class="fa-solid fa-check text-green-500"></i>
              Instant access upon subscription
            </li>
          </ul>
        </div>

        <!-- CTA Buttons -->
        <div class="space-y-3">
          <NuxtLink 
            to="/pricing" 
            class="block w-full bg-primary-600 text-white font-semibold py-3 px-6 rounded-xl hover:bg-primary-700 transition"
          >
            <i class="fa-solid fa-rocket mr-2"></i>
            View Pricing Plans
          </NuxtLink>
          
          <NuxtLink 
            to="/account/settings/subscription"
            class="block w-full bg-gray-100 text-gray-700 font-medium py-3 px-6 rounded-xl hover:bg-gray-200 transition"
          >
            <i class="fa-regular fa-credit-card mr-2"></i>
            Manage Subscription
          </NuxtLink>
        </div>

        <!-- Sign out link -->
        <div class="mt-6 pt-6 border-t border-gray-100">
          <button 
            @click="handleSignOut"
            class="text-gray-500 hover:text-gray-700 text-sm transition"
          >
            <i class="fa-solid fa-arrow-right-from-bracket mr-1"></i>
            Sign out and use a different account
          </button>
        </div>
      </div>

      <!-- Contact support -->
      <p class="text-center text-gray-500 text-sm mt-6">
        Need help? 
        <NuxtLink to="/contact" class="text-primary-600 hover:text-primary-700 font-medium">
          Contact support
        </NuxtLink>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ['auth'],
  layout: false
})

const { signOutUser } = useAuth()
const { trialDaysExpired, fetchSubscription, hasAccess } = useSubscription()
const router = useRouter()

// Fetch subscription on mount
onMounted(async () => {
  await fetchSubscription()
  
  // If user actually has access, redirect them to account
  if (hasAccess.value) {
    router.replace('/account')
  }
})

async function handleSignOut() {
  await signOutUser()
  router.push('/')
}
</script>
