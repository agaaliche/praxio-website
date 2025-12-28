<template>
  <div>
    <!-- Level 2 Navigation Bar -->
    <TheSubHeader :hide-on-scroll-down="true">
      <button 
        @click="activeTab = 'retroact'"
        class="text-sm font-medium border-b-2 h-full flex items-center transition"
        :class="activeTab === 'retroact' ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-600 hover:text-primary-600'"
      >
        Retroact
      </button>
      <button 
        @click="activeTab = 'overview'"
        class="text-sm font-medium border-b-2 h-full flex items-center transition"
        :class="activeTab === 'overview' ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-600 hover:text-primary-600'"
      >
        <i class="fa-solid fa-grid-2 mr-2"></i>
        Feature Overview
      </button>
      <button 
        @click="activeTab = 'action'"
        class="text-sm font-medium border-b-2 h-full flex items-center transition"
        :class="activeTab === 'action' ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-600 hover:text-primary-600'"
      >
        <i class="fa-solid fa-play mr-2"></i>
        In Action
      </button>
    </TheSubHeader>

    <!-- Hero Section - Only shown in Retroact tab -->
    <section v-show="activeTab === 'retroact'" class="bg-gradient-to-br from-primary-50 to-white py-20">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center max-w-3xl mx-auto">
          <h1 class="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-gray-900 leading-tight">
            <i class="fa-kit-duotone fa-logo text-primary-600"></i>
          </h1>
          <p class="mt-6 text-xl text-gray-600 leading-relaxed">
            <span class="text-primary-600">INR Management Made Simple.</span> The complete solution for healthcare professionals managing anticoagulant therapy. 
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

    <!-- Feature Overview Tab -->
    <section v-show="activeTab === 'overview'" class="py-20 bg-gray-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <h2 class="text-3xl md:text-4xl font-display font-bold text-gray-900">
            Dosing Done Right
          </h2>
          <p class="mt-4 text-xl text-gray-600">
            Powerful features for consistent dosing decisions
          </p>
        </div>

        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div 
            v-for="feature in features" 
            :key="feature.id"
            class="bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition cursor-pointer"
            @click="activeFeature = feature.id; activeTab = 'action'"
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

    <!-- In Action Tab - Side Navigation Style -->
    <section v-show="activeTab === 'action'" class="h-[calc(100vh-8rem)]">
      <div class="h-full flex gap-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <!-- Left Sidebar - Feature Navigation (matches account settings style) -->
        <aside class="w-56 shrink-0 hidden lg:block">
          <div class="bg-white rounded-2xl border border-gray-200 p-3 sticky top-4">
            <nav class="space-y-1">
              <button 
                v-for="(feature, index) in features" 
                :key="feature.id"
                @click="activeFeatureIndex = index"
                class="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl transition text-left"
                :class="activeFeatureIndex === index 
                  ? 'bg-primary-50 text-primary-700 border border-primary-100' 
                  : 'text-gray-600 hover:bg-gray-50'"
              >
                <i :class="[feature.iconClass, 'w-5 text-center']"></i>
                {{ feature.title }}
              </button>
            </nav>
          </div>
        </aside>

        <!-- Mobile Feature Selector -->
        <div class="lg:hidden absolute top-0 left-0 right-0 bg-white border-b border-gray-200 p-3 z-10">
          <select 
            v-model="activeFeatureIndex" 
            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option v-for="(feature, index) in features" :key="feature.id" :value="index">
              {{ feature.title }}
            </option>
          </select>
        </div>

        <!-- Main Content Area -->
        <div class="flex-1 relative">
          <div ref="scrollContainer" class="absolute inset-0 overflow-y-auto custom-scrollbar bg-white rounded-2xl">
            <div class="p-6 lg:p-8 pt-16 lg:pt-8">
            <!-- Feature Header with Navigation -->
            <div class="flex items-center justify-between mb-6">
              <div class="flex items-center gap-4">
                <div class="w-12 h-12 rounded-xl flex items-center justify-center" :class="currentFeature.iconBg">
                  <span :class="currentFeature.iconColor" v-html="currentFeature.iconSvg"></span>
                </div>
                <div>
                  <h2 class="text-xl lg:text-2xl font-display font-bold text-gray-900">
                    {{ currentFeature.title }}
                  </h2>
                  <p class="text-gray-500 text-sm">{{ currentFeature.shortDesc }}</p>
                </div>
              </div>
              <!-- Navigation Arrows -->
              <div class="flex items-center gap-2">
                <button 
                  @click="prevFeature"
                  class="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:text-primary-600 hover:border-primary-300 transition"
                  :class="{ 'opacity-40 cursor-not-allowed': activeFeatureIndex === 0 }"
                  :disabled="activeFeatureIndex === 0"
                >
                  <i class="fa-solid fa-chevron-left text-sm"></i>
                </button>
                <button 
                  @click="nextFeature"
                  class="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:text-primary-600 hover:border-primary-300 transition"
                  :class="{ 'opacity-40 cursor-not-allowed': activeFeatureIndex === features.length - 1 }"
                  :disabled="activeFeatureIndex === features.length - 1"
                >
                  <i class="fa-solid fa-chevron-right text-sm"></i>
                </button>
              </div>
            </div>

            <!-- Media Area -->
            <div class="relative aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl overflow-hidden shadow-lg mb-8">
              <template v-if="currentFeature.hasVideo">
                <div class="absolute inset-0 flex items-center justify-center cursor-pointer group" @click="playVideo(currentFeature.id)">
                  <div class="absolute inset-0 bg-gradient-to-br from-primary-600/10 to-primary-800/20"></div>
                  <div class="relative z-10 w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 transition">
                    <svg class="w-8 h-8 text-primary-600 ml-1" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                  <span class="absolute bottom-4 left-4 text-white font-medium bg-black/50 px-3 py-1.5 rounded-full text-sm">
                    Watch demo
                  </span>
                </div>
              </template>
              <template v-else>
                <div class="absolute inset-0 flex items-center justify-center">
                  <div class="text-center">
                    <div class="w-16 h-16 bg-primary-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <svg class="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <p class="text-gray-500">Screenshot coming soon</p>
                  </div>
                </div>
              </template>
            </div>

            <!-- Description -->
            <p class="text-gray-600 leading-relaxed mb-6">
              {{ currentFeature.description }}
            </p>

            <!-- Feature Points - Horizontal Chips -->
            <div class="flex flex-wrap gap-2">
              <span 
                v-for="(point, index) in currentFeature.points" 
                :key="index" 
                class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium"
                :class="[currentFeature.iconBg, currentFeature.iconColor]"
              >
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                {{ point }}
              </span>
            </div>
            </div>
          </div>

          <!-- Overlay Scrollbar -->
          <div 
            v-if="isScrollable"
            class="overlay-scrollbar-track"
            :class="{ visible: scrollbarVisible || isDragging }"
            @click="handleTrackClick"
          >
            <div 
              class="overlay-scrollbar-thumb"
              :style="{ height: thumbHeight + 'px', top: thumbTop + 'px' }"
              @mousedown="handleThumbMouseDown"
            ></div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="py-20 bg-primary-600">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 class="text-3xl md:text-4xl font-display font-bold text-white">
          Join healthcare professionals who work smarter.
        </h2>
        <p class="mt-4 text-xl text-primary-100">
          Start your free trial — no credit card required.
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
import { useOverlayScrollbar } from '~/composables/useOverlayScrollbar'

