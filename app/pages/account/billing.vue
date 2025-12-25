<template>
  <div>
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-display font-bold text-gray-900">Billing</h1>
      <p class="mt-2 text-gray-600">Manage your subscription and payment methods</p>
    </div>

    <!-- Current Plan -->
    <div class="bg-white rounded-xl border border-gray-200 p-6 mb-6">
      <div class="flex items-start justify-between">
        <div>
          <h2 class="text-lg font-bold text-gray-900">Current Plan</h2>
          <p class="text-gray-500">Your subscription details</p>
        </div>
        <span class="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">
          Active
        </span>
      </div>

      <div class="mt-6 grid md:grid-cols-3 gap-6">
        <div>
          <p class="text-sm text-gray-500">Plan</p>
          <p class="text-lg font-bold text-gray-900">{{ currentPlan }}</p>
        </div>
        <div>
          <p class="text-sm text-gray-500">Next Billing Date</p>
          <p class="text-lg font-bold text-gray-900">{{ nextBillingDate }}</p>
        </div>
        <div>
          <p class="text-sm text-gray-500">Amount</p>
          <p class="text-lg font-bold text-gray-900">{{ planAmount }}</p>
        </div>
      </div>

      <div class="mt-6 flex gap-3">
        <button class="px-4 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition">
          Manage Subscription
        </button>
        <button class="px-4 py-2 text-gray-700 font-medium border border-gray-300 rounded-lg hover:bg-gray-50 transition">
          View Invoices
        </button>
      </div>
    </div>

    <!-- Payment Method -->
    <div class="bg-white rounded-xl border border-gray-200 p-6 mb-6">
      <h2 class="text-lg font-bold text-gray-900 mb-4">Payment Method</h2>
      
      <div class="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
        <div class="w-12 h-8 bg-gradient-to-r from-blue-600 to-blue-800 rounded flex items-center justify-center">
          <i class="fa-brands fa-cc-visa text-white text-xl"></i>
        </div>
        <div>
          <p class="font-medium text-gray-900">•••• •••• •••• 4242</p>
          <p class="text-sm text-gray-500">Expires 12/25</p>
        </div>
        <button class="ml-auto text-primary-600 hover:text-primary-700 font-medium text-sm">
          Update
        </button>
      </div>
    </div>

    <!-- Billing History -->
    <div class="bg-white rounded-xl border border-gray-200 p-6">
      <h2 class="text-lg font-bold text-gray-900 mb-4">Billing History</h2>
      
      <div class="text-center py-8 text-gray-500">
        <i class="fa-solid fa-receipt text-3xl mb-2"></i>
        <p>No invoices yet</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ['auth']
})

// Placeholder data - will be replaced with real Stripe data
const currentPlan = ref('Trial')
const nextBillingDate = ref('Jan 25, 2026')
const planAmount = ref('Free')
</script>
