<template>
  <div>
    <!-- Hero Section -->
    <section class="bg-gradient-to-br from-primary-50 to-white py-20">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center max-w-3xl mx-auto">
          <h1 class="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-gray-900 leading-tight">
            Simplify Your INR Management
          </h1>
          <p class="mt-6 text-xl text-gray-600 leading-relaxed">
            Retroact helps healthcare professionals manage anticoagulant therapy with ease. 
            Track INR values, adjust dosages, and generate prescriptions - all in one secure platform.
          </p>
          <div class="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <NuxtLink 
              to="/signup" 
              class="inline-flex items-center justify-center px-8 py-4 rounded-xl bg-primary-600 text-white font-semibold hover:bg-primary-700 transition shadow-lg hover:shadow-xl"
            >
              Start Free Trial
              <svg class="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </NuxtLink>
            <NuxtLink 
              to="/retroact" 
              class="inline-flex items-center justify-center px-8 py-4 rounded-xl bg-white text-primary-600 font-semibold border-2 border-primary-600 hover:bg-primary-50 transition"
            >
              Learn More
            </NuxtLink>
          </div>
          <p class="mt-4 text-sm text-gray-500">
            Free for up to 10 patients. No credit card required.
          </p>
        </div>
      </div>
    </section>

    <!-- Product Showcase -->
    <section class="py-20 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <h2 class="text-3xl md:text-4xl font-display font-bold text-gray-900">
            Everything You Need for INR Management
          </h2>
          <p class="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
            Retroact combines powerful features with an intuitive interface designed for busy healthcare professionals.
          </p>
        </div>

        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <!-- Feature 1 -->
          <div class="bg-gray-50 rounded-2xl p-8 hover:shadow-lg transition">
            <div class="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center mb-6">
              <svg class="w-7 h-7 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 class="text-xl font-display font-bold text-gray-900 mb-3">INR Tracking</h3>
            <p class="text-gray-600">
              Visual graphs and history of all INR measurements. Quickly identify trends and adjust treatment accordingly.
            </p>
          </div>

          <!-- Feature 2 -->
          <div class="bg-gray-50 rounded-2xl p-8 hover:shadow-lg transition">
            <div class="w-14 h-14 bg-secondary-100 rounded-xl flex items-center justify-center mb-6">
              <svg class="w-7 h-7 text-secondary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 class="text-xl font-display font-bold text-gray-900 mb-3">PDF Prescriptions</h3>
            <p class="text-gray-600">
              Generate professional prescription PDFs with dosage calendars. Print or share digitally with patients.
            </p>
          </div>

          <!-- Feature 3 -->
          <div class="bg-gray-50 rounded-2xl p-8 hover:shadow-lg transition">
            <div class="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center mb-6">
              <svg class="w-7 h-7 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 class="text-xl font-display font-bold text-gray-900 mb-3">Patient Management</h3>
            <p class="text-gray-600">
              Organize all your patients in one place. Quick search, filtering, and easy access to complete history.
            </p>
          </div>

          <!-- Feature 4 -->
          <div class="bg-gray-50 rounded-2xl p-8 hover:shadow-lg transition">
            <div class="w-14 h-14 bg-secondary-100 rounded-xl flex items-center justify-center mb-6">
              <svg class="w-7 h-7 text-secondary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 class="text-xl font-display font-bold text-gray-900 mb-3">Appointment Scheduling</h3>
            <p class="text-gray-600">
              Schedule next INR checks and get reminders. Never miss a follow-up appointment.
            </p>
          </div>

          <!-- Feature 5 -->
          <div class="bg-gray-50 rounded-2xl p-8 hover:shadow-lg transition">
            <div class="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center mb-6">
              <svg class="w-7 h-7 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 class="text-xl font-display font-bold text-gray-900 mb-3">Secure & Private</h3>
            <p class="text-gray-600">
              GDPR compliant with encrypted data storage. Your patients' data is always protected.
            </p>
          </div>

          <!-- Feature 6 -->
          <div class="bg-gray-50 rounded-2xl p-8 hover:shadow-lg transition">
            <div class="w-14 h-14 bg-secondary-100 rounded-xl flex items-center justify-center mb-6">
              <svg class="w-7 h-7 text-secondary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 class="text-xl font-display font-bold text-gray-900 mb-3">Mobile Friendly</h3>
            <p class="text-gray-600">
              Access from any device - desktop, tablet, or smartphone. Your data syncs automatically.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="py-20 bg-primary-600">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 class="text-3xl md:text-4xl font-display font-bold text-white">
          Ready to simplify your INR management?
        </h2>
        <p class="mt-4 text-xl text-primary-100">
          Join healthcare professionals who trust Retroact for their anticoagulant therapy management.
        </p>
        <a 
          href="https://retroact.app/signup" 
          class="mt-8 inline-flex items-center justify-center px-8 py-4 rounded-xl bg-white text-primary-600 font-semibold hover:bg-gray-100 transition shadow-lg"
        >
          Start Your Free Trial
          <svg class="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </a>
      </div>
    </section>
  </div>
</template>
