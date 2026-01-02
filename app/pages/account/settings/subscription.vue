<template>
  <div>
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-display font-bold text-gray-900">{{ t('account.settings.subscription.title') }}</h1>
      <p class="mt-2 text-gray-600">{{ t('account.settings.subscription.description') }}</p>
    </div>

    <ClientOnly>
      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center py-12">
        <div class="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
      </div>

      <template v-else>
      <!-- Invited User - Shared Plan Notice -->
      <div v-if="!isAccountOwner" class="mb-6">
        <!-- Access Revoked Warning (when plan expired) -->
        <div v-if="isTrialExpired || (!hasActiveSubscription && !isOnTrial)" class="bg-red-50 border-2 border-red-600 rounded-xl p-6 mb-6">
          <div class="flex items-start gap-4">
            <div class="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center flex-shrink-0">
              <i class="fa-solid fa-ban text-red-600 text-xl"></i>
            </div>
            <div class="flex-1">
              <h3 class="text-lg font-bold text-red-600">{{ t('account.settings.subscription.accessRevoked') }}</h3>
              <p class="text-red-600 mt-2">
                {{ t('account.settings.subscription.accessRevokedDescription') }}
              </p>
              <p class="text-red-600 mt-2 text-sm">
                {{ t('account.settings.subscription.contactOwner') }}
              </p>
            </div>
          </div>
        </div>
        
        <!-- Active Shared Plan Notice -->
        <div v-else class="bg-primary-50 border border-primary-200 rounded-xl p-6">
          <div class="flex items-start gap-4">
            <div class="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
              <i class="fa-solid fa-users text-primary-600 text-xl"></i>
            </div>
            <div class="flex-1">
              <h3 class="text-lg font-bold text-primary-600">{{ t('account.settings.subscription.sharedPlan') }}</h3>
              <p class="text-primary-700 mt-2">
                {{ t('account.settings.subscription.sharedPlanDescription') }}
              </p>
              <div v-if="subscription" class="mt-4 grid md:grid-cols-3 gap-4">
                <div class="bg-white rounded-lg p-3 border border-primary-100">
                  <p class="text-xs text-primary-600 font-medium">{{ t('account.settings.subscription.currentPlan') }}</p>
                  <p class="text-sm font-bold text-gray-900 mt-1">{{ isOnTrial ? t('account.settings.subscription.freeTrial') : currentPlanName }}</p>
                </div>
                <div v-if="!isTrialOrNone" class="bg-white rounded-lg p-3 border border-primary-100">
                  <p class="text-xs text-primary-600 font-medium">{{ t('account.settings.subscription.status') }}</p>
                  <p class="text-sm font-bold text-gray-900 mt-1">{{ statusLabel }}</p>
                </div>
                <div v-if="(isOnTrial && subscription?.trialEndDate) || (nextBillingDateFormatted && subscription?.status !== 'canceling' && !isOnTrial)" class="bg-white rounded-lg p-3 border border-primary-100">
                  <p class="text-xs text-primary-600 font-medium">{{ isOnTrial ? t('account.settings.subscription.trialEnds') : t('account.settings.subscription.renewsOn') }}</p>
                  <p class="text-sm font-bold text-gray-900 mt-1">{{ isOnTrial ? formatDate(subscription.trialEndDate) : nextBillingDateFormatted }}</p>
                </div>
              </div>
              <p class="text-sm text-primary-600 mt-4">
                <i class="fa-regular fa-circle-info mr-1"></i>
                {{ t('account.settings.subscription.ownerOnly') }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Account Owner Content -->
      <template v-if="isAccountOwner">
      <!-- Current Plan - show if has subscription (active, canceling, or trialing) -->
      <div v-if="hasActiveSubscription" class="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div class="flex items-center justify-between mb-6">
          <div>
            <div class="flex items-center gap-3">
              <h2 class="text-lg font-bold text-gray-900">{{ t('account.settings.subscription.currentPlan') }}</h2>
              <span :class="statusBadgeClass" class="md:hidden">
                {{ statusLabel }}
              </span>
            </div>
            <p class="text-gray-500">{{ t('account.settings.subscription.subscriptionDetails') }}</p>
          </div>
          <span :class="statusBadgeClass" class="hidden md:inline-flex">
            {{ statusLabel }}
          </span>
        </div>

        <div class="grid gap-6">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p class="text-sm text-gray-500">{{ t('account.settings.subscription.plan') }}</p>
              <p class="text-lg font-bold text-gray-900">{{ currentPlanName }}</p>
            </div>
            <div v-if="nextBillingDateFormatted">
              <p class="text-sm text-gray-500">{{ isTrialExpired ? t('account.settings.subscription.trialExpired') : (isTrialOrNone ? t('account.settings.subscription.trialEnds') : t('account.settings.subscription.nextBillingDate')) }}</p>
              <p class="text-lg font-bold text-gray-900 whitespace-nowrap">{{ nextBillingDateFormatted }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-500">{{ t('account.settings.subscription.amount') }}</p>
              <p class="text-lg font-bold text-gray-900">{{ planAmount }}</p>
            </div>
          </div>
        </div>

        <div class="mt-6 flex flex-wrap items-center justify-between gap-3">
          <!-- Show different buttons based on subscription status -->
          <template v-if="!isTrialOrNone && !isTrialExpired">
            <!-- Left side: Upgrade button (only if on Monthly and not scheduled for annual) -->
            <div>
              <NuxtLink 
                v-if="isOnMonthly && !isScheduledAnnual"
                to="/pricing"
                class="px-4 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition inline-flex items-center gap-2"
              >
                <i class="fa-solid fa-arrow-up"></i>
                {{ t('account.settings.subscription.upgradeToAnnual') }}
              </NuxtLink>
            </div>
            
            <!-- Right side: Cancel button (only if not already canceling and not scheduled for annual) -->
            <div>
              <button 
                v-if="!isCanceling && !isScheduledAnnual"
                @click="showCancelConfirm = true"
                class="px-4 py-2 text-red-600 font-medium border border-red-600 rounded-lg hover:bg-red-50 transition flex items-center gap-2"
              >
                <i class="fa-regular fa-circle-xmark"></i>
                {{ t('account.settings.subscription.cancelSubscription') }}
              </button>
            </div>
          </template>
          <template v-if="isTrialOrNone || isTrialExpired">
            <NuxtLink 
              to="/pricing"
              class="px-4 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition flex items-center gap-2"
            >
              <i class="fa-solid fa-rocket"></i>
              {{ t('account.settings.subscription.choosePlan') }}
            </NuxtLink>
          </template>
        </div>
        
        <!-- Cancellation Notice -->
        <div v-if="isCanceling" class="mt-4 p-4 bg-red-50 border border-red-600 rounded-lg">
          <div class="flex flex-col gap-4">
            <div class="flex items-start gap-3">
              <i class="fa-solid fa-triangle-exclamation text-red-600 mt-0.5"></i>
              <div>
                <p class="font-medium text-red-600">{{ t('account.settings.subscription.subscriptionEndDate', { date: nextBillingDateFormatted }) }}</p>
                <p class="text-sm text-red-600 mt-1">{{ t('account.settings.subscription.continueAccess') }}</p>
              </div>
            </div>
            <button 
              @click="reactivateSubscription"
              :disabled="reactivateLoading"
              class="px-4 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition disabled:opacity-50 flex items-center gap-2 justify-center sm:self-start"
            >
              <SpinnerIcon v-if="reactivateLoading" />
              <i v-else class="fa-solid fa-rotate-left"></i>
              {{ t('account.settings.subscription.reactivate') }}
            </button>
          </div>
        </div>
      </div>

      <!-- Upcoming Plan Change -->
      <div v-if="subscription?.scheduledPriceId" class="bg-white rounded-xl border-2 border-blue-600 p-6 mb-6">
        <div class="flex items-start justify-between">
          <div>
            <h2 class="text-lg font-bold text-gray-900 flex items-center gap-2">
              <i class="fa-regular fa-calendar-clock text-blue-600"></i>
              {{ t('account.settings.subscription.upcomingPlanChange') }}
            </h2>
            <p class="text-gray-500">{{ t('account.settings.subscription.scheduledChangeDesc') }}</p>
          </div>
          <span class="px-3 py-1 text-sm font-medium rounded-full bg-blue-50 text-blue-600">
            {{ t('account.settings.subscription.scheduled') }}
          </span>
        </div>

        <div class="mt-4 p-4 bg-blue-50 rounded-lg">
          <div class="flex items-center gap-3">
            <i class="fa-regular fa-arrow-up text-blue-600 text-xl"></i>
            <div>
              <p class="font-bold text-gray-900">{{ scheduledPlanName }}</p>
              <p class="text-sm text-gray-600">
                {{ t('account.settings.subscription.starting') }} <strong>{{ formatDate(subscription.scheduledChangeDate || '') }}</strong>
              </p>
            </div>
          </div>
        </div>

        <div class="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p class="text-sm text-gray-500">
            <i class="fa-regular fa-info-circle mr-1"></i>
            {{ t('account.settings.subscription.cancelChangeInfo') }}
          </p>
          <button 
            @click="cancelScheduledChange"
            :disabled="cancelScheduledLoading"
            class="px-4 py-2 text-red-600 font-medium border border-red-600 rounded-lg hover:bg-red-50 transition disabled:opacity-50 flex items-center gap-2 justify-center sm:justify-start"
          >
            <SpinnerIcon v-if="cancelScheduledLoading" />
            <i v-else class="fa-regular fa-xmark"></i>
            {{ t('account.settings.subscription.cancelChange') }}
          </button>
        </div>
      </div>

      <!-- No Subscription / Trial Banner - only show if no active subscription -->
      <div v-if="!hasActiveSubscription && (isTrialOrNone || isTrialExpired)" :class="isTrialExpired ? 'bg-gradient-to-r from-red-50 to-red-50 border-red-600' : 'bg-gradient-to-r from-primary-50 to-blue-50 border-primary-200'" class="rounded-xl border p-6">
        <div class="flex items-start gap-4">
          <div :class="isTrialExpired ? 'bg-red-50' : 'bg-primary-100'" class="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0">
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
    </template>      </template>
      <!-- Error Message -->
      <div v-if="error" class="mt-4 p-4 bg-red-50 border border-red-600 rounded-lg text-red-600">
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
            <div class="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
              <i class="fa-solid fa-triangle-exclamation text-red-600"></i>
            </div>
            <h3 class="text-lg font-bold text-gray-900">Cancel Subscription?</h3>
          </div>

          <p class="text-gray-600 mb-4">
            Your subscription will remain active until <strong>{{ nextBillingDateFormatted }}</strong>. After that date:
          </p>

          <ul class="space-y-2 mb-6 text-sm text-gray-600">
            <li class="flex items-start gap-2">
              <i class="fa-solid fa-circle-xmark text-red-600 mt-0.5"></i>
              <span>You will lose access to all features</span>
            </li>
            <li class="flex items-start gap-2">
              <i class="fa-solid fa-circle-xmark text-red-600 mt-0.5"></i>
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
              class="flex-1 px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-600 transition disabled:opacity-50 flex items-center justify-center gap-2"
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

const { t } = useI18n()
const { getIdToken, user, isAccountOwner } = useAuth()
const organizationName = ref('')

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
  // Don't show cancellation notice if there's a scheduled plan change
  // because the scheduled change means they're not really canceling - they're upgrading
  if (subscription.value?.scheduledPriceId) return false
  return subscription.value?.status === 'canceling'
})

