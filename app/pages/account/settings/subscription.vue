<template>
  <div>
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-display font-bold text-gray-900">Your Plan</h1>
      <p class="mt-2 text-gray-600">View and manage your subscription</p>
    </div>

    <ClientOnly>
      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center py-12">
        <div class="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
      </div>

      <template v-else>
      <!-- Current Plan - only show if has active subscription -->
      <div v-if="hasActiveSubscription && !isTrialOrNone && !isTrialExpired" class="bg-white rounded-xl border border-gray-200 p-6 mb-6">
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
            <p class="text-sm text-gray-500">{{ isTrialExpired ? 'Trial Expired' : (isTrialOrNone ? 'Trial Ends' : 'Next Billing Date') }}</p>
            <p class="text-lg font-bold text-gray-900">{{ nextBillingDateFormatted }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-500">Amount</p>
            <p class="text-lg font-bold text-gray-900">{{ planAmount }}</p>
          </div>
        </div>

        <div class="mt-6 flex flex-wrap items-center justify-between gap-3">
          <!-- Show different buttons based on subscription status -->
          <template v-if="hasActiveSubscription && !isTrialOrNone">
            <!-- Left side: Upgrade button (only if on Monthly) -->
            <div>
              <NuxtLink 
                v-if="isOnMonthly"
                to="/pricing"
                class="px-4 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition inline-flex items-center gap-2"
              >
                <i class="fa-solid fa-arrow-up"></i>
                Upgrade to Annual
              </NuxtLink>
            </div>
            
            <!-- Right side: Cancel button (only if not already canceling) -->
            <div>
              <button 
                v-if="!isCanceling"
                @click="showCancelConfirm = true"
                class="px-4 py-2 text-red-600 font-medium border border-red-200 rounded-lg hover:bg-red-50 transition flex items-center gap-2"
              >
                <i class="fa-regular fa-circle-xmark"></i>
                Cancel Subscription
              </button>
            </div>
          </template>
          <template v-else>
            <NuxtLink 
              to="/pricing"
              class="px-4 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition flex items-center gap-2"
            >
              <i class="fa-solid fa-rocket"></i>
              Choose a Plan
            </NuxtLink>
          </template>
        </div>
        
        <!-- Cancellation Notice -->
        <div v-if="isCanceling" class="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
          <div class="flex items-start justify-between gap-4">
            <div class="flex items-start gap-3">
              <i class="fa-solid fa-triangle-exclamation text-orange-600 mt-0.5"></i>
              <div>
                <p class="font-medium text-orange-800">Your subscription will end on {{ nextBillingDateFormatted }}</p>
                <p class="text-sm text-orange-700 mt-1">You'll continue to have access until then. After that, you'll need to subscribe again to use the service.</p>
              </div>
            </div>
            <button 
              @click="reactivateSubscription"
              :disabled="reactivateLoading"
              class="px-4 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition disabled:opacity-50 flex items-center gap-2 whitespace-nowrap"
            >
              <SpinnerIcon v-if="reactivateLoading" />
              <i v-else class="fa-solid fa-rotate-left"></i>
              Undo Cancellation
            </button>
          </div>
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
            <SpinnerIcon v-if="cancelScheduledLoading" />
            <i v-else class="fa-regular fa-xmark"></i>
            Cancel Change
          </button>
        </div>
      </div>

      <!-- No Subscription / Trial Expired Banner -->
      <div v-if="isTrialOrNone || isTrialExpired" :class="isTrialExpired ? 'bg-gradient-to-r from-red-50 to-orange-50 border-red-200' : 'bg-gradient-to-r from-primary-50 to-blue-50 border-primary-200'" class="rounded-xl border p-6">
        <div class="flex items-start gap-4">
          <div :class="isTrialExpired ? 'bg-red-100' : 'bg-primary-100'" class="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0">
            <i :class="isTrialExpired ? 'fa-solid fa-clock-rotate-left text-red-600' : 'fa-solid fa-wand-magic-sparkles text-primary-600'" class="text-xl"></i>
          </div>
          <div>
            <h3 class="font-bold text-gray-900">{{ trialMessage }}</h3>
            <p class="text-gray-600 mt-1">
              {{ isTrialExpired ? 'Subscribe now to restore access to all features and your data.' : 'Subscribe now to unlock unlimited access to all features and never lose your data.' }}
            </p>
            <NuxtLink 
              to="/pricing"
              class="inline-flex items-center gap-2 mt-3 px-4 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition"
            >
              <i class="fa-solid fa-arrow-right"></i>
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

      <!-- Success Message -->
      <div v-if="successMessage" class="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
        <i class="fa-solid fa-circle-check mr-2"></i>
        {{ successMessage }}
      </div>

      <template #fallback>
        <div class="flex justify-center py-12">
          <div class="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
        </div>
      </template>
    </ClientOnly>

    <!-- Cancel Confirmation Modal -->
    <Teleport to="body">
      <div v-if="showCancelConfirm" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
          <div class="flex items-center gap-3 mb-4">
            <div class="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
              <i class="fa-solid fa-triangle-exclamation text-red-600"></i>
            </div>
            <h3 class="text-lg font-bold text-gray-900">Cancel Subscription?</h3>
          </div>

          <p class="text-gray-600 mb-4">
            Your subscription will remain active until <strong>{{ nextBillingDateFormatted }}</strong>. After that date:
          </p>

          <ul class="space-y-2 mb-6 text-sm text-gray-600">
            <li class="flex items-start gap-2">
              <i class="fa-solid fa-circle-xmark text-red-500 mt-0.5"></i>
              <span>You will lose access to all features</span>
            </li>
            <li class="flex items-start gap-2">
              <i class="fa-solid fa-circle-xmark text-red-500 mt-0.5"></i>
              <span>Your data will be retained for 30 days</span>
            </li>
            <li class="flex items-start gap-2">
              <i class="fa-solid fa-circle-check text-green-500 mt-0.5"></i>
              <span>You can resubscribe anytime to restore access</span>
            </li>
          </ul>

          <div class="flex gap-3">
            <button 
              @click="showCancelConfirm = false"
              class="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition"
            >
              Keep Subscription
            </button>
            <button 
              @click="cancelSubscription"
              :disabled="cancelLoading"
              class="flex-1 px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <SpinnerIcon v-if="cancelLoading" />
              Cancel Subscription
            </button>
          </div>
        </div>
      </div>
    </Teleport>
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
const cancelLoading = ref(false)
const reactivateLoading = ref(false)
const error = ref('')
const successMessage = ref('')
const showCancelConfirm = ref(false)
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
  return subscription.value?.status === 'active' || subscription.value?.status === 'trialing' || subscription.value?.status === 'canceling'
})

