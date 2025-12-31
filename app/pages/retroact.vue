<template>
  <div>
    <!-- Breadcrumbs (Mobile Only) -->
    <nav class="pt-4 mb-4 md:hidden px-4 sm:px-6 lg:px-8">
      <ol class="flex items-center gap-2 text-sm text-primary-600">
        <li>
          <NuxtLink to="/" class="hover:text-primary-700 transition">{{ t('common.home') }}</NuxtLink>
        </li>
        <li class="text-primary-400">
          <i class="fa-solid fa-chevron-right text-xs"></i>
        </li>
        <li class="font-medium">
          {{ t('header.products') }}
        </li>
      </ol>
    </nav>
    
    <!-- Sticky Navigation Bar (appears when hero scrolls out) - Hidden on mobile -->
    <TheSubHeader class="hidden md:block" :class="showStickyNav ? 'opacity-100' : 'opacity-0 pointer-events-none'">
      <div class="flex items-center gap-4">
        <NuxtLink 
          to="/pricing" 
          class="inline-flex items-center px-4 py-2 rounded-lg bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 transition"
        >
          {{ t('retroact.hero.startFreeTrial') }}
        </NuxtLink>
        <button 
          @click="scrollToSection('feature-overview')"
          class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-primary-600 transition"
        >
          <i class="fa-solid fa-grid-2"></i>
          {{ t('header.featureOverview') }}
        </button>
        <button 
          @click="scrollToSection('in-action')"
          class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-primary-600 transition"
        >
          <i class="fa-solid fa-play"></i>
          {{ t('header.inAction') }}
        </button>
      </div>
    </TheSubHeader>

    <!-- Hero Section -->
    <section id="hero-section" class="bg-gradient-to-br from-primary-50 to-white py-20 md:py-28">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center max-w-3xl mx-auto">
          <h1 class="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-gray-900 leading-tight">
            <i class="fa-kit-duotone fa-logo text-primary-600"></i>
          </h1>
          <p class="mt-6 text-xl text-gray-600 leading-relaxed">
            <span class="text-primary-600">{{ t('retroact.hero.title') }}</span> {{ t('retroact.hero.subtitle') }}
          </p>
          <div class="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <NuxtLink 
              to="/pricing" 
              class="inline-flex items-center justify-center px-8 py-4 rounded-xl bg-primary-600 text-white font-semibold hover:bg-primary-700 transition shadow-lg"
            >
              {{ t('retroact.hero.startFreeTrial') }}
            </NuxtLink>
            <button 
              @click="scrollToSection('feature-overview')"
              class="inline-flex items-center justify-center px-8 py-4 rounded-xl bg-white text-primary-600 font-semibold border-2 border-primary-200 hover:border-primary-300 transition"
            >
              <i class="fa-solid fa-grid-2 mr-2"></i>
              {{ t('header.featureOverview') }}
            </button>
            <button 
              @click="scrollToSection('in-action')"
              class="inline-flex items-center justify-center px-8 py-4 rounded-xl bg-white text-primary-600 font-semibold border-2 border-primary-200 hover:border-primary-300 transition"
            >
              <i class="fa-solid fa-play mr-2"></i>
              {{ t('header.inAction') }}
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- Feature Overview -->
    <section id="feature-overview" class="py-16 bg-gray-50 scroll-mt-20">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <h2 class="text-3xl md:text-4xl font-display font-bold text-gray-900">
            {{ t('retroact.overview.title') }}
          </h2>
          <p class="mt-4 text-xl text-gray-600">
            {{ t('retroact.overview.subtitle') }}
          </p>
        </div>

        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div 
            v-for="feature in features" 
            :key="feature.id"
            class="bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition cursor-pointer"
            @click="scrollToFeature(feature.id)"
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

    <!-- In Action -->
    <section id="in-action" class="py-20 scroll-mt-20">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div class="text-center">
          <h2 class="text-3xl md:text-4xl font-display font-bold text-gray-900">
            {{ t('retroact.inAction.title') }}
          </h2>
          <p class="mt-4 text-xl text-gray-600">
            {{ t('retroact.inAction.subtitle') }}
          </p>
        </div>
      </div>
      
      <!-- Mobile Feature Selector -->
      <div class="lg:hidden bg-gradient-to-r from-gray-50 to-white border-b border-gray-200 px-4 pt-0 pb-4 mt-0">
        <!-- Navigation Arrows (Mobile) -->
        <div class="flex items-start sm:items-center justify-between gap-4 mb-4">
          <div class="flex items-center gap-2 shrink-0">
            <button 
              @click="prevFeature"
              class="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:text-primary-600 hover:border-primary-300 transition"
              :disabled="activeFeatureIndex === 0"
              :class="{ 'opacity-50 cursor-not-allowed': activeFeatureIndex === 0 }"
            >
              <i class="fa-solid fa-chevron-left text-sm"></i>
            </button>
            <button 
              @click="nextFeature"
              class="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:text-primary-600 hover:border-primary-300 transition"
              :disabled="activeFeatureIndex === features.length - 1"
              :class="{ 'opacity-50 cursor-not-allowed': activeFeatureIndex === features.length - 1 }"
            >
              <i class="fa-solid fa-chevron-right text-sm"></i>
            </button>
          </div>
        </div>
        
        <div class="relative">
          <!-- Custom Dropdown Button -->
          <button
            @click="mobileDropdownOpen = !mobileDropdownOpen"
            class="w-full flex items-center justify-between px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition shadow-sm hover:border-primary-300"
          >
            <span class="flex items-center gap-3 min-w-0 flex-1">
              <span :class="[currentMobileFeature.iconBg, currentMobileFeature.iconColor, 'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0']" v-html="currentMobileFeature.iconSvg"></span>
              <div class="text-left min-w-0 flex-1">
                <div class="text-sm font-semibold text-gray-900">{{ currentMobileFeature.title }}</div>
                <div class="text-xs text-gray-500 mt-0.5 truncate">{{ currentMobileFeature.shortDesc }}</div>
              </div>
            </span>
            <svg 
              class="w-5 h-5 text-primary-600 transition-transform flex-shrink-0 ml-2" 
              :class="{ 'rotate-180': mobileDropdownOpen }"
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          <!-- Custom Dropdown Menu -->
          <Transition
            enter-active-class="transition ease-out duration-200"
            enter-from-class="transform opacity-0"
            enter-to-class="transform opacity-100"
            leave-active-class="transition ease-in duration-150"
            leave-from-class="transform opacity-100"
            leave-to-class="transform opacity-0"
          >
            <div 
              v-if="mobileDropdownOpen"
              class="fixed inset-0 z-50 flex items-start justify-center p-2.5 bg-primary-600/25"
              @click.self="mobileDropdownOpen = false"
            >
              <div class="w-full max-w-2xl bg-white rounded-xl shadow-2xl overflow-hidden my-2">
                <!-- Header with Close Button -->
                <div class="sticky top-0 bg-white border-b border-gray-200 px-4 py-4 flex items-center justify-between">
                  <h3 class="text-lg font-semibold text-gray-900">Select Feature</h3>
                  <button 
                    @click="mobileDropdownOpen = false"
                    class="w-9 h-9 rounded-lg flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition"
                  >
                    <i class="fa-solid fa-xmark text-xl"></i>
                  </button>
                </div>
                
                <!-- Feature List -->
                <div class="overflow-y-auto" style="max-height: calc(100vh - 101px);">
                  <button
                    v-for="(feature, index) in mobileFeatures"
                    :key="feature.id"
                    @click="selectFeature(index)"
                    class="w-full flex items-center gap-3 px-4 py-4 text-left transition hover:bg-gray-50 border-b border-gray-100"
                    :class="activeFeatureIndex === index ? 'bg-primary-50' : ''"
                  >
                    <span :class="[feature.iconBg, feature.iconColor, 'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0']" v-html="feature.iconSvg"></span>
                    <div class="flex-1 min-w-0">
                      <div class="text-sm font-medium" :class="activeFeatureIndex === index ? 'text-primary-700' : 'text-gray-900'">
                        {{ feature.title }}
                      </div>
                      <div class="text-xs text-gray-500 mt-0.5">{{ feature.shortDesc }}</div>
                    </div>
                    <i v-if="activeFeatureIndex === index" class="fa-solid fa-check text-primary-600 flex-shrink-0"></i>
                  </button>
                </div>
              </div>
            </div>
          </Transition>
        </div>
      </div>

      <div class="h-full flex gap-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-6 overflow-x-hidden">
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

        <!-- Main Content Area -->
        <div class="flex-1 relative min-w-0">
          <div ref="scrollContainer" class="lg:absolute lg:inset-0 overflow-y-auto custom-scrollbar bg-white rounded-2xl overflow-x-hidden w-full">
            <div class="pt-0 px-4 pb-4 sm:px-6 sm:pb-6 lg:px-8 lg:pb-8 max-w-full w-full">
            
            <!-- Media Area -->
            <div class="relative aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl overflow-hidden shadow-lg mb-8 w-full max-w-full">
              <template v-if="currentFeature.hasVideo">
                <div class="absolute inset-0 flex items-center justify-center cursor-pointer group" @click="playVideo(currentFeature.id)">
                  <div class="absolute inset-0 bg-gradient-to-br from-primary-600/10 to-primary-800/20"></div>
                  <div class="relative z-10 w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 transition">
                    <svg class="w-8 h-8 text-primary-600 ml-1" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                  <span class="absolute bottom-4 left-4 text-white font-medium bg-black/50 px-3 py-1.5 rounded-full text-sm">
                    {{ t('retroact.inAction.watchDemo') }}
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
                    <p class="text-gray-500">{{ t('retroact.inAction.screenshotSoon') }}</p>
                  </div>
                </div>
              </template>
            </div>

            <!-- Description -->
            <p class="text-gray-600 leading-relaxed mb-6">
              {{ t(currentFeature.description) }}
            </p>

            <!-- Feature Points - Horizontal Chips -->
            <div class="flex flex-wrap gap-2">
              <span 
                v-for="(point, index) in t(currentFeature.points)" 
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
          {{ t('retroact.cta.title') }}
        </h2>
        <p class="mt-4 text-xl text-primary-100">
          {{ t('retroact.cta.subtitle') }}
        </p>
        <NuxtLink 
          to="/pricing" 
          class="mt-8 inline-flex items-center justify-center px-8 py-4 rounded-xl bg-white text-primary-600 font-semibold hover:bg-gray-100 transition shadow-lg"
        >
          {{ t('retroact.cta.button') }}
          <svg class="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </NuxtLink>
      </div>
    </section>
  </div>
