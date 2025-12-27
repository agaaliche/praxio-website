<template>
  <div>
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-display font-bold text-gray-900">Billing</h1>
      <p class="mt-2 text-gray-600">Manage your payment methods and view invoices</p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center py-12">
      <i class="fa-solid fa-spinner fa-spin text-2xl text-primary-600"></i>
    </div>

    <template v-else>
      <!-- Payment Method -->
      <div class="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h2 class="text-lg font-bold text-gray-900 mb-4">Payment Method</h2>
        
        <div v-if="hasActiveSubscription" class="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
          <div class="w-12 h-8 bg-gradient-to-r from-blue-600 to-blue-800 rounded flex items-center justify-center">
            <i class="fa-brands fa-cc-visa text-white text-xl"></i>
          </div>
          <div>
            <p class="font-medium text-gray-900">Payment method on file</p>
            <p class="text-sm text-gray-500">Managed through Stripe</p>
          </div>
          <button 
            @click="openBillingPortal"
            :disabled="portalLoading"
            class="ml-auto text-primary-600 hover:text-primary-700 font-medium text-sm flex items-center gap-1"
          >
            <i v-if="portalLoading" class="fa-solid fa-spinner fa-spin"></i>
            Update
          </button>
        </div>
        <div v-else class="text-center py-6 text-gray-500">
          <i class="fa-light fa-credit-card text-3xl mb-2"></i>
          <p>No payment method on file</p>
          <p class="text-sm mt-1">Add a payment method when you subscribe to a plan</p>
        </div>
      </div>

      <!-- Billing History -->
      <div class="bg-white rounded-xl border border-gray-200 p-6">
        <h2 class="text-lg font-bold text-gray-900 mb-4">Billing History</h2>
        
        <div v-if="hasActiveSubscription" class="text-center py-6">
          <button 
            @click="openBillingPortal"
            :disabled="portalLoading"
            class="text-primary-600 hover:text-primary-700 font-medium flex items-center gap-2 mx-auto"
          >
            <i v-if="portalLoading" class="fa-solid fa-spinner fa-spin"></i>
            <i v-else class="fa-light fa-external-link"></i>
            View invoices in Stripe Portal
          </button>
        </div>
        <div v-else class="text-center py-8 text-gray-500">
          <i class="fa-light fa-receipt text-3xl mb-2"></i>
          <p>No invoices yet</p>
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
  subscriptionId: string | null
  status: string | null
} | null>(null)

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
onMounted(() => {
  fetchSubscription()
})
</script>
