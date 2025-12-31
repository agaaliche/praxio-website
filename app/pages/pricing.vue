<template>
  <div>
    <!-- Breadcrumbs (Mobile Only) -->
    <nav class="pt-4 mb-4 md:hidden px-4 sm:px-6 lg:px-8">
      <ol class="flex items-center gap-2 text-sm text-primary-600">
        <li>
          <NuxtLink to="/" class="hover:text-primary-700 transition">Home</NuxtLink>
        </li>
        <li class="text-primary-400">
          <i class="fa-solid fa-chevron-right text-xs"></i>
        </li>
        <li class="font-medium">
          Pricing
        </li>
      </ol>
    </nav>
    
    <!-- Hero -->
    <section class="bg-gradient-to-br from-primary-50 to-white pt-8 pb-4">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 class="font-display text-4xl md:text-5xl font-bold text-gray-900 mb-2">One Price. Everything Included.</h1>
        <p class="text-xl text-gray-600 max-w-2xl mx-auto">
          Start your 14-day free trial today.
        </p>
      </div>
    </section>

    <!-- Current Plan Banner (if logged in with trial or paid subscription) -->
    <section v-if="currentSubscription && (isOnTrial || isOnMonthly || isOnAnnual)" class="py-4">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="bg-primary-50 border border-primary-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div class="flex items-center gap-3">
            <i class="fa-regular fa-circle-check text-primary-600 text-xl shrink-0"></i>
            <div>
              <p class="font-medium text-gray-900 text-sm sm:text-base">
                You're currently on the <strong>{{ currentPlanName }}</strong> plan
              </p>
              <p v-if="currentSubscription.nextBillingDate && (isOnTrial || currentSubscription.status === 'active')" class="text-xs sm:text-sm text-gray-600">
                {{ isOnTrial ? 'Trial ends' : 'Next billing' }}: {{ formatDate(currentSubscription.nextBillingDate) }}
              </p>
            </div>
          </div>
          <NuxtLink 
            to="/account/settings/billing"
            class="text-primary-600 hover:text-primary-700 font-medium text-sm flex items-center gap-1 ml-8 sm:ml-0"
          >
            <i class="fa-regular fa-gear"></i>
            Manage
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- Pricing Cards -->
    <section class="pt-14 pb-10">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <ClientOnly>
        <div class="grid md:grid-cols-3 gap-8">
          
          <!-- Free Trial -->
          <div :class="[
            'rounded-2xl shadow-lg p-8 relative flex flex-col',
            isTrialDisabled ? 'bg-gray-50 border-2 border-gray-200 opacity-75' : 'bg-white border-2 border-green-500'
          ]">
            <div class="absolute -top-[14px] left-1/2 transform -translate-x-1/2">
              <span :class="[
                'px-4 py-1 rounded-full text-sm font-medium',
                isTrialDisabled ? 'bg-gray-400 text-white' : 'bg-green-500 text-white'
              ]">
                <i class="fa-regular fa-gift mr-1"></i> Free
              </span>
            </div>
            <h3 class="font-display text-2xl font-bold text-gray-900 mb-2 mt-2">Free Trial</h3>
            <p class="text-gray-600 mb-6">No credit card required</p>
            <div class="mb-6">
              <span class="text-4xl font-bold text-green-600">FREE</span>
              <div class="text-gray-500 text-sm mt-1">
                <i class="fa-regular fa-clock mr-1"></i> 
                <template v-if="isOnTrial">
                  {{ trialDaysLeft }} day{{ trialDaysLeft === 1 ? '' : 's' }} left (ends {{ trialEndFormatted }})
                </template>
                <template v-else>
                  14 days full access
                </template>
              </div>
            </div>
            <ul class="space-y-4 mb-8">
              <li class="flex items-center">
                <i class="fa-regular fa-circle-check text-green-500 mr-3"></i>
                <span class="text-gray-600">Full access for 14 days</span>
              </li>
              <li class="flex items-center">
                <i class="fa-regular fa-circle-check text-green-500 mr-3"></i>
                <span class="text-gray-600">Unlimited patients</span>
              </li>
              <li class="flex items-center">
                <i class="fa-regular fa-circle-check text-green-500 mr-3"></i>
                <span class="text-gray-600">All features included</span>
              </li>
              <li class="flex items-center">
                <i class="fa-regular fa-circle-check text-green-500 mr-3"></i>
                <span class="text-gray-600">No credit card required</span>
              </li>
              <li class="flex items-center">
                <i class="fa-regular fa-circle-check text-green-500 mr-3"></i>
                <span class="text-gray-600">Upgrade anytime</span>
              </li>
            </ul>
            <div class="mt-auto">
            <button 
              v-if="isTrialDisabled"
              disabled
              class="w-full text-center bg-gray-300 text-gray-500 px-6 py-3 rounded-lg font-semibold cursor-not-allowed flex items-center justify-center gap-2"
            >
              <i class="fa-regular fa-circle-check"></i>
              {{ isOnTrial ? 'Current Plan' : (isTrialExpired ? 'Trial Expired' : 'Not Available') }}
            </button>
            <button 
              v-else
              @click="startTrial"
              :disabled="trialLoading"
              class="w-full text-center bg-green-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-600 transition disabled:opacity-50 flex items-center justify-center"
            >
              <SpinnerIcon v-if="trialLoading" class="mr-2" />
              <i v-else class="fa-regular fa-play mr-2"></i>
              {{ trialLoading ? 'Starting...' : 'Start Free Trial' }}
            </button>
            </div>
          </div>

          <!-- Monthly Flex -->
          <div :class="[
            'rounded-2xl shadow-lg p-8 relative flex flex-col',
            isMonthlyDisabled ? 'bg-gray-50 border border-gray-200 opacity-75' : 'bg-white border border-gray-200'
          ]">
            <!-- Current Plan Badge -->
            <div v-if="isOnMonthly" class="absolute -top-[14px] left-1/2 transform -translate-x-1/2">
              <span class="bg-primary-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                <i class="fa-regular fa-circle-check mr-1"></i> Current Plan
              </span>
            </div>
            <h3 class="font-display text-2xl font-bold text-gray-900 mb-2" :class="{ 'mt-2': isOnMonthly }">Monthly Flex</h3>
            <p class="text-gray-600 mb-6">No commitment</p>
            <div class="mb-6">
              <span class="text-4xl font-bold text-gray-900">$45</span>
              <span class="text-gray-600">/month</span>
              <div class="text-gray-500 text-sm mt-1">CAD · Cancel anytime</div>
            </div>
            <ul class="space-y-4 mb-8">
              <li class="flex items-center">
                <i class="fa-regular fa-circle-check text-primary-500 mr-3"></i>
                <span class="text-gray-600">Unlimited patients</span>
              </li>
              <li class="flex items-center">
                <i class="fa-regular fa-circle-check text-primary-500 mr-3"></i>
                <span class="text-gray-600">All features included</span>
              </li>
              <li class="flex items-center">
                <i class="fa-regular fa-circle-check text-primary-500 mr-3"></i>
                <span class="text-gray-600">Email & chat support</span>
              </li>
              <li class="flex items-center">
                <i class="fa-regular fa-circle-check text-primary-500 mr-3"></i>
                <span class="text-gray-600">Cancel anytime</span>
              </li>
            </ul>
            <div class="mt-auto">
            <NuxtLink 
              v-if="isMonthlyDisabled"
              to="/account/settings/subscription"
              class="w-full text-center bg-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-400 transition flex items-center justify-center gap-2"
            >
              <i class="fa-regular fa-circle-check"></i>
              Current Plan
            </NuxtLink>
            <button 
              v-else
              @click="handleSubscribe('monthly_flex')"
              :disabled="checkoutLoading !== null"
              class="w-full text-center bg-white text-gray-700 border border-gray-300 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <SpinnerIcon v-if="checkoutLoading === 'monthly_flex'" />
              Get Started
            </button>
            </div>
          </div>

          <!-- Annual Plan - Best Value -->
          <div :class="[
            'rounded-2xl shadow-xl p-8 relative transform md:scale-105 flex flex-col',
            isOnAnnual ? 'bg-gray-100 border-2 border-gray-300' : 'bg-primary-600'
          ]">
            <div class="absolute -top-[14px] left-1/2 transform -translate-x-1/2">
              <span v-if="isOnAnnual" class="bg-primary-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                <i class="fa-regular fa-circle-check mr-1"></i> Current Plan
              </span>
              <span v-else class="bg-secondary-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                <i class="fa-solid fa-star mr-1"></i> Best Value
              </span>
            </div>
            <h3 :class="['font-display text-2xl font-bold mb-2 mt-2', isOnAnnual ? 'text-gray-900' : 'text-white']">Annual Plan</h3>
            <p :class="['mb-6', isOnAnnual ? 'text-gray-600' : 'text-primary-100']">12-month commitment</p>
            <div class="mb-6">
              <span :class="['text-4xl font-bold', isOnAnnual ? 'text-gray-900' : 'text-white']">$35</span>
              <span :class="isOnAnnual ? 'text-gray-600' : 'text-primary-100'">/month</span>
              <div :class="['text-sm mt-1 font-medium', isOnAnnual ? 'text-green-600' : 'text-green-300']">
                <i class="fa-regular fa-piggy-bank mr-1"></i> Save $120/year (22% off)
              </div>
            </div>
            <ul class="space-y-4 mb-8">
              <li class="flex items-center">
                <i :class="['fa-regular fa-circle-check mr-3', isOnAnnual ? 'text-primary-500' : 'text-secondary-400']"></i>
                <span :class="isOnAnnual ? 'text-gray-600' : 'text-white'">Everything in Monthly Flex</span>
              </li>
              <li class="flex items-center">
                <i :class="['fa-regular fa-circle-check mr-3', isOnAnnual ? 'text-primary-500' : 'text-secondary-400']"></i>
                <span :class="isOnAnnual ? 'text-gray-600' : 'text-white'">Priority support</span>
              </li>
              <li class="flex items-center">
                <i :class="['fa-regular fa-circle-check mr-3', isOnAnnual ? 'text-primary-500' : 'text-secondary-400']"></i>
                <span :class="isOnAnnual ? 'text-gray-600' : 'text-white'">Best value – Save $10/month</span>
              </li>
              <li class="flex items-center">
                <i :class="['fa-regular fa-circle-check mr-3', isOnAnnual ? 'text-primary-500' : 'text-secondary-400']"></i>
                <span :class="isOnAnnual ? 'text-gray-600' : 'text-white'">Locked-in pricing</span>
              </li>
            </ul>
            
            <div class="mt-auto">
            <!-- Already on annual -->
            <NuxtLink 
              v-if="isOnAnnual"
              to="/account/settings/subscription"
              class="w-full text-center bg-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-400 transition flex items-center justify-center gap-2"
            >
              <i class="fa-regular fa-circle-check"></i>
              Current Plan
            </NuxtLink>
            
            <!-- Upgrade from monthly to annual -->
            <button 
              v-else-if="isOnMonthly"
              @click="showUpgradeConfirm = true"
              :disabled="checkoutLoading !== null || isScheduledAnnual"
              class="w-full text-center bg-white text-primary-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <SpinnerIcon v-if="checkoutLoading === 'annual'" />
              <template v-else-if="isScheduledAnnual">
                <i class="fa-regular fa-calendar-check"></i>
                Upgrade Scheduled
              </template>
              <template v-else>
                <i class="fa-regular fa-arrow-up"></i>
                Upgrade to Annual
              </template>
            </button>
            
            <!-- New subscription -->
            <button 
              v-else
              @click="handleSubscribe('annual')"
              :disabled="checkoutLoading !== null"
              class="w-full text-center bg-white text-primary-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <SpinnerIcon v-if="checkoutLoading === 'annual'" />
              <i v-else class="fa-regular fa-rocket"></i>
              Get Started
            </button>
            </div>
          </div>
        </div>

        <template #fallback>
          <div class="grid md:grid-cols-3 gap-8">
            <div class="rounded-2xl shadow-lg p-8 bg-white border-2 border-gray-200 animate-pulse">
              <div class="h-8 bg-gray-200 rounded w-2/3 mb-4"></div>
              <div class="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
              <div class="h-12 bg-gray-200 rounded w-1/3 mb-6"></div>
              <div class="space-y-4">
                <div class="h-4 bg-gray-200 rounded"></div>
                <div class="h-4 bg-gray-200 rounded"></div>
                <div class="h-4 bg-gray-200 rounded"></div>
              </div>
            </div>
            <div class="rounded-2xl shadow-lg p-8 bg-white border border-gray-200 animate-pulse">
              <div class="h-8 bg-gray-200 rounded w-2/3 mb-4"></div>
              <div class="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
              <div class="h-12 bg-gray-200 rounded w-1/3 mb-6"></div>
              <div class="space-y-4">
                <div class="h-4 bg-gray-200 rounded"></div>
                <div class="h-4 bg-gray-200 rounded"></div>
                <div class="h-4 bg-gray-200 rounded"></div>
              </div>
            </div>
            <div class="rounded-2xl shadow-xl p-8 bg-primary-600 animate-pulse md:scale-105">
              <div class="h-8 bg-primary-400 rounded w-2/3 mb-4"></div>
              <div class="h-4 bg-primary-400 rounded w-1/2 mb-6"></div>
              <div class="h-12 bg-primary-400 rounded w-1/3 mb-6"></div>
              <div class="space-y-4">
                <div class="h-4 bg-primary-400 rounded"></div>
                <div class="h-4 bg-primary-400 rounded"></div>
                <div class="h-4 bg-primary-400 rounded"></div>
              </div>
            </div>
          </div>
        </template>
        </ClientOnly>

        <!-- Error Message -->
        <div v-if="error" class="mt-8 max-w-lg mx-auto p-4 bg-red-50 border border-red-600 rounded-lg text-red-600 text-center">
          <i class="fa-solid fa-circle-exclamation mr-2"></i>
          {{ error }}
        </div>

        <!-- Success Message -->
        <div v-if="successMessage" class="mt-8 max-w-lg mx-auto p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-center">
          <i class="fa-regular fa-circle-check mr-2"></i>
          {{ successMessage }}
        </div>

        <!-- FAQ Section -->
        <div class="mt-20">
          <h2 class="font-display text-3xl font-bold text-gray-900 text-center mb-10">Frequently Asked Questions</h2>
          
          <div class="max-w-3xl mx-auto space-y-4">
            <div class="bg-white rounded-xl shadow border border-gray-100 p-6">
              <h4 class="font-semibold text-gray-900 mb-2">Can I cancel anytime?</h4>
              <p class="text-gray-600">Yes! The monthly plan has no commitment and can be canceled anytime. The yearly plan requires a 12-month commitment but offers significant savings.</p>
            </div>
            
            <div class="bg-white rounded-xl shadow border border-gray-100 p-6">
              <h4 class="font-semibold text-gray-900 mb-2">What happens after the trial?</h4>
              <p class="text-gray-600">After your 14-day free trial, you'll need to choose a plan to continue. You'll receive a reminder email before your trial ends.</p>
            </div>
            
            <div class="bg-white rounded-xl shadow border border-gray-100 p-6">
              <h4 class="font-semibold text-gray-900 mb-2">Can I switch plans later?</h4>
              <p class="text-gray-600">Yes! You can upgrade from monthly to annual at any time. The annual plan will start at the end of your current billing cycle.</p>
            </div>
            
            <div class="bg-white rounded-xl shadow border border-gray-100 p-6">
              <h4 class="font-semibold text-gray-900 mb-2">Is there a patient limit?</h4>
              <p class="text-gray-600">No! Both paid plans include unlimited patient records and tracking.</p>
            </div>
          </div>
        </div>

        <!-- Contact Link -->
        <div class="text-center mt-12">
          <p class="text-gray-600">
            Questions? <NuxtLink to="/contact" class="text-primary-600 font-semibold hover:text-primary-700">Contact us</NuxtLink>
          </p>
        </div>
      </div>
    </section>

    <!-- Upgrade Confirmation Modal -->
    <Teleport to="body">
      <div v-if="showUpgradeConfirm" class="fixed inset-0 z-50 flex items-center justify-center">
        <div class="absolute inset-0 bg-black/50" @click="showUpgradeConfirm = false"></div>
        <div class="relative bg-white rounded-2xl shadow-xl max-w-md w-full mx-4 p-6">
          <h3 class="text-xl font-bold text-gray-900 mb-4">
            <i class="fa-regular fa-arrow-up text-primary-600 mr-2"></i>
            Upgrade to Annual Plan
          </h3>
          
          <div class="bg-blue-50 border border-blue-600 rounded-lg p-4 mb-6">
            <p class="text-gray-700">
              <i class="fa-regular fa-info-circle text-blue-600 mr-2"></i>
              Your <strong>Annual Plan</strong> will start on <strong>{{ formatDate(currentSubscription?.nextBillingDate) }}</strong>, 
              at the end of your current billing cycle.
            </p>
            <p class="text-sm text-gray-600 mt-2">
              You can cancel this scheduled change anytime before it takes effect.
            </p>
          </div>

          <div class="bg-gray-50 rounded-lg p-4 mb-6">
            <div class="flex justify-between items-center">
              <span class="text-gray-600">New rate</span>
              <span class="font-bold text-gray-900">$35 CAD/month</span>
            </div>
            <div class="flex justify-between items-center mt-2">
              <span class="text-gray-600">Annual savings</span>
              <span class="font-bold text-green-600">$120/year</span>
            </div>
          </div>

          <div class="flex gap-3">
            <button 
              @click="showUpgradeConfirm = false"
              class="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button 
              @click="handleScheduleUpgrade"
              :disabled="upgradeLoading"
              class="flex-1 px-4 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <SpinnerIcon v-if="upgradeLoading" />
              <i v-else class="fa-regular fa-circle-check"></i>
              Confirm Upgrade
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { useAuth } from '~/composables/useAuth'
import { showNotification } from '~/stores/notification'

