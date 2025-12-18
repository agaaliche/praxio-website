<template>
  <div>
    <!-- Hero -->
    <section class="bg-gradient-to-br from-primary-50 to-white py-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 class="font-display text-4xl md:text-5xl font-bold text-gray-900 mb-4">About Praxio</h1>
        <p class="text-xl text-gray-600 max-w-2xl mx-auto">
          Building software that makes healthcare better.
        </p>
      </div>
    </section>

    <!-- Story -->
    <section class="py-20">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="prose prose-lg max-w-none">
          <h2 class="font-display text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
          <p class="text-gray-600 mb-6">
            Praxio was founded with a simple mission: to create software that healthcare 
            professionals actually want to use. Too often, medical software is clunky, 
            outdated, and frustrating to navigate.
          </p>
          <p class="text-gray-600 mb-6">
            We believe that technology should empower healthcare providers, not burden them. 
            Our team combines deep expertise in software development with firsthand experience 
            in healthcare settings.
          </p>
          <p class="text-gray-600 mb-6">
            Every product we build is designed with the end user in mind - fast, intuitive, 
            and secure. We're committed to continuous improvement based on real feedback 
            from the medical community.
          </p>
        </div>
      </div>
    </section>

    <!-- Values -->
    <section class="py-20 bg-gray-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 class="font-display text-3xl font-bold text-gray-900 text-center mb-12">Our Values</h2>
        <div class="grid md:grid-cols-3 gap-8">
          <div class="bg-white rounded-xl p-8 shadow-sm">
            <div class="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
              <svg class="w-6 h-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h3 class="font-display text-xl font-semibold text-gray-900 mb-2">Patient-Centered</h3>
            <p class="text-gray-600">Everything we build ultimately serves patients and improves their care.</p>
          </div>
          <div class="bg-white rounded-xl p-8 shadow-sm">
            <div class="w-12 h-12 bg-secondary-100 rounded-lg flex items-center justify-center mb-4">
              <svg class="w-6 h-6 text-secondary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 class="font-display text-xl font-semibold text-gray-900 mb-2">Security First</h3>
            <p class="text-gray-600">Medical data is sensitive. We treat security as a core feature, not an afterthought.</p>
          </div>
          <div class="bg-white rounded-xl p-8 shadow-sm">
            <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <svg class="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 class="font-display text-xl font-semibold text-gray-900 mb-2">Simplicity</h3>
            <p class="text-gray-600">Complex problems deserve elegant, simple solutions. We fight complexity at every turn.</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
useSeoMeta({
  title: 'About - Praxio',
  description: 'Learn about Praxio and our mission to build better medical software.'
})
</script>
