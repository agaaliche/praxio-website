<template>
  <div>
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-display font-bold text-gray-900">{{ t('account.settings.billing.title') }}</h1>
      <p class="mt-2 text-gray-600">{{ t('account.settings.billing.description') }}</p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center py-12">
      <div class="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
    </div>

    <template v-else>
      <!-- Payment Method -->
      <div class="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h2 class="text-lg font-bold text-gray-900 mb-4">{{ t('account.settings.billing.paymentMethod') }}</h2>
        
        <div v-if="hasActiveSubscription" class="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
          <div class="w-12 h-8 bg-gradient-to-r from-blue-600 to-blue-800 rounded flex items-center justify-center">
            <i class="fa-brands fa-cc-visa text-white text-xl"></i>
          </div>
          <div>
            <p class="font-medium text-gray-900">{{ t('account.settings.billing.paymentOnFile') }}</p>
            <p class="text-sm text-gray-500">{{ t('account.settings.billing.managedByStripe') }}</p>
          </div>
          <button 
            @click="openBillingPortal"
            :disabled="portalLoading"
            class="ml-auto text-primary-600 hover:text-primary-700 font-medium text-sm flex items-center gap-1"
          >
            <SpinnerIcon v-if="portalLoading" />
            {{ t('account.settings.billing.update') }}
          </button>
        </div>
        <div v-else class="text-center py-6 text-gray-500">
          <i class="fa-regular fa-credit-card text-3xl mb-2"></i>
          <p>{{ t('account.settings.billing.noPaymentMethod') }}</p>
          <p class="text-sm mt-1">{{ t('account.settings.billing.addWhenSubscribe') }}</p>
        </div>
      </div>

      <!-- Next Billing Date -->
      <div v-if="hasActiveSubscription" class="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-bold text-gray-900">{{ t('account.settings.billing.nextBilling') }}</h2>
          <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <i class="fa-solid fa-circle-check mr-1"></i>
            {{ t('account.settings.billing.active') }}
          </span>
        </div>
        <div class="flex items-center gap-4 p-4 bg-primary-50 rounded-lg">
          <div class="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
            <i class="fa-regular fa-calendar text-primary-600 text-xl"></i>
          </div>
          <div class="flex-1">
            <p class="font-medium text-gray-900">{{ formatBillingDate(subscription?.nextBillingDate) }}</p>
            <p class="text-sm text-gray-600">{{ subscription?.planName || 'Subscription' }} · {{ formatBillingAmount(subscription?.amount, subscription?.currency) }}</p>
          </div>
        </div>
      </div>

      <!-- Billing History -->
      <div class="bg-white rounded-xl border border-gray-200 p-6">
        <h2 class="text-lg font-bold text-gray-900 mb-4">{{ t('account.settings.billing.billingHistory') }}</h2>
        
        <!-- Loading invoices -->
        <div v-if="invoicesLoading" class="flex justify-center py-6">
          <SpinnerIcon size="lg" class="text-primary-600" />
        </div>
        
        <!-- Invoices -->
        <div v-else-if="invoices.length > 0">
          <!-- Desktop Table -->
          <div class="hidden md:block overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr class="border-b border-gray-200">
                  <th class="text-left py-3 px-2 text-sm font-medium text-gray-500">{{ t('account.settings.billing.date') }}</th>
                  <th class="text-left py-3 px-2 text-sm font-medium text-gray-500">{{ t('account.settings.billing.invoice') }}</th>
                  <th class="text-left py-3 px-2 text-sm font-medium text-gray-500">{{ t('account.settings.billing.description') }}</th>
                  <th class="text-right py-3 px-2 text-sm font-medium text-gray-500">{{ t('account.settings.billing.amount') }}</th>
                  <th class="text-center py-3 px-2 text-sm font-medium text-gray-500">{{ t('account.settings.billing.status') }}</th>
                  <th class="text-right py-3 px-2 text-sm font-medium text-gray-500"></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="invoice in invoices" :key="invoice.id" class="border-b border-gray-100 hover:bg-gray-50">
                  <td class="py-3 px-2 text-sm text-gray-900">{{ formatDate(invoice.date) }}</td>
                  <td class="py-3 px-2 text-sm text-gray-600">{{ invoice.number || '—' }}</td>
                  <td class="py-3 px-2 text-sm text-gray-600 max-w-xs truncate">{{ invoice.description || 'Subscription' }}</td>
                  <td class="py-3 px-2 text-sm text-gray-900 text-right font-medium">{{ formatAmount(invoice.amount, invoice.currency) }}</td>
                  <td class="py-3 px-2 text-center">
                    <span 
                      :class="[
                        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
                        getStatusClass(invoice.status)
                      ]"
                    >
                      <i :class="['mr-1 text-[10px]', getStatusIcon(invoice.status)]"></i>
                      {{ getStatusLabel(invoice.status) }}
                    </span>
                  </td>
                  <td class="py-3 px-2 text-right">
                    <a 
                      v-if="invoice.pdfUrl"
                      :href="invoice.pdfUrl"
                      target="_blank"
                      class="text-primary-600 hover:text-primary-700 text-sm font-medium inline-flex items-center gap-1"
                    >
                      <i class="fa-regular fa-file-pdf"></i>
                      PDF
                    </a>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <!-- Mobile List -->
          <div class="md:hidden -mx-6">
          <div 
            v-for="invoice in invoices" 
            :key="invoice.id" 
            class="bg-white p-4 border-b border-gray-200"
          >
            <div class="flex items-start justify-between mb-3">
              <div class="flex-1">
                <p class="text-sm font-medium text-gray-900">{{ formatDate(invoice.date) }}</p>
                <p class="text-xs text-gray-500 mt-0.5">{{ invoice.number || '—' }}</p>
              </div>
              <span 
                :class="[
                  'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
                  getStatusClass(invoice.status)
                ]"
              >
                <i :class="['mr-1 text-[10px]', getStatusIcon(invoice.status)]"></i>
                {{ getStatusLabel(invoice.status) }}
              </span>
            </div>
            
            <div class="space-y-2">
              <div>
                <p class="text-sm text-gray-900">{{ invoice.description || 'Subscription' }}</p>
              </div>
              
              <div class="flex justify-end">
                <p class="text-sm font-medium text-gray-900">{{ formatAmount(invoice.amount, invoice.currency) }}</p>
              </div>
            </div>
            
            <a 
              v-if="invoice.pdfUrl"
              :href="invoice.pdfUrl"
              target="_blank"
              class="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-200 text-primary-600 hover:bg-primary-50 text-sm font-medium rounded-lg transition"
            >
              <i class="fa-regular fa-file-pdf"></i>
              Download PDF
            </a>
          </div>
        </div>
        </div>
        
        <!-- No invoices -->
        <div v-else class="text-center py-8 text-gray-500">
          <i class="fa-solid fa-receipt text-3xl mb-2"></i>
          <p>{{ t('account.settings.billing.noInvoices') }}</p>
        </div>
      </div>
    </template>

    <!-- Error Message -->
    <div v-if="error" class="mt-4 p-4 bg-red-50 border border-red-600 rounded-lg text-red-600">
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