const { user, getIdToken } = useAuth()
const { refreshSubscription } = useSubscription()
const router = useRouter()

// State
const checkoutLoading = ref<string | null>(null)
const upgradeLoading = ref(false)
const error = ref('')
const successMessage = ref('')
const showUpgradeConfirm = ref(false)
const mounted = ref(false)
const trialLoading = ref(false)
const currentSubscription = ref<{
  subscriptionId: string | null
  status: string | null
  priceId: string | null
  nextBillingDate: string | null
  trialStartDate: string | null
  trialEndDate: string | null
  scheduledPriceId: string | null
  scheduledChangeDate: string | null
} | null>(null)

// Price IDs (matching inrManager)
const PRICE_IDS = {
  monthly_flex: 'price_1SOJ4XP4c4Gc3RfaES49MMHK',
  annual: 'price_1SYzfRP4c4Gc3RfaiWc2kUwt'
}

// Computed
const isTrialOrNone = computed(() => {
  if (!mounted.value) return true // SSR-safe: treat as no subscription
  if (!currentSubscription.value) return true
  return !currentSubscription.value.subscriptionId || currentSubscription.value.status === 'trialing'
})

const isOnTrial = computed(() => {
  if (!mounted.value) return false
  // User is on trial if they have status trialing OR have a valid trialEndDate without a subscription
  if (currentSubscription.value?.status === 'trialing') return true
  if (currentSubscription.value?.trialEndDate && !currentSubscription.value?.subscriptionId) {
    const trialEnd = new Date(currentSubscription.value.trialEndDate)
    return trialEnd >= new Date()
  }
  return false
})

