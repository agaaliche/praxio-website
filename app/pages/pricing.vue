<template>
  <div>
    <!-- Breadcrumbs (Mobile Only) -->
    <nav class="pt-4 mb-4 md:hidden px-4 sm:px-6 lg:px-8">
      <ol class="flex items-center gap-2 text-sm text-primary-600">
        <li>
          <NuxtLink to="/" class="hover:text-primary-700 transition">{{ t('common.home') }}</NuxtLink>
        </li>
        <li class="text-primary-400">
          <i class="fa-solid fa-chevron-right text-xs"></i>
        </li>
        <li class="font-medium">
          {{ t('header.plans') }}
        </li>
      </ol>
    </nav>
    
    <!-- Hero -->
    <section class="bg-gradient-to-br from-primary-50 to-white pt-8 pb-4">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 class="font-display text-4xl md:text-5xl font-bold text-gray-900 mb-2">{{ t('pricing.hero.title') }}</h1>
        <p class="text-xl text-gray-600 max-w-2xl mx-auto">
          {{ t('pricing.hero.subtitle') }}
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
                {{ t('pricing.currentPlan.youreOn') }} <strong>{{ currentPlanName }}</strong><span v-if="locale === 'en'"> plan</span>
              </p>
              <p v-if="currentSubscription.nextBillingDate && (isOnTrial || currentSubscription.status === 'active')" class="text-xs sm:text-sm text-gray-600">
                {{ isOnTrial ? t('pricing.currentPlan.trialEnds') : t('pricing.currentPlan.nextBilling') }}: {{ formatDate(currentSubscription.nextBillingDate) }}
              </p>
            </div>
          </div>
          <NuxtLink 
            to="/account/settings/billing"
            class="text-primary-600 hover:text-primary-700 font-medium text-sm flex items-center gap-1 ml-8 sm:ml-0"
          >
            <i class="fa-regular fa-gear"></i>
            {{ t('pricing.currentPlan.manage') }}
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
                <i class="fa-regular fa-gift mr-1"></i> {{ t('pricing.freeTrial.badge') }}
              </span>
            </div>
            <h3 class="font-display text-2xl font-bold text-gray-900 mb-2 mt-2">{{ t('pricing.freeTrial.title') }}</h3>
            <p class="text-gray-600 mb-6">{{ t('pricing.freeTrial.subtitle') }}</p>
            <div class="mb-6">
              <span class="text-4xl font-bold text-green-600">{{ t('pricing.freeTrial.free') }}</span>
              <div class="text-gray-500 text-sm mt-1">
                <i class="fa-regular fa-clock mr-1"></i> 
                <template v-if="isOnTrial">
                  {{ trialDaysLeft }} day{{ trialDaysLeft === 1 ? '' : 's' }} left (ends {{ trialEndFormatted }})
                </template>
                <template v-else>
                  {{ t('pricing.freeTrial.duration') }}
                </template>
              </div>
            </div>
            <ul class="space-y-4 mb-8">
              <li class="flex items-center">
                <i class="fa-regular fa-circle-check text-green-500 mr-3"></i>
                <span class="text-gray-600">{{ t('pricing.freeTrial.feature1') }}</span>
              </li>
              <li class="flex items-center">
                <i class="fa-regular fa-circle-check text-green-500 mr-3"></i>
                <span class="text-gray-600">{{ t('pricing.freeTrial.feature2') }}</span>
              </li>
              <li class="flex items-center">
                <i class="fa-regular fa-circle-check text-green-500 mr-3"></i>
                <span class="text-gray-600">{{ t('pricing.freeTrial.feature3') }}</span>
              </li>
              <li class="flex items-center">
                <i class="fa-regular fa-circle-check text-green-500 mr-3"></i>
                <span class="text-gray-600">{{ t('pricing.freeTrial.feature4') }}</span>
              </li>
              <li class="flex items-center">
                <i class="fa-regular fa-circle-check text-green-500 mr-3"></i>
                <span class="text-gray-600">{{ t('pricing.freeTrial.feature5') }}</span>
              </li>
            </ul>
            <div class="mt-auto">
            <button 
              v-if="isTrialDisabled"
              disabled
              class="w-full text-center bg-gray-300 text-gray-500 px-6 py-3 rounded-lg font-semibold cursor-not-allowed flex items-center justify-center gap-2"
            >
              <i class="fa-regular fa-circle-check"></i>
              {{ isOnTrial ? t('pricing.monthly.badge') : (isTrialExpired ? t('pricing.freeTrial.trialExpired') : t('pricing.freeTrial.notAvailable')) }}
            </button>
            <button 
              v-else
              @click="startTrial"
              :disabled="trialLoading"
              class="w-full text-center bg-green-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-600 transition disabled:opacity-50 flex items-center justify-center"
            >
              <SpinnerIcon v-if="trialLoading" class="mr-2" />
              <i v-else class="fa-regular fa-play mr-2"></i>
              {{ trialLoading ? t('pricing.freeTrial.starting') : t('pricing.freeTrial.startTrial') }}
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
                <i class="fa-regular fa-circle-check mr-1"></i> {{ t('pricing.monthly.badge') }}
              </span>
            </div>
            <h3 class="font-display text-2xl font-bold text-gray-900 mb-2" :class="{ 'mt-2': isOnMonthly }">{{ t('pricing.monthly.title') }}</h3>
            <p class="text-gray-600 mb-6">{{ t('pricing.monthly.subtitle') }}</p>
            <div class="mb-6">
              <span class="text-4xl font-bold text-gray-900">{{ t('pricing.monthly.price') }}</span>
              <span class="text-gray-600">{{ t('pricing.monthly.perMonth') }}</span>
              <div class="text-gray-500 text-sm mt-1">{{ t('pricing.monthly.details') }}</div>
            </div>
            <ul class="space-y-4 mb-8">
              <li class="flex items-center">
                <i class="fa-regular fa-circle-check text-primary-500 mr-3"></i>
                <span class="text-gray-600">{{ t('pricing.monthly.feature1') }}</span>
              </li>
              <li class="flex items-center">
                <i class="fa-regular fa-circle-check text-primary-500 mr-3"></i>
                <span class="text-gray-600">{{ t('pricing.monthly.feature2') }}</span>
              </li>
              <li class="flex items-center">
                <i class="fa-regular fa-circle-check text-primary-500 mr-3"></i>
                <span class="text-gray-600">{{ t('pricing.monthly.feature3') }}</span>
              </li>
              <li class="flex items-center">
                <i class="fa-regular fa-circle-check text-primary-500 mr-3"></i>
                <span class="text-gray-600">{{ t('pricing.monthly.feature4') }}</span>
              </li>
            </ul>
            <div class="mt-auto">
            <NuxtLink 
              v-if="isMonthlyDisabled"
              to="/account/settings/subscription"
              class="w-full text-center bg-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-400 transition flex items-center justify-center gap-2"
            >
              <i class="fa-regular fa-circle-check"></i>
              {{ t('pricing.monthly.currentPlanButton') }}
            </NuxtLink>
            <button 
              v-else
              @click="handleSubscribe('monthly_flex')"
              :disabled="checkoutLoading !== null"
              class="w-full text-center bg-white text-gray-700 border border-gray-300 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <SpinnerIcon v-if="checkoutLoading === 'monthly_flex'" />
              {{ t('pricing.monthly.subscribe') }}
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
                <i class="fa-regular fa-circle-check mr-1"></i> {{ t('pricing.monthly.badge') }}
              </span>
              <span v-else class="bg-secondary-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                <i class="fa-solid fa-star mr-1"></i> {{ t('pricing.annual.badge') }}
              </span>
            </div>
            <h3 :class="['font-display text-2xl font-bold mb-2 mt-2', isOnAnnual ? 'text-gray-900' : 'text-white']">{{ t('pricing.annual.title') }}</h3>
            <p :class="['mb-6', isOnAnnual ? 'text-gray-600' : 'text-primary-100']">{{ t('pricing.annual.subtitle') }}</p>
            <div class="mb-6">
              <span :class="['text-4xl font-bold', isOnAnnual ? 'text-gray-900' : 'text-white']">{{ t('pricing.annual.price') }}</span>
              <span :class="isOnAnnual ? 'text-gray-600' : 'text-primary-100'">{{ t('pricing.annual.perMonth') }}</span>
              <div :class="['text-sm mt-1 font-medium', isOnAnnual ? 'text-green-600' : 'text-green-300']">
                <i class="fa-regular fa-piggy-bank mr-1"></i> {{ t('pricing.annual.savings') }}
              </div>
            </div>
            <ul class="space-y-4 mb-8">
              <li class="flex items-center">
                <i :class="['fa-regular fa-circle-check mr-3', isOnAnnual ? 'text-primary-500' : 'text-secondary-400']"></i>
                <span :class="isOnAnnual ? 'text-gray-600' : 'text-white'">{{ t('pricing.annual.feature1') }}</span>
              </li>
              <li class="flex items-center">
                <i :class="['fa-regular fa-circle-check mr-3', isOnAnnual ? 'text-primary-500' : 'text-secondary-400']"></i>
                <span :class="isOnAnnual ? 'text-gray-600' : 'text-white'">{{ t('pricing.annual.feature2') }}</span>
              </li>
              <li class="flex items-center">
                <i :class="['fa-regular fa-circle-check mr-3', isOnAnnual ? 'text-primary-500' : 'text-secondary-400']"></i>
                <span :class="isOnAnnual ? 'text-gray-600' : 'text-white'">{{ t('pricing.annual.feature3') }}</span>
              </li>
              <li class="flex items-center">
                <i :class="['fa-regular fa-circle-check mr-3', isOnAnnual ? 'text-primary-500' : 'text-secondary-400']"></i>
                <span :class="isOnAnnual ? 'text-gray-600' : 'text-white'">{{ t('pricing.annual.feature4') }}</span>
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
              {{ t('pricing.monthly.currentPlanButton') }}
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
                {{ t('pricing.annual.upgradeScheduled') }}
              </template>
              <template v-else>
                <i class="fa-regular fa-arrow-up"></i>
                {{ t('pricing.annual.upgradeButton') }}
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
              {{ t('pricing.annual.subscribe') }}
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
          <h2 class="font-display text-3xl font-bold text-gray-900 text-center mb-10">{{ t('pricing.faq.title') }}</h2>
          
          <div class="max-w-3xl mx-auto space-y-4">
            <div class="bg-white rounded-xl shadow border border-gray-100 p-6">
              <h4 class="font-semibold text-gray-900 mb-2">{{ t('pricing.faq.q1') }}</h4>
              <p class="text-gray-600">{{ t('pricing.faq.a1') }}</p>
            </div>
            
            <div class="bg-white rounded-xl shadow border border-gray-100 p-6">
              <h4 class="font-semibold text-gray-900 mb-2">{{ t('pricing.faq.q2') }}</h4>
              <p class="text-gray-600">{{ t('pricing.faq.a2') }}</p>
            </div>
            
            <div class="bg-white rounded-xl shadow border border-gray-100 p-6">
              <h4 class="font-semibold text-gray-900 mb-2">{{ t('pricing.faq.q3') }}</h4>
              <p class="text-gray-600">{{ t('pricing.faq.a3') }}</p>
            </div>
            
            <div class="bg-white rounded-xl shadow border border-gray-100 p-6">
              <h4 class="font-semibold text-gray-900 mb-2">{{ t('pricing.faq.q4') }}</h4>
              <p class="text-gray-600">{{ t('pricing.faq.a4') }}</p>
            </div>
          </div>
        </div>

        <!-- Contact Link -->
        <div class="text-center mt-12">
          <p class="text-gray-600">
            {{ t('pricing.contact.questions') }} <NuxtLink to="/contact" class="text-primary-600 font-semibold hover:text-primary-700">{{ t('pricing.contact.contactUs') }}</NuxtLink>
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
            {{ t('pricing.upgradeModal.title') }}
          </h3>
          
          <div class="bg-blue-50 border border-blue-600 rounded-lg p-4 mb-6">
            <p class="text-gray-700">
              <i class="fa-regular fa-info-circle text-blue-600 mr-2"></i>
              <template v-if="locale === 'en'">
                Your <strong>Annual Plan</strong> will start on <strong>{{ formatDate(currentSubscription?.nextBillingDate) }}</strong>, 
                at the end of your current billing cycle.
              </template>
              <template v-else>
                Votre <strong>forfait annuel</strong> commencera le <strong>{{ formatDate(currentSubscription?.nextBillingDate) }}</strong>, à la fin de votre cycle de facturation actuel.
              </template>
            </p>
            <p class="text-sm text-gray-600 mt-2">
              {{ t('pricing.upgradeModal.cancelNote') }}
            </p>
          </div>

          <div class="bg-gray-50 rounded-lg p-4 mb-6">
            <div class="flex justify-between items-center">
              <span class="text-gray-600">{{ t('pricing.upgradeModal.newRate') }}</span>
              <span class="font-bold text-gray-900">$35 CAD/month</span>
            </div>
            <div class="flex justify-between items-center mt-2">
              <span class="text-gray-600">{{ t('pricing.upgradeModal.annualSavings') }}</span>
              <span class="font-bold text-green-600">$120/year</span>
            </div>
          </div>

          <div class="flex gap-3">
            <button 
              @click="showUpgradeConfirm = false"
              class="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition"
            >
              {{ t('common.cancel') }}
            </button>
            <button 
              @click="handleScheduleUpgrade"
              :disabled="upgradeLoading"
              class="flex-1 px-4 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <SpinnerIcon v-if="upgradeLoading" />
              <i v-else class="fa-regular fa-circle-check"></i>
              {{ t('pricing.upgradeModal.confirmButton') }}
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

const { t, locale } = useI18n()
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
  if (isOnAnnual.value) return t('pricing.currentPlan.annual')
  if (isOnMonthly.value) return t('pricing.currentPlan.monthlyFlex')
  if (isOnTrial.value) return t('pricing.currentPlan.freeTrial')
  return t('pricing.currentPlan.noPlan')
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
    error.value = err.data?.message || t('messages.errors.checkoutFailed')
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
    error.value = err.data?.message || t('messages.errors.upgradeScheduleFailed')
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
      showNotification(t('messages.success.trialStarted'), 'success', 5000)
      // Force refresh global subscription state so tabs update
      await refreshSubscription()
      // Small delay to ensure state propagates
      await new Promise(resolve => setTimeout(resolve, 100))
      // Redirect to subscription settings to show current plan
      router.push('/account/settings/subscription')
    }
  } catch (err: any) {
    console.error('Start trial error:', err)
    error.value = err.data?.message || t('messages.errors.startTrialFailed')
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
    error.value = t('messages.errors.checkoutCanceled')
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
