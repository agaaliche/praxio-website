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
              <div class="w-20 h-20 rounded-2xl flex items-center justify-center mb-6" :class="feature.iconBg">
                <span :class="feature.iconColor" v-html="feature.iconSvg"></span>
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
            <div class="w-16 h-16 rounded-xl flex items-center justify-center mb-4" :class="feature.iconBg">
              <span :class="feature.iconColor" v-html="feature.iconSvg"></span>
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
    id: 'doses',
    title: 'Dose Management & History',
    shortDesc: 'Flexible dosing with weekly schedules and one-time adjustments.',
    description: 'Manage warfarin dosing with ease. Set up recurring weekly schedules or make single-day adjustments when needed. View complete dose history at a glance.',
    points: [
      'Weekly recurring dose schedules',
      'Single-day dose adjustments',
      'Complete dose history display',
      'Refill management and reminders'
    ],
    iconBg: 'bg-teal-100',
    iconColor: 'text-teal-600',
    hasVideo: false,
    reverse: true
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
    id: 'ai-recommendations',
    title: 'AI-Powered Recommendations',
    shortDesc: 'Get intelligent dosage suggestions based on patient data.',
    description: 'Leverage AI to analyze patient INR history and generate clinical dose recommendations with clear rationale. Save time while ensuring evidence-based decisions.',
    points: [
      'AI-generated dose recommendations',
      'Clear clinical rationale',
      'Based on TTR and trend analysis',
      'Comprehensive patient reports'
    ],
    iconBg: 'bg-violet-100',
    iconColor: 'text-violet-600',
    hasVideo: false,
    reverse: true
  },
  {
    id: 'user-management',
    title: 'User Management',
    shortDesc: 'Work as a team with role-based access control.',
    description: 'Collaborate seamlessly with your team. Add authorized editors or viewers to share patient management while maintaining control over who can do what.',
    points: [
      'Role-based access (Owner, Editor, Viewer)',
      'Invite team members easily',
      'Granular permission control',
      'Audit trail of user actions'
    ],
    iconBg: 'bg-orange-100',
    iconColor: 'text-orange-600',
    hasVideo: false,
    reverse: false
  },
  {
    id: 'notes',
    title: 'Unified Notes Manager',
    shortDesc: 'AI-ready clinical notes in one organized place.',
    description: 'Keep all your clinical notes structured and accessible. Built for the age of AI, your notes become a powerful data container that powers intelligent recommendations.',
    points: [
      'Centralized notes for all patient data',
      'Structured format for AI analysis',
      'Quick note entry from any screen',
      'Searchable note history'
    ],
    iconBg: 'bg-cyan-100',
    iconColor: 'text-cyan-600',
    hasVideo: false,
    reverse: true
  },
  {
    id: 'export',
    title: 'Data Export & Backups',
    shortDesc: 'Export patient data and create secure backups.',
    description: 'Take control of your data. Export complete patient records in standard formats and create backups to ensure your valuable clinical data is always safe.',
    points: [
      'Export to CSV and PDF formats',
      'Complete patient data download',
      'Scheduled automatic backups',
      'Data portability compliance'
    ],
    iconBg: 'bg-slate-100',
    iconColor: 'text-slate-600',
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

// SVG illustrations - clean, minimal monochrome style
const icons = {
  'results': `<svg class="w-12 h-12" viewBox="0 0 48 48" fill="none">
    <rect x="8" y="6" width="24" height="32" rx="3" fill="currentColor" opacity="0.2"/>
    <rect x="12" y="12" width="14" height="2" rx="1" fill="currentColor"/>
    <rect x="12" y="18" width="10" height="2" rx="1" fill="currentColor" opacity="0.5"/>
    <rect x="12" y="24" width="12" height="2" rx="1" fill="currentColor" opacity="0.5"/>
    <circle cx="36" cy="34" r="8" fill="currentColor"/>
    <path d="M33 34h6M36 31v6" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
  </svg>`,
  'doses': `<svg class="w-12 h-12" viewBox="0 0 48 48" fill="none">
    <rect x="6" y="8" width="36" height="32" rx="3" fill="currentColor" opacity="0.15"/>
    <rect x="6" y="8" width="36" height="8" rx="3" fill="currentColor" opacity="0.3"/>
    <rect x="10" y="20" width="6" height="6" rx="1" fill="currentColor" opacity="0.3"/>
    <rect x="21" y="20" width="6" height="6" rx="1" fill="currentColor" opacity="0.5"/>
    <rect x="32" y="20" width="6" height="6" rx="1" fill="currentColor"/>
    <rect x="10" y="30" width="6" height="6" rx="1" fill="currentColor" opacity="0.4"/>
    <rect x="21" y="30" width="6" height="6" rx="1" fill="currentColor" opacity="0.6"/>
    <rect x="32" y="30" width="6" height="6" rx="1" fill="currentColor" opacity="0.3"/>
  </svg>`,
  'prescriptions': `<svg class="w-12 h-12" viewBox="0 0 48 48" fill="none">
    <rect x="8" y="4" width="28" height="36" rx="3" fill="currentColor" opacity="0.2"/>
    <path d="M36 12H8V4a3 3 0 013-3h22a3 3 0 013 3v8z" fill="currentColor" opacity="0.1"/>
    <rect x="14" y="18" width="18" height="2" rx="1" fill="currentColor"/>
    <rect x="14" y="24" width="14" height="2" rx="1" fill="currentColor" opacity="0.5"/>
    <rect x="14" y="30" width="16" height="2" rx="1" fill="currentColor" opacity="0.5"/>
    <circle cx="36" cy="36" r="8" fill="currentColor"/>
    <path d="M33 36h6M36 33v6" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
  </svg>`,
  'appointments': `<svg class="w-12 h-12" viewBox="0 0 48 48" fill="none">
    <rect x="6" y="10" width="36" height="32" rx="4" fill="currentColor" opacity="0.2"/>
    <rect x="6" y="10" width="36" height="10" fill="currentColor" opacity="0.3"/>
    <rect x="14" y="6" width="3" height="8" rx="1.5" fill="currentColor"/>
    <rect x="31" y="6" width="3" height="8" rx="1.5" fill="currentColor"/>
    <circle cx="17" cy="28" r="2" fill="currentColor" opacity="0.5"/>
    <circle cx="24" cy="28" r="2" fill="currentColor"/>
    <circle cx="31" cy="28" r="2" fill="currentColor" opacity="0.5"/>
    <circle cx="17" cy="36" r="2" fill="currentColor" opacity="0.3"/>
    <circle cx="24" cy="36" r="2" fill="currentColor" opacity="0.5"/>
    <circle cx="31" cy="36" r="2" fill="currentColor" opacity="0.3"/>
  </svg>`,
  'patients': `<i class="fa-duotone fa-users-medical w-12 h-12 text-3xl flex items-center justify-center"></i>`,
  'analytics': `<svg class="w-12 h-12" viewBox="0 0 48 48" fill="none">
    <rect x="8" y="28" width="6" height="14" rx="2" fill="currentColor" opacity="0.4"/>
    <rect x="18" y="20" width="6" height="22" rx="2" fill="currentColor" opacity="0.6"/>
    <rect x="28" y="12" width="6" height="30" rx="2" fill="currentColor"/>
    <rect x="38" y="22" width="6" height="20" rx="2" fill="currentColor" opacity="0.5"/>
    <circle cx="11" cy="18" r="2" fill="currentColor"/>
    <circle cx="21" cy="12" r="2" fill="currentColor"/>
    <circle cx="31" cy="6" r="2" fill="currentColor"/>
    <path d="M11 18l10-6 10-6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
  </svg>`,
  'ai-recommendations': `<svg class="w-12 h-12" viewBox="0 0 48 48" fill="none">
    <path d="M24 6l2.5 7.5L34 16l-7.5 2.5L24 26l-2.5-7.5L14 16l7.5-2.5z" fill="currentColor"/>
    <path d="M38 24l1.5 4.5L44 30l-4.5 1.5L38 36l-1.5-4.5L32 30l4.5-1.5z" fill="currentColor" opacity="0.6"/>
    <path d="M14 32l1 3 3 1-3 1-1 3-1-3-3-1 3-1z" fill="currentColor" opacity="0.4"/>
  </svg>`,
  'user-management': `<i class="fa-duotone fa-users w-12 h-12 text-3xl flex items-center justify-center"></i>`,
  'notes': `<svg class="w-12 h-12" viewBox="0 0 48 48" fill="none">
    <rect x="8" y="6" width="26" height="34" rx="3" fill="currentColor" opacity="0.2"/>
    <rect x="14" y="14" width="14" height="2" rx="1" fill="currentColor"/>
    <rect x="14" y="20" width="10" height="2" rx="1" fill="currentColor" opacity="0.5"/>
    <rect x="14" y="26" width="12" height="2" rx="1" fill="currentColor" opacity="0.5"/>
    <rect x="14" y="32" width="8" height="2" rx="1" fill="currentColor" opacity="0.5"/>
    <circle cx="38" cy="36" r="8" fill="currentColor"/>
    <path d="M35 36l2 2 4-4" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`,
  'export': `<svg class="w-12 h-12" viewBox="0 0 48 48" fill="none">
    <rect x="10" y="22" width="28" height="20" rx="3" fill="currentColor" opacity="0.2"/>
    <rect x="16" y="28" width="16" height="10" rx="2" fill="currentColor" opacity="0.3"/>
    <path d="M24 6v18" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
    <path d="M17 17l7 7 7-7" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`,
  'security': `<svg class="w-12 h-12" viewBox="0 0 48 48" fill="none">
    <path d="M24 4L8 12v12c0 11 6.8 20.4 16 24 9.2-3.6 16-13 16-24V12L24 4z" fill="currentColor" opacity="0.2"/>
    <path d="M24 10l-12 6v9c0 8.25 5.1 15.3 12 18 6.9-2.7 12-9.75 12-18v-9L24 10z" fill="currentColor" opacity="0.4"/>
    <path d="M18 26l4 4 8-8" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`
}

// Assign icon SVG strings to features
features.forEach(f => {
  f.iconSvg = icons[f.id] || icons['results']
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