const trialDaysLeft = computed(() => {
  if (!mounted.value || !currentSubscription.value?.trialEndDate) return 0
  const trialEnd = new Date(currentSubscription.value.trialEndDate)
  const now = new Date()
  return Math.max(0, Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
})

const trialEndFormatted = computed(() => {
  if (!currentSubscription.value?.trialEndDate) return ''
  return formatDate(currentSubscription.value.trialEndDate)
})

const isTrialExpired = computed(() => {
  if (!mounted.value) return false
  if (!currentSubscription.value?.trialEndDate) return false
  const trialEnd = new Date(currentSubscription.value.trialEndDate)
  return trialEnd < new Date() && !currentSubscription.value?.subscriptionId
})

const isOnMonthly = computed(() => {
  if (!mounted.value) return false
  return (currentSubscription.value?.status === 'active' || currentSubscription.value?.status === 'canceling') && 
         currentSubscription.value?.priceId === PRICE_IDS.monthly_flex
})

const isOnAnnual = computed(() => {
  if (!mounted.value) return false
  return (currentSubscription.value?.status === 'active' || currentSubscription.value?.status === 'canceling') && 
         currentSubscription.value?.priceId === PRICE_IDS.annual
})

const isScheduledAnnual = computed(() => {
  if (!mounted.value) return false
  return currentSubscription.value?.scheduledPriceId?.includes('price_1SYzfRP4c4Gc3Rfa') || false
})

const isTrialDisabled = computed(() => {
  if (!mounted.value) return false // SSR-safe
  // Disable trial if:
  // 1. User has any subscription (active, trialing, or canceled)
  // 2. User is currently on trial
  // 3. User's trial has expired (they already used their trial)
  // 4. User has ever had a trial (trialStartDate exists)
  return !!currentSubscription.value?.subscriptionId || 
         isOnTrial.value || 
         isTrialExpired.value ||
         !!currentSubscription.value?.trialStartDate
})

const isMonthlyDisabled = computed(() => {
  if (!mounted.value) return false // SSR-safe
  // Disable monthly if already on monthly or annual
  return isOnMonthly.value || isOnAnnual.value
})

const currentPlanName = computed(() => {
  if (isOnAnnual.value) return 'Annual'
  if (isOnMonthly.value) return 'Monthly Flex'
  if (isOnTrial.value) return 'Free Trial'
  return 'No Plan'
})

// Methods
function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—'
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

async function fetchSubscription() {
  if (!user.value) {
    console.log('[Pricing] fetchSubscription: No user, skipping')
    return
  }
  
  try {
    console.log('[Pricing] Fetching subscription for user:', user.value.uid)
    const token = await getIdToken()
    const response = await $fetch<{ subscription: typeof currentSubscription.value }>('/api/users/current', {
      headers: { Authorization: `Bearer ${token}` }
    })
    console.log('[Pricing] Subscription response:', response.subscription)
    currentSubscription.value = response.subscription
  } catch (err) {
    console.error('Failed to fetch subscription:', err)
  }
}

async function handleSubscribe(planId: 'monthly_flex' | 'annual') {
  if (!user.value) {
    sessionStorage.setItem('intended_plan', planId)
    router.push('/retroact')
    return
  }

  try {
    checkoutLoading.value = planId
    error.value = ''

    const token = await getIdToken()
    const priceId = PRICE_IDS[planId]

    const response = await $fetch<{ url: string }>('/api/stripe/checkout-session', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: {
        priceId,
        successUrl: `${window.location.origin}/account/settings/subscription?success=true`,
        cancelUrl: `${window.location.origin}/pricing?canceled=true`
      }
    })

    // Wait for DOM updates before redirecting
    await nextTick()
    window.location.href = response.url
  } catch (err: any) {
    console.error('Checkout error:', err)
    error.value = err.data?.message || 'Failed to start checkout. Please try again.'
    checkoutLoading.value = null
  }
}

