<template>
  <div>
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-display font-bold text-gray-900">Your Plan</h1>
      <p class="mt-2 text-gray-600">View and manage your subscription</p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center py-12">
      <i class="fa-solid fa-spinner fa-spin text-2xl text-primary-600"></i>
    </div>

    <template v-else>
      <!-- Current Plan -->
      <div class="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div class="flex items-start justify-between">
          <div>
            <h2 class="text-lg font-bold text-gray-900">Current Plan</h2>
            <p class="text-gray-500">Your subscription details</p>
          </div>
          <span :class="statusBadgeClass">
            {{ statusLabel }}
          </span>
        </div>

        <div class="mt-6 grid md:grid-cols-3 gap-6">
          <div>
            <p class="text-sm text-gray-500">Plan</p>
            <p class="text-lg font-bold text-gray-900">{{ currentPlanName }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-500">{{ isTrialOrNone ? 'Trial Ends' : 'Next Billing Date' }}</p>
            <p class="text-lg font-bold text-gray-900">{{ nextBillingDateFormatted }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-500">Amount</p>
            <p class="text-lg font-bold text-gray-900">{{ planAmount }}</p>
          </div>
        </div>

        <div class="mt-6 flex flex-wrap gap-3">
          <!-- Show different buttons based on subscription status -->
          <template v-if="hasActiveSubscription && !isTrialOrNone">
            <NuxtLink 
              to="/pricing"
              class="px-4 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition flex items-center gap-2"
            >
              <i class="fa-light fa-arrows-rotate"></i>
              Change Plan
            </NuxtLink>
            <button 
              @click="openBillingPortal"
              :disabled="portalLoading"
              class="px-4 py-2 text-gray-700 font-medium border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50 flex items-center gap-2"
            >
              <i v-if="portalLoading" class="fa-solid fa-spinner fa-spin"></i>
              <i v-else class="fa-light fa-gear"></i>
              Manage Subscription
            </button>
          </template>
          <template v-else>
            <NuxtLink 
              to="/pricing"
              class="px-4 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition flex items-center gap-2"
            >
              <i class="fa-light fa-rocket"></i>
              Choose a Plan
            </NuxtLink>
          </template>
        </div>
      </div>

      <!-- Upcoming Plan Change -->
      <div v-if="subscription?.scheduledPriceId" class="bg-white rounded-xl border-2 border-blue-200 p-6 mb-6">
        <div class="flex items-start justify-between">
          <div>
            <h2 class="text-lg font-bold text-gray-900 flex items-center gap-2">
              <i class="fa-regular fa-calendar-clock text-blue-600"></i>
              Upcoming Plan Change
            </h2>
            <p class="text-gray-500">Scheduled change to your subscription</p>
          </div>
          <span class="px-3 py-1 text-sm font-medium rounded-full bg-blue-100 text-blue-700">
            Scheduled
          </span>
        </div>

        <div class="mt-4 p-4 bg-blue-50 rounded-lg">
          <div class="flex items-center gap-3">
            <i class="fa-regular fa-arrow-up text-blue-600 text-xl"></i>
            <div>
              <p class="font-bold text-gray-900">{{ scheduledPlanName }}</p>
              <p class="text-sm text-gray-600">
                Starting <strong>{{ formatDate(subscription.scheduledChangeDate || '') }}</strong>
              </p>
            </div>
          </div>
        </div>

        <div class="mt-4 flex items-center justify-between">
          <p class="text-sm text-gray-500">
            <i class="fa-regular fa-info-circle mr-1"></i>
            You can cancel this change before it takes effect
          </p>
          <button 
            @click="cancelScheduledChange"
            :disabled="cancelScheduledLoading"
            class="px-4 py-2 text-red-600 font-medium border border-red-200 rounded-lg hover:bg-red-50 transition disabled:opacity-50 flex items-center gap-2"
          >
            <i v-if="cancelScheduledLoading" class="fa-solid fa-spinner fa-spin"></i>
            <i v-else class="fa-regular fa-xmark"></i>
            Cancel Change
          </button>
        </div>
      </div>

      <!-- No Subscription Banner -->
      <div v-if="isTrialOrNone" class="bg-gradient-to-r from-primary-50 to-blue-50 rounded-xl border border-primary-200 p-6">
        <div class="flex items-start gap-4">
          <div class="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
            <i class="fa-light fa-sparkles text-primary-600 text-xl"></i>
          </div>
          <div>
            <h3 class="font-bold text-gray-900">{{ trialMessage }}</h3>
            <p class="text-gray-600 mt-1">
              Subscribe now to unlock unlimited access to all features and never lose your data.
            </p>
            <NuxtLink 
              to="/pricing"
              class="inline-flex items-center gap-2 mt-3 px-4 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition"
            >
              <i class="fa-light fa-arrow-right"></i>
              View Pricing Plans
            </NuxtLink>
          </div>
        </div>
      </div>
    </template>

    <!-- Error Message -->
    <div v-if="error" class="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
      <i class="fa-solid fa-circle-exclamation mr-2"></i>
      {{ error }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuth } from '~/composables/useAuth'

definePageMeta({
  middleware: ['auth']
})

const { getIdToken } = useAuth()

// State
const loading = ref(true)
const portalLoading = ref(false)
const error = ref('')
const subscription = ref<{
  customerId: string | null
  subscriptionId: string | null
  status: string | null
  priceId: string | null
  endDate: string | null
  nextBillingDate: string | null
  trialStartDate: string | null
  trialEndDate: string | null
  scheduledPriceId: string | null
  scheduledChangeDate: string | null
} | null>(null)
const cancelScheduledLoading = ref(false)

// Computed
const hasActiveSubscription = computed(() => {
  return subscription.value?.status === 'active' || subscription.value?.status === 'trialing'
})

const isTrialOrNone = computed(() => {
  return !subscription.value?.subscriptionId || subscription.value?.status === 'trialing'
})

const currentPlanName = computed(() => {
  if (!subscription.value?.priceId) {
    if (subscription.value?.trialEndDate) {
      return 'Free Trial'
    }
    return 'No Plan'
  }
  
  // Map price ID to plan name
  if (subscription.value.priceId.includes('price_1SOJ4XP4c4Gc3Rfa')) {
    return 'Monthly Flex'
  }
  if (subscription.value.priceId.includes('price_1SYzfRP4c4Gc3Rfa')) {
    return 'Annual Plan'
  }
  return 'Subscription'
})

const statusLabel = computed(() => {
  const status = subscription.value?.status
  if (!status) {
    if (subscription.value?.trialEndDate) {
      const trialEnd = new Date(subscription.value.trialEndDate)
      const now = new Date()
      if (trialEnd > now) return 'Trial'
    }
    return 'No Plan'
  }
  
  const labels: Record<string, string> = {
    active: 'Active',
    trialing: 'Trial',
    past_due: 'Past Due',
    canceled: 'Canceled',
    pending_cancellation: 'Canceling'
  }
  return labels[status] || status
})

const statusBadgeClass = computed(() => {
  const status = subscription.value?.status
  const base = 'px-3 py-1 text-sm font-medium rounded-full'
  
  if (!status) {
    if (subscription.value?.trialEndDate) {
      return `${base} bg-blue-100 text-blue-700`
    }
    return `${base} bg-gray-100 text-gray-700`
  }
  
  const classes: Record<string, string> = {
    active: `${base} bg-green-100 text-green-700`,
    trialing: `${base} bg-blue-100 text-blue-700`,
    past_due: `${base} bg-yellow-100 text-yellow-700`,
    canceled: `${base} bg-red-100 text-red-700`,
    pending_cancellation: `${base} bg-orange-100 text-orange-700`
  }
  return classes[status] || `${base} bg-gray-100 text-gray-700`
})

const nextBillingDateFormatted = computed(() => {
  if (subscription.value?.nextBillingDate) {
    return formatDate(subscription.value.nextBillingDate)
  }
  if (subscription.value?.trialEndDate) {
    return formatDate(subscription.value.trialEndDate)
  }
  if (subscription.value?.endDate) {
    return formatDate(subscription.value.endDate)
  }
  return '—'
})

const planAmount = computed(() => {
  if (!subscription.value?.priceId) {
    return 'Free'
  }
  if (subscription.value.priceId.includes('price_1SOJ4XP4c4Gc3Rfa')) {
    return '$45 CAD/month'
  }
  if (subscription.value.priceId.includes('price_1SYzfRP4c4Gc3Rfa')) {
    return '$35 CAD/month (Annual)'
  }
  return 'Subscription'
})

const trialMessage = computed(() => {
  if (subscription.value?.trialEndDate) {
    const trialEnd = new Date(subscription.value.trialEndDate)
    const now = new Date()
    const daysLeft = Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    
    if (daysLeft > 0) {
      return `Your trial ends in ${daysLeft} day${daysLeft === 1 ? '' : 's'}`
    }
    return 'Your trial has ended'
  }
  return 'Start your subscription today'
})

const scheduledPlanName = computed(() => {
  if (!subscription.value?.scheduledPriceId) return ''
  if (subscription.value.scheduledPriceId.includes('price_1SYzfRP4c4Gc3Rfa')) {
    return 'Annual Plan ($35 CAD/month)'
  }
  if (subscription.value.scheduledPriceId.includes('price_1SOJ4XP4c4Gc3Rfa')) {
    return 'Monthly Flex ($45 CAD/month)'
  }
  return 'New Plan'
})

// Methods
function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  })
}

