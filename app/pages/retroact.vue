<template>
  <div>
    <!-- Hero Section -->
    <section class="bg-gradient-to-br from-primary-50 to-white py-20">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center max-w-3xl mx-auto">
          <div class="inline-flex items-center px-4 py-2 bg-primary-100 text-primary-700 rounded-full text-sm font-medium mb-6">
            INR Management Made Simple
          </div>
          <h1 class="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-gray-900 leading-tight">
            Retroact
          </h1>
          <p class="mt-6 text-xl text-gray-600 leading-relaxed">
            The complete solution for healthcare professionals managing anticoagulant therapy. 
            See how Retroact simplifies your daily workflow.
          </p>
          <div class="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="https://retroact.app/signup" 
              class="inline-flex items-center justify-center px-8 py-4 rounded-xl bg-primary-600 text-white font-semibold hover:bg-primary-700 transition shadow-lg"
            >
              Start Free Trial
            </a>
            <a 
              href="https://retroact.app" 
              class="inline-flex items-center justify-center px-8 py-4 rounded-xl bg-white text-primary-600 font-semibold border-2 border-primary-200 hover:border-primary-300 transition"
            >
              Visit Retroact.app
            </a>
          </div>
        </div>
      </div>
    </section>

    <!-- Feature Sections -->
    <section class="py-20">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <h2 class="text-3xl md:text-4xl font-display font-bold text-gray-900">
            See Retroact in Action
          </h2>
          <p class="mt-4 text-xl text-gray-600">
            Explore how each feature helps streamline your INR management workflow
          </p>
        </div>

        <!-- Feature Navigation -->
        <div class="flex flex-wrap justify-center gap-3 mb-12">
          <button 
            v-for="feature in features" 
            :key="feature.id"
            @click="activeFeature = feature.id"
            :class="[
              'px-6 py-3 rounded-full font-medium transition',
              activeFeature === feature.id 
                ? 'bg-primary-600 text-white shadow-lg' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            ]"
          >
            {{ feature.title }}
          </button>
        </div>

        <!-- Feature Content -->
        <div v-for="feature in features" :key="feature.id" v-show="activeFeature === feature.id">
          <div class="grid lg:grid-cols-2 gap-12 items-center">
            <!-- Description -->
            <div :class="feature.reverse ? 'lg:order-2' : ''">
              <div class="w-14 h-14 rounded-xl flex items-center justify-center mb-6" :class="feature.iconBg">
                <component :is="feature.icon" class="w-7 h-7" :class="feature.iconColor" />
              </div>
              <h3 class="text-2xl md:text-3xl font-display font-bold text-gray-900 mb-4">
                {{ feature.title }}
              </h3>
              <p class="text-lg text-gray-600 mb-6">
                {{ feature.description }}
              </p>
              <ul class="space-y-3">
                <li v-for="(point, index) in feature.points" :key="index" class="flex items-start">
                  <svg class="w-6 h-6 text-green-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span class="text-gray-600">{{ point }}</span>
                </li>
              </ul>
            </div>

            <!-- Media (Screenshot/Video placeholder) -->
            <div :class="feature.reverse ? 'lg:order-1' : ''">
              <div class="bg-gray-100 rounded-2xl overflow-hidden shadow-2xl">
                <!-- Video placeholder -->
                <div v-if="feature.hasVideo" class="relative aspect-video bg-gray-200 flex items-center justify-center group cursor-pointer" @click="playVideo(feature.id)">
                  <div class="absolute inset-0 bg-gradient-to-br from-primary-600/20 to-primary-800/30"></div>
                  <div class="relative z-10 w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-xl group-hover:scale-110 transition">
                    <svg class="w-8 h-8 text-primary-600 ml-1" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                  <span class="absolute bottom-4 left-4 text-white font-medium bg-black/50 px-3 py-1 rounded-full text-sm">
                    Watch demo
                  </span>
                </div>
                <!-- Screenshot placeholder -->
                <div v-else class="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                  <div class="text-center p-8">
                    <div class="w-16 h-16 bg-primary-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <svg class="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <p class="text-gray-500 text-sm">Screenshot coming soon</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- All Features Grid -->
    <section class="py-20 bg-gray-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <h2 class="text-3xl md:text-4xl font-display font-bold text-gray-900">
            Complete Feature Overview
          </h2>
          <p class="mt-4 text-xl text-gray-600">
            Everything you need to manage INR therapy efficiently
          </p>
        </div>

        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div 
            v-for="feature in features" 
            :key="feature.id"
            class="bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition cursor-pointer"
            @click="activeFeature = feature.id; scrollToFeature()"
          >
            <div class="w-12 h-12 rounded-xl flex items-center justify-center mb-4" :class="feature.iconBg">
              <component :is="feature.icon" class="w-6 h-6" :class="feature.iconColor" />
            </div>
            <h3 class="text-xl font-display font-bold text-gray-900 mb-2">{{ feature.title }}</h3>
            <p class="text-gray-600 text-sm">{{ feature.shortDesc }}</p>
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
          Start your free trial today. No credit card required.
        </p>
        <a 
          href="https://retroact.app/signup" 
          class="mt-8 inline-flex items-center justify-center px-8 py-4 rounded-xl bg-white text-primary-600 font-semibold hover:bg-gray-100 transition shadow-lg"
        >
          Get Started Free
          <svg class="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </a>
      </div>
    </section>
  </div>
