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
          Privacy Policy
        </li>
      </ol>
    </nav>
    
    <div class="py-20">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 class="text-4xl font-display font-bold text-gray-900 mb-8">Privacy Policy</h1>
      
      <div class="prose prose-lg max-w-none">
        <p class="text-gray-600 mb-6">Last updated: {{ new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) }}</p>

        <section class="mb-8">
          <h2 class="text-2xl font-display font-bold text-gray-900 mb-4">1. Introduction</h2>
          <p class="text-gray-600 mb-4">
            Praxio ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, 
            use, disclose, and safeguard your information when you use our services, including Retroact.
          </p>
        </section>

        <section class="mb-8">
          <h2 class="text-2xl font-display font-bold text-gray-900 mb-4">2. Information We Collect</h2>
          <p class="text-gray-600 mb-4">We collect information that you provide directly to us, including:</p>
          <ul class="list-disc list-inside text-gray-600 mb-4 space-y-2">
            <li>Account information (name, email address, password)</li>
            <li>Professional information (practice name, specialty)</li>
            <li>Patient data that you enter into our system</li>
            <li>Payment information (processed securely via Stripe)</li>
          </ul>
        </section>

        <section class="mb-8">
          <h2 class="text-2xl font-display font-bold text-gray-900 mb-4">3. How We Use Your Information</h2>
          <p class="text-gray-600 mb-4">We use the information we collect to:</p>
          <ul class="list-disc list-inside text-gray-600 mb-4 space-y-2">
            <li>Provide, maintain, and improve our services</li>
            <li>Process transactions and send related information</li>
            <li>Send technical notices and support messages</li>
            <li>Respond to your comments and questions</li>
          </ul>
        </section>

        <section class="mb-8">
          <h2 class="text-2xl font-display font-bold text-gray-900 mb-4">4. Data Security</h2>
          <p class="text-gray-600 mb-4">
            We implement appropriate technical and organizational measures to protect your personal data against unauthorized 
            access, alteration, disclosure, or destruction. All data is encrypted in transit and at rest.
          </p>
        </section>

        <section class="mb-8">
          <h2 class="text-2xl font-display font-bold text-gray-900 mb-4">5. GDPR Compliance</h2>
          <p class="text-gray-600 mb-4">
            For users in the European Economic Area, we comply with GDPR requirements. You have the right to access, 
            rectify, erase, and port your data, as well as the right to object to or restrict processing.
          </p>
        </section>

        <section class="mb-8">
          <h2 class="text-2xl font-display font-bold text-gray-900 mb-4">6. Contact Us</h2>
          <p class="text-gray-600 mb-4">
            If you have questions about this Privacy Policy, please contact us at:
          </p>
          <p class="text-gray-600">
            <NuxtLink to="/contact" class="text-primary-600 hover:underline">Contact Form</NuxtLink>
          </p>
        </section>
      </div>
    </div>
    </div>
  </div>
</template>