</template>

<script setup>
import { useOverlayScrollbar } from '~/composables/useOverlayScrollbar'

const { t } = useI18n()

useSeoMeta({
  title: 'Retroact - INR Management Software | Praxio',
  description: 'Discover how Retroact simplifies INR management for healthcare professionals. Track INR values, generate prescriptions, schedule appointments, and more.'
})

const activeFeatureIndex = ref(0)
const showStickyNav = ref(false)
const mobileDropdownOpen = ref(false)
const heroSection = ref(null)
const { setVisible } = useSubHeaderState()

// Sync showStickyNav with global sub-header state
watch(showStickyNav, (newVal) => {
  setVisible(newVal)
})

// Detect when hero section scrolls out of view
onMounted(() => {
  let isScrolling = false
  
  const observer = new IntersectionObserver(
    (entries) => {
      // Don't update during smooth scroll
      if (isScrolling) return
      
      entries.forEach((entry) => {
        // Show sticky nav when hero is not visible
        showStickyNav.value = !entry.isIntersecting
      })
    },
    {
      threshold: 0.1, // Trigger when 10% of hero is visible
      rootMargin: '-80px 0px 0px 0px' // Account for header height
    }
  )
  
  // Observe the hero section
  const heroEl = document.querySelector('#hero-section')
  if (heroEl) {
    observer.observe(heroEl)
  }
  
  // Detect when smooth scrolling starts and ends
  let scrollTimeout
  window.addEventListener('scroll', () => {
    isScrolling = true
    clearTimeout(scrollTimeout)
    scrollTimeout = setTimeout(() => {
      isScrolling = false
      // Manually check visibility after scroll ends to match IntersectionObserver behavior
      if (heroEl) {
        const rect = heroEl.getBoundingClientRect()
        const viewportTop = 80 // rootMargin adjustment
        const viewportBottom = window.innerHeight
        const elementHeight = rect.height
        
        // Calculate visible portion
        const visibleTop = Math.max(rect.top, viewportTop)
        const visibleBottom = Math.min(rect.bottom, viewportBottom)
        const visibleHeight = Math.max(0, visibleBottom - visibleTop)
        const visibleRatio = elementHeight > 0 ? visibleHeight / elementHeight : 0
        
        // Show sticky nav when less than 10% of hero is visible (matching threshold: 0.1)
        showStickyNav.value = visibleRatio < 0.1
      }
    }, 100)
  }, { passive: true })
  
  onUnmounted(() => {
    if (heroEl) {
      observer.unobserve(heroEl)
    }
  })
})