</template>

<script setup>
useSeoMeta({
  title: 'Retroact - INR Management Software | Praxio',
  description: 'Discover how Retroact simplifies INR management for healthcare professionals. Track INR values, generate prescriptions, schedule appointments, and more.'
})

const activeFeature = ref('results')

const features = [
  {
    id: 'results',
    title: 'Recording INR Results',
    shortDesc: 'Quickly add INR measurements with automatic dose suggestions.',
    description: 'Record INR values in seconds and get intelligent dosage recommendations based on patient history and target range.',
    points: [
      'One-click INR entry with date picker',
      'Automatic dose calculation suggestions',
      'Visual trend indicators',
      'Notes and comments for each measurement'
    ],
    iconBg: 'bg-primary-100',
    iconColor: 'text-primary-600',
    hasVideo: true,
    reverse: false
  },
  {
    id: 'prescriptions',
    title: 'PDF Prescriptions',
    shortDesc: 'Generate professional prescription documents instantly.',
    description: 'Create beautiful, print-ready prescription PDFs with weekly dosage calendars that patients can easily follow.',
    points: [
      'Professional prescription layout',
      'Weekly dosage calendar view',
      'Customizable with your practice info',
      'Print or share digitally'
    ],
    iconBg: 'bg-secondary-100',
    iconColor: 'text-secondary-600',
    hasVideo: true,
    reverse: true
  },
  {
    id: 'appointments',
    title: 'Scheduling Appointments',
    shortDesc: 'Never miss a follow-up with integrated scheduling.',
    description: 'Schedule next INR check appointments directly from the patient record. Get reminders and keep track of upcoming visits.',
    points: [
      'Quick appointment scheduling',
      'Calendar integration',
      'Automatic reminders',
      'Appointment history tracking'
    ],
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
    hasVideo: true,
    reverse: false
  },
  {
    id: 'patients',
    title: 'Patient Management',
    shortDesc: 'Organize all your patients in one secure place.',
    description: 'Manage your patient list with powerful search and filtering. Access complete INR history and treatment details instantly.',
    points: [
      'Fast patient search',
      'Complete treatment history',
      'Target INR range settings',
      'Patient notes and annotations'
    ],
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-600',
    hasVideo: true,
    reverse: true
  },
  {
    id: 'analytics',
    title: 'INR Analytics',
    shortDesc: 'Visualize trends with intuitive charts and graphs.',
    description: 'See INR trends over time with beautiful charts. Identify patterns and optimize treatment with data-driven insights.',
    points: [
      'Interactive INR charts',
      'Time-in-therapeutic-range metrics',
      'Trend analysis',
      'Export data for reports'
    ],
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    hasVideo: false,
    reverse: false
  },
  {
    id: 'security',
    title: 'Security & Privacy',
    shortDesc: 'GDPR compliant with enterprise-grade security.',
    description: 'Your patients\' data is protected with industry-leading security measures. Fully GDPR compliant for European healthcare providers.',
    points: [
      'End-to-end encryption',
      'GDPR compliance',
      'Secure authentication',
      'Regular security audits'
    ],
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600',
    hasVideo: false,
    reverse: true
  }
]

// Icon components (inline SVG as functional components)
const IconChart = {
  template: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>'
}

// Assign icons to features
features.forEach(f => {
  f.icon = IconChart
})

const playVideo = (featureId) => {
  // TODO: Implement video modal/player
  console.log('Play video for:', featureId)
}

const scrollToFeature = () => {
  // Scroll to feature section
  window.scrollTo({ top: 400, behavior: 'smooth' })
}
</script>
