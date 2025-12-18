<template>
  <div>
    <!-- Hero -->
    <section class="bg-gradient-to-br from-primary-50 to-white py-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 class="font-display text-4xl md:text-5xl font-bold text-gray-900 mb-4">Simple Pricing</h1>
        <p class="text-xl text-gray-600 max-w-2xl mx-auto">
          Start free, upgrade when you need more. No hidden fees.
        </p>
      </div>
    </section>

    <!-- Pricing Cards -->
    <section class="py-20">
      <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid md:grid-cols-2 gap-8">
          <!-- Free Plan -->
          <div class="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
            <h3 class="font-display text-2xl font-bold text-gray-900 mb-2">Free</h3>
            <p class="text-gray-600 mb-6">Perfect for getting started</p>
            <div class="mb-6">
              <span class="text-4xl font-bold text-gray-900">0€</span>
              <span class="text-gray-600">/month</span>
            </div>
            <ul class="space-y-4 mb-8">
              <li class="flex items-center">
                <svg class="w-5 h-5 text-green-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <span class="text-gray-600">Up to 10 patients</span>
              </li>
              <li class="flex items-center">
                <svg class="w-5 h-5 text-green-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <span class="text-gray-600">Basic reporting</span>
              </li>
              <li class="flex items-center">
                <svg class="w-5 h-5 text-green-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <span class="text-gray-600">Email support</span>
              </li>
            </ul>
            <a href="https://retroact.app/signup" class="block text-center bg-gray-100 text-gray-800 px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition">
              Get Started
            </a>
          </div>

          <!-- Pro Plan -->
          <div class="bg-primary-600 rounded-2xl shadow-lg p-8 relative">
            <div class="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <span class="bg-secondary-500 text-white px-4 py-1 rounded-full text-sm font-medium">Most Popular</span>
            </div>
            <h3 class="font-display text-2xl font-bold text-white mb-2">Pro</h3>
            <p class="text-primary-100 mb-6">For growing practices</p>
            <div class="mb-6">
              <span class="text-4xl font-bold text-white">9€</span>
              <span class="text-primary-100">/month</span>
            </div>
            <ul class="space-y-4 mb-8">
              <li class="flex items-center">
                <svg class="w-5 h-5 text-secondary-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <span class="text-white">Unlimited patients</span>
              </li>
              <li class="flex items-center">
                <svg class="w-5 h-5 text-secondary-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <span class="text-white">PDF prescriptions</span>
              </li>
              <li class="flex items-center">
                <svg class="w-5 h-5 text-secondary-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <span class="text-white">Advanced analytics</span>
              </li>
              <li class="flex items-center">
                <svg class="w-5 h-5 text-secondary-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <span class="text-white">Priority support</span>
              </li>
              <li class="flex items-center">
                <svg class="w-5 h-5 text-secondary-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <span class="text-white">Team collaboration</span>
              </li>
            </ul>
            <a href="https://retroact.app/signup" class="block text-center bg-white text-primary-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition">
              Start Free Trial
            </a>
          </div>
        </div>

        <!-- FAQ Link -->
        <div class="text-center mt-12">
          <p class="text-gray-600">
            Questions? <NuxtLink to="/contact" class="text-primary-600 font-semibold hover:text-primary-700">Contact us</NuxtLink>
          </p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
useSeoMeta({
  title: 'Pricing - Praxio',
  description: 'Simple, transparent pricing for Praxio medical software. Start free, upgrade when ready.'
})
</script>