// Function to smooth scroll to a section
const scrollToSection = (sectionId) => {
  const section = document.getElementById(sectionId)
  if (section) {
    // Temporarily disable observer to prevent flickering
    const heroEl = document.querySelector('#hero-section')
    const currentObserver = heroEl?._observer
    
    const offset = 80 // Account for header height
    const elementPosition = section.getBoundingClientRect().top
    const offsetPosition = elementPosition + window.pageYOffset - offset
    
    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    })
  }
}

// Function to scroll to In Action section and select feature
const scrollToFeature = (featureId) => {
  const index = features.findIndex(f => f.id === featureId)
  if (index !== -1) {
    activeFeatureIndex.value = index
  }
  scrollToSection('in-action')
}

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

// Computed property for mobile dropdown with smaller icons
const mobileFeatures = computed(() => 
  features.map(f => ({
    ...f,
    iconSvg: icons[f.id]?.replace('w-12 h-12 text-3xl', 'text-[1.85rem]') || icons['results'].replace('w-12 h-12 text-3xl', 'text-[1.85rem]')
  }))
)

const currentMobileFeature = computed(() => mobileFeatures.value[activeFeatureIndex.value])

// Select feature and close dropdown
const selectFeature = (index) => {
  activeFeatureIndex.value = index
  mobileDropdownOpen.value = false
}