useSeoMeta({
  title: 'Retroact - INR Management Software | Praxio',
  description: 'Discover how Retroact simplifies INR management for healthcare professionals. Track INR values, generate prescriptions, schedule appointments, and more.'
})

const activeTab = ref('retroact')
const activeFeatureIndex = ref(0)

// Custom scrollbar for In Action content
const scrollContainer = ref(null)
const { 
  scrollbarVisible, 
  isDragging, 
  thumbHeight, 
  thumbTop, 
  isScrollable, 
  handleThumbMouseDown, 
  handleTrackClick 
} = useOverlayScrollbar(scrollContainer)

// Computed property for current feature in carousel
const currentFeature = computed(() => features[activeFeatureIndex.value])

// Carousel navigation
const prevFeature = () => {
  if (activeFeatureIndex.value > 0) {
    activeFeatureIndex.value--
  }
}

const nextFeature = () => {
  if (activeFeatureIndex.value < features.length - 1) {
    activeFeatureIndex.value++
  }
}

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
  },
  {
    id: 'data-residency',
    title: 'Data Residency & Compliance',
    shortDesc: 'Choose where your data is stored with country-specific options.',
    description: 'Meet local regulatory requirements with country-specific data residency. Your patient data stays within your jurisdiction, ensuring compliance with regional healthcare regulations.',
    points: [
      'Country-specific data storage',
      'Regional compliance support',
      'Data sovereignty guaranteed',
      'Multi-region availability'
    ],
    iconBg: 'bg-indigo-100',
    iconColor: 'text-indigo-600',
    hasVideo: false,
    reverse: false
  }
]