const { t } = useI18n()
const { getIdToken } = useAuth()

// State
const loading = ref(true)
const portalLoading = ref(false)
const invoicesLoading = ref(false)
const error = ref('')
const subscription = ref<{
  subscriptionId: string | null
  status: string | null
  nextBillingDate: string | null
  priceId: string | null
  planName: string | null
  amount: number | null
  currency: string | null
} | null>(null)
const invoices = ref<{
  id: string
  number: string | null
  date: number
  amount: number
  currency: string
  status: string
  pdfUrl: string | null
  description: string | null
}[]>([])

// Computed
const hasActiveSubscription = computed(() => {
  return subscription.value?.status === 'active'
})

// Methods
async function fetchSubscription() {
  try {
    loading.value = true
    error.value = ''
    
    const token = await getIdToken()
    
    // Try to get detailed subscription info from Stripe
    try {
      const stripeResponse = await $fetch<{ subscription: typeof subscription.value }>('/api/stripe/subscription', {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (stripeResponse.subscription) {
        subscription.value = stripeResponse.subscription
        return
      }
    } catch {
      // Fall back to basic user info if Stripe call fails
    }
    
    // Fallback: get from user profile
    const response = await $fetch<{ subscription: typeof subscription.value }>('/api/users/current', {
      headers: { Authorization: `Bearer ${token}` }
    })
    
    subscription.value = response.subscription
  } catch (err: any) {
    console.error('Failed to fetch subscription:', err)
    error.value = err.data?.message || 'Failed to load billing information'
  } finally {
    loading.value = false
  }
}

async function fetchInvoices() {
  try {
    invoicesLoading.value = true
    
    const token = await getIdToken()
    const response = await $fetch<{ invoices: typeof invoices.value }>('/api/stripe/invoices', {
      headers: { Authorization: `Bearer ${token}` }
    })
    
    invoices.value = response.invoices
  } catch (err: any) {
    console.error('Failed to fetch invoices:', err)
    // Don't show error for invoices, just leave empty
  } finally {
    invoicesLoading.value = false
  }
}

function formatDate(timestamp: number): string {
  const date = new Date(timestamp * 1000)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function formatBillingDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—'
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
}

function formatBillingAmount(amount: number | null | undefined, currency: string | null | undefined): string {
  if (!amount || !currency) return ''
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: currency.toUpperCase()
  }).format(amount / 100)
}

function formatAmount(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: currency.toUpperCase()
  }).format(amount / 100)
}

function getStatusClass(status: string): string {
  switch (status) {
    case 'paid': return 'bg-green-100 text-green-800'
    case 'open': return 'bg-yellow-100 text-yellow-800'
    case 'draft': return 'bg-gray-100 text-gray-800'
    case 'void': return 'bg-red-50 text-red-600'
    case 'uncollectible': return 'bg-red-50 text-red-600'
    default: return 'bg-gray-100 text-gray-800'
  }
}

function getStatusIcon(status: string): string {
  switch (status) {
    case 'paid': return 'fa-solid fa-circle-check'
    case 'open': return 'fa-solid fa-clock'
    case 'draft': return 'fa-solid fa-file'
    case 'void': return 'fa-solid fa-ban'
    case 'uncollectible': return 'fa-solid fa-triangle-exclamation'
    default: return 'fa-solid fa-circle-question'
  }
}

function getStatusLabel(status: string): string {
  switch (status) {
    case 'paid': return 'Paid'
    case 'open': return 'Open'
    case 'draft': return 'Draft'
    case 'void': return 'Void'
    case 'uncollectible': return 'Uncollectible'
    default: return status.charAt(0).toUpperCase() + status.slice(1)
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

// Lifecycle
onMounted(async () => {
  await fetchSubscription()
  await fetchInvoices()
})
</script>