// Prevent background scrolling when dropdown is open
watch(mobileDropdownOpen, (isOpen) => {
  if (isOpen) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
})

// Clean up on unmount
onUnmounted(() => {
  document.body.style.overflow = ''
})

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
    title: computed(() => t('retroact.features.results.title')),
    shortDesc: computed(() => t('retroact.features.results.shortDesc')),
    description: 'retroact.features.results.description',
    points: 'retroact.features.results.points',
    iconBg: 'bg-primary-100',
    iconColor: 'text-primary-600',
    hasVideo: true,
    reverse: false
  },
  {
    id: 'doses',
    title: computed(() => t('retroact.features.doses.title')),
    shortDesc: computed(() => t('retroact.features.doses.shortDesc')),
    description: 'retroact.features.doses.description',
    points: 'retroact.features.doses.points',
    iconBg: 'bg-teal-100',
    iconColor: 'text-teal-600',
    hasVideo: false,
    reverse: true
  },
  {
    id: 'prescriptions',
    title: computed(() => t('retroact.features.prescriptions.title')),
    shortDesc: computed(() => t('retroact.features.prescriptions.shortDesc')),
    description: 'retroact.features.prescriptions.description',
    points: 'retroact.features.prescriptions.points',
    iconBg: 'bg-secondary-100',
    iconColor: 'text-secondary-600',
    hasVideo: true,
    reverse: true
  },
  {
    id: 'appointments',
    title: computed(() => t('retroact.features.appointments.title')),
    shortDesc: computed(() => t('retroact.features.appointments.shortDesc')),
    description: 'retroact.features.appointments.description',
    points: 'retroact.features.appointments.points',
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
    hasVideo: true,
    reverse: false
  },
  {
    id: 'patients',
    title: computed(() => t('retroact.features.patients.title')),
    shortDesc: computed(() => t('retroact.features.patients.shortDesc')),
    description: 'retroact.features.patients.description',
    points: 'retroact.features.patients.points',
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-600',
    hasVideo: true,
    reverse: true
  },
  {
    id: 'analytics',
    title: computed(() => t('retroact.features.analytics.title')),
    shortDesc: computed(() => t('retroact.features.analytics.shortDesc')),
    description: 'retroact.features.analytics.description',
    points: 'retroact.features.analytics.points',
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-600',
    hasVideo: false,
    reverse: false
  },
  {
    id: 'ai-recommendations',
    title: computed(() => t('retroact.features.aiRecommendations.title')),
    shortDesc: computed(() => t('retroact.features.aiRecommendations.shortDesc')),
    description: 'retroact.features.aiRecommendations.description',
    points: 'retroact.features.aiRecommendations.points',
    iconBg: 'bg-violet-100',
    iconColor: 'text-violet-600',
    hasVideo: false,
    reverse: true
  },
  {
    id: 'user-management',
    title: computed(() => t('retroact.features.userManagement.title')),
    shortDesc: computed(() => t('retroact.features.userManagement.shortDesc')),
    description: 'retroact.features.userManagement.description',
    points: 'retroact.features.userManagement.points',
    iconBg: 'bg-red-50',
    iconColor: 'text-red-600',
    hasVideo: false,
    reverse: false
  },
  {
    id: 'notes',
    title: computed(() => t('retroact.features.notes.title')),
    shortDesc: computed(() => t('retroact.features.notes.shortDesc')),
    description: 'retroact.features.notes.description',
    points: 'retroact.features.notes.points',
    iconBg: 'bg-cyan-100',
    iconColor: 'text-cyan-600',
    hasVideo: false,
    reverse: true
  },
  {
    id: 'export',
    title: computed(() => t('retroact.features.export.title')),
    shortDesc: computed(() => t('retroact.features.export.shortDesc')),
    description: 'retroact.features.export.description',
    points: 'retroact.features.export.points',
    iconBg: 'bg-slate-100',
    iconColor: 'text-slate-600',
    hasVideo: false,
    reverse: false
  },
  {
    id: 'security',
    title: computed(() => t('retroact.features.security.title')),
    shortDesc: computed(() => t('retroact.features.security.shortDesc')),
    description: 'retroact.features.security.description',
    points: 'retroact.features.security.points',
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600',
    hasVideo: false,
    reverse: true
  },
  {
    id: 'data-residency',
    title: computed(() => t('retroact.features.dataResidency.title')),
    shortDesc: computed(() => t('retroact.features.dataResidency.shortDesc')),
    description: 'retroact.features.dataResidency.description',
    points: 'retroact.features.dataResidency.points',
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