async function fetchSubscription() {
  try {
    loading.value = true
    error.value = ''
    
    const token = await getIdToken()
    const response = await $fetch<{ subscription: typeof subscription.value }>('/api/users/current', {
      headers: { Authorization: `Bearer ${token}` }
    })
    
    subscription.value = response.subscription
  } catch (err: any) {
    console.error('Failed to fetch subscription:', err)
    error.value = err.data?.message || 'Failed to load subscription information'
  } finally {
    loading.value = false
  }
}

async function openBillingPortal() {
  try {
    portalLoading.value = true
    error.value = ''
    
    const token = await getIdToken()
    const response = await $fetch<{ url: string }>('/api/stripe/billing-portal', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: {
        returnUrl: window.location.href
      }
    })
    
    window.location.href = response.url
  } catch (err: any) {
    console.error('Failed to open billing portal:', err)
    error.value = err.data?.message || 'Failed to open billing portal'
    portalLoading.value = false
  }
}

async function cancelScheduledChange() {
  try {
    cancelScheduledLoading.value = true
    error.value = ''
    
    const token = await getIdToken()
    await $fetch('/api/stripe/cancel-scheduled-change', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    })
    
    await fetchSubscription()
  } catch (err: any) {
    console.error('Failed to cancel scheduled change:', err)
    error.value = err.data?.message || 'Failed to cancel scheduled change'
  } finally {
    cancelScheduledLoading.value = false
  }
}

// Lifecycle
onMounted(() => {
  fetchSubscription()
})
</script>