// SVG illustrations - clean, minimal monochrome style
const icons = {
  'results': `<i class="fa-duotone fa-vial-circle-check w-12 h-12 text-3xl flex items-center justify-center"></i>`,
  'doses': `<i class="fa-duotone fa-prescription-bottle-pill w-12 h-12 text-3xl flex items-center justify-center"></i>`,
  'prescriptions': `<i class="fa-duotone fa-file-pdf w-12 h-12 text-3xl flex items-center justify-center"></i>`,
  'appointments': `<i class="fa-duotone fa-calendar-day w-12 h-12 text-3xl flex items-center justify-center"></i>`,
  'patients': `<i class="fa-duotone fa-users-medical w-12 h-12 text-3xl flex items-center justify-center"></i>`,
  'analytics': `<i class="fa-duotone fa-chart-column w-12 h-12 text-3xl flex items-center justify-center"></i>`,
  'ai-recommendations': `<i class="fa-duotone fa-sparkles w-12 h-12 text-3xl flex items-center justify-center"></i>`,
  'user-management': `<i class="fa-duotone fa-user-doctor w-12 h-12 text-3xl flex items-center justify-center"></i>`,
  'notes': `<i class="fa-duotone fa-note w-12 h-12 text-3xl flex items-center justify-center"></i>`,
  'export': `<i class="fa-duotone fa-floppy-disk w-12 h-12 text-3xl flex items-center justify-center"></i>`,
  'security': `<i class="fa-duotone fa-shield-check w-12 h-12 text-3xl flex items-center justify-center"></i>`,
  'data-residency': `<i class="fa-duotone fa-file-certificate w-12 h-12 text-3xl flex items-center justify-center"></i>`
}

// Assign icon SVG strings to features
features.forEach(f => {
  f.iconSvg = icons[f.id] || icons['results']
})

const playVideo = (featureId) => {
  // TODO: Implement video modal/player
  console.log('Play video for:', featureId)
}
</script>
<style scoped>
/* Hide the capsule pill (primary layer), keep only the round tablet */
.retroact-tablet-icon {
  --fa-primary-opacity: 0;
  --fa-secondary-opacity: 1;
}

/* Hide native scrollbar */
.custom-scrollbar::-webkit-scrollbar {
  display: none;
}

.custom-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

/* Overlay scrollbar track */
.overlay-scrollbar-track {
  position: absolute;
  top: 8px;
  right: 4px;
  bottom: 8px;
  width: 10px;
  opacity: 0;
  transition: opacity 0.15s ease;
  pointer-events: none;
  z-index: 100;
  border-radius: 5px;
}

.overlay-scrollbar-track.visible {
  opacity: 1;
  pointer-events: auto;
}

/* Overlay scrollbar thumb */
.overlay-scrollbar-thumb {
  position: absolute;
  top: 0;
  right: 0;
  width: 10px;
  background-color: rgba(0, 0, 0, 0.3);
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.15s ease;
  pointer-events: auto;
}

.overlay-scrollbar-thumb:hover {
  background-color: rgba(0, 0, 0, 0.5);
}

.overlay-scrollbar-thumb:active {
  background-color: rgba(0, 0, 0, 0.7);
}
</style>