const isOnMonthly = computed(() => {
  return subscription.value?.priceId?.includes('price_1SOJ4XP4c4Gc3Rfa')
})

const isCanceling = computed(() => {
  return subscription.value?.status === 'canceling'
})

const isTrialExpired = computed(() => {
  if (!subscription.value?.trialEndDate) return false
  const trialEnd = new Date(subscription.value.trialEndDate)
  return trialEnd < new Date()
})

const isTrialOrNone = computed(() => {
  return !subscription.value?.subscriptionId || subscription.value?.status === 'trialing'
})

const currentPlanName = computed(() => {
  if (!subscription.value?.priceId) {
    if (subscription.value?.trialEndDate) {
      if (isTrialExpired.value) {
        return 'Trial Expired'
      }
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
      if (isTrialExpired.value) {
        return 'Expired'
      }
      return 'Trial'
    }
    return 'No Plan'
  }
  
  const labels: Record<string, string> = {
    active: 'Active',
    trialing: 'Trial',
    past_due: 'Past Due',
    canceled: 'Canceled',
    canceling: 'Canceling',
    pending_cancellation: 'Canceling'
  }
  return labels[status] || status
})

const statusBadgeClass = computed(() => {
  const status = subscription.value?.status
  const base = 'px-3 py-1 text-sm font-medium rounded-full'
  
  if (!status) {
    if (subscription.value?.trialEndDate) {
      if (isTrialExpired.value) {
        return `${base} bg-red-100 text-red-700`
      }
      return `${base} bg-blue-100 text-blue-700`
    }
    return `${base} bg-gray-100 text-gray-700`
  }
  
  const classes: Record<string, string> = {
    active: `${base} bg-green-100 text-green-700`,
    trialing: `${base} bg-blue-100 text-blue-700`,
    past_due: `${base} bg-yellow-100 text-yellow-700`,
    canceled: `${base} bg-red-100 text-red-700`,
    canceling: `${base} bg-orange-100 text-orange-700`,
    pending_cancellation: `${base} bg-orange-100 text-orange-700`
  }
  return classes[status] || `${base} bg-gray-100 text-gray-700`
})

const nextBillingDateFormatted = computed(() => {
  // If trial expired and no subscription, show when it expired
  if (isTrialExpired.value && !subscription.value?.subscriptionId) {
    return formatDate(subscription.value?.trialEndDate || '')
  }
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
    const daysAgo = Math.abs(daysLeft)
    return `Your trial expired ${daysAgo} day${daysAgo === 1 ? '' : 's'} ago`
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

async function cancelSubscription() {
  try {
    cancelLoading.value = true
    error.value = ''
    successMessage.value = ''
    
    const token = await getIdToken()
    const response = await $fetch<{ currentPeriodEnd: string }>('/api/stripe/cancel-subscription', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    })
    
    showCancelConfirm.value = false
    successMessage.value = `Your subscription has been canceled. You'll continue to have access until ${formatDate(response.currentPeriodEnd || subscription.value?.nextBillingDate || '')}.`
    
    await fetchSubscription()
  } catch (err: any) {
    console.error('Failed to cancel subscription:', err)
    error.value = err.data?.message || 'Failed to cancel subscription'
  } finally {
    cancelLoading.value = false
  }
}

async function reactivateSubscription() {
  try {
    reactivateLoading.value = true
    error.value = ''
    successMessage.value = ''
    
    const token = await getIdToken()
    await $fetch('/api/stripe/reactivate-subscription', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    })
    
    successMessage.value = 'Your subscription has been reactivated! You will continue to be billed as normal.'
    
    await fetchSubscription()
  } catch (err: any) {
    console.error('Failed to reactivate subscription:', err)
    error.value = err.data?.message || 'Failed to reactivate subscription'
  } finally {
    reactivateLoading.value = false
  }
}

// Lifecycle
onMounted(() => {
  fetchSubscription()
})
</script>