async function handleScheduleUpgrade() {
  try {
    upgradeLoading.value = true
    error.value = ''

    const token = await getIdToken()
    
    await $fetch('/api/stripe/schedule-change', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: {
        newPriceId: PRICE_IDS.annual
      }
    })

    // Use full page navigation to avoid Teleport/Vue DOM issues
    window.location.href = '/account/settings/subscription'
  } catch (err: any) {
    console.error('Schedule upgrade error:', err)
    error.value = err.data?.message || 'Failed to schedule upgrade. Please try again.'
    upgradeLoading.value = false
  }
}

async function startTrial() {
  if (!user.value) {
    // Redirect to signup if not logged in
    router.push('/signup')
    return
  }

  try {
    trialLoading.value = true
    error.value = ''

    const token = await getIdToken()
    const response = await $fetch<{ success: boolean; trialEndDate: string }>('/api/users/start-trial', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    })

    if (response.success) {
      // Show success notification at top center
      showNotification('Your 14-day free trial has started! Enjoy full access to all features.', 'success', 5000)
      // Force refresh global subscription state so tabs update
      await refreshSubscription()
      // Small delay to ensure state propagates
      await new Promise(resolve => setTimeout(resolve, 100))
      // Redirect to subscription settings to show current plan
      router.push('/account/settings/subscription')
    }
  } catch (err: any) {
    console.error('Start trial error:', err)
    error.value = err.data?.message || 'Failed to start trial. Please try again.'
  } finally {
    trialLoading.value = false
  }
}

// Lifecycle
onMounted(async () => {
  mounted.value = true
  await fetchSubscription()
  
  const urlParams = new URLSearchParams(window.location.search)
  if (urlParams.get('canceled') === 'true') {
    error.value = 'Checkout was canceled. You can try again when ready.'
    window.history.replaceState({}, '', '/pricing')
  }
})

// Watch for user auth state changes to fetch subscription when user becomes available
watch(user, async (newUser) => {
  if (mounted.value && newUser && !currentSubscription.value) {
    await fetchSubscription()
  }
})

useSeoMeta({
  title: 'Plans - Praxio',
  description: 'Simple, transparent pricing for Praxio. Start with a free 14-day trial, no credit card required. Monthly Flex at $45/mo or save 22% with our Annual Plan.'
})
</script>
