<template>
  <div class="py-20">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 class="text-4xl font-display font-bold text-gray-900 mb-8">Terms of Service</h1>
      
      <div class="prose prose-lg max-w-none">
        <p class="text-gray-600 mb-6">Last updated: {{ new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) }}</p>

        <section class="mb-8">
          <h2 class="text-2xl font-display font-bold text-gray-900 mb-4">1. Acceptance of Terms</h2>
          <p class="text-gray-600 mb-4">
            By accessing or using Praxio services, including Retroact, you agree to be bound by these Terms of Service. 
            If you do not agree to these terms, please do not use our services.
          </p>
        </section>

        <section class="mb-8">
          <h2 class="text-2xl font-display font-bold text-gray-900 mb-4">2. Description of Service</h2>
          <p class="text-gray-600 mb-4">
            Praxio provides software tools for healthcare professionals, including Retroact for INR management. 
            Our services are designed to assist with clinical workflows but do not replace professional medical judgment.
          </p>
        </section>

        <section class="mb-8">
          <h2 class="text-2xl font-display font-bold text-gray-900 mb-4">3. User Accounts</h2>
          <p class="text-gray-600 mb-4">You are responsible for:</p>
          <ul class="list-disc list-inside text-gray-600 mb-4 space-y-2">
            <li>Maintaining the confidentiality of your account credentials</li>
            <li>All activities that occur under your account</li>
            <li>Ensuring all information you provide is accurate and up-to-date</li>
            <li>Notifying us immediately of any unauthorized use</li>
          </ul>
        </section>

        <section class="mb-8">
          <h2 class="text-2xl font-display font-bold text-gray-900 mb-4">4. Subscription and Payment</h2>
          <p class="text-gray-600 mb-4">
            Retroact offers a free tier (up to 10 patients) and paid subscription plans. Paid subscriptions are billed 
            monthly. You may cancel your subscription at any time, effective at the end of the current billing period.
          </p>
        </section>

        <section class="mb-8">
          <h2 class="text-2xl font-display font-bold text-gray-900 mb-4">5. Data Ownership</h2>
          <p class="text-gray-600 mb-4">
            You retain all rights to the data you enter into our services. We do not claim ownership of your content. 
            You grant us a limited license to use your data solely to provide our services.
          </p>
        </section>

        <section class="mb-8">
          <h2 class="text-2xl font-display font-bold text-gray-900 mb-4">6. Limitation of Liability</h2>
          <p class="text-gray-600 mb-4">
            Our services are provided "as is" without warranties of any kind. We are not liable for any indirect, 
            incidental, or consequential damages arising from your use of our services.
          </p>
        </section>

        <section class="mb-8">
          <h2 class="text-2xl font-display font-bold text-gray-900 mb-4">7. Medical Disclaimer</h2>
          <p class="text-gray-600 mb-4">
            Retroact is a tool to assist healthcare professionals. It does not provide medical advice and should not 
            replace clinical judgment. Healthcare professionals remain responsible for all treatment decisions.
          </p>
        </section>

        <section class="mb-8">
          <h2 class="text-2xl font-display font-bold text-gray-900 mb-4">8. Contact</h2>
          <p class="text-gray-600 mb-4">
            For questions about these Terms of Service, please contact us:
          </p>
          <p class="text-gray-600">
            <NuxtLink to="/contact" class="text-primary-600 hover:underline">Contact Form</NuxtLink>
          </p>
        </section>
      </div>
    </div>
  </div>
</template>