const isTrialExpired = computed(() => {
  if (!subscription.value?.trialEndDate) return false
  const trialEnd = new Date(subscription.value.trialEndDate)
  return trialEnd < new Date()
})

const isTrialOrNone = computed(() => {
  return !subscription.value?.subscriptionId || subscription.value?.status === 'trialing' || subscription.value?.status === 'incomplete'
})

const isOnTrial = computed(() => {
  if (!subscription.value?.trialEndDate) return false
  const trialEnd = new Date(subscription.value.trialEndDate)
  // User is on trial if trial hasn't expired and either has no subscription ID or has incomplete status
  return trialEnd >= new Date() && (!subscription.value?.subscriptionId || subscription.value?.status === 'incomplete')
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
        return `${base} bg-red-50 text-red-600`
      }
      return `${base} bg-blue-50 text-blue-600`
    }
    return `${base} bg-gray-100 text-gray-700`
  }
  
  const classes: Record<string, string> = {
    active: `${base} bg-green-100 text-green-700`,
    trialing: `${base} bg-blue-50 text-blue-600`,
    past_due: `${base} bg-yellow-100 text-yellow-700`,
    canceled: `${base} bg-red-50 text-red-600`,
    canceling: `${base} bg-red-50 text-red-600`,
    pending_cancellation: `${base} bg-red-50 text-red-600`
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

const isScheduledAnnual = computed(() => {
  return subscription.value?.scheduledPriceId?.includes('price_1SYzfRP4c4Gc3Rfa') || false
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
    const response = await $fetch<{ subscription: typeof subscription.value, organization?: { name?: string } }>('/api/users/current', {
      headers: { Authorization: `Bearer ${token}` }
    })
    
    subscription.value = response.subscription
    
    // Get organization name for invited users
    if (response.organization?.name) {
      organizationName.value = response.organization.name
    }
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
