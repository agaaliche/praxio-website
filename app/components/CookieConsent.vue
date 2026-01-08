<template>
  <Teleport to="body">
    <!-- Main Consent Banner -->
    <Transition
      enter-active-class="transition ease-out duration-300"
      enter-from-class="transform translate-y-full opacity-0"
      enter-to-class="transform translate-y-0 opacity-100"
      leave-active-class="transition ease-in duration-200"
      leave-from-class="transform translate-y-0 opacity-100"
      leave-to-class="transform translate-y-full opacity-0"
    >
      <div
        v-if="showBanner"
        class="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-primary-600 shadow-2xl z-[9999] p-4 md:p-6"
      >
        <div class="max-w-7xl mx-auto">
          <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div class="flex-1">
              <h3 class="text-lg font-bold text-gray-900 mb-2">
                {{ t('cookieConsent.title') }}
              </h3>
              <p class="text-sm text-gray-600 mb-3 md:mb-0">
                {{ t('cookieConsent.description') }}
              </p>
            </div>
            <div class="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <button
                @click="showPreferences = true"
                class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                {{ t('cookieConsent.customize') }}
              </button>
              <button
                @click="rejectAll"
                class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                {{ t('cookieConsent.rejectAll') }}
              </button>
              <button
                @click="acceptAll"
                class="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition"
              >
                {{ t('cookieConsent.acceptAll') }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Preferences Modal -->
    <Transition
      enter-active-class="transition ease-out duration-300"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition ease-in duration-200"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="showPreferences"
        class="fixed inset-0 bg-black/50 z-[10000] flex items-center justify-center p-4"
        @click.self="showPreferences = false"
      >
        <div class="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div class="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <h2 class="text-xl font-bold text-gray-900">
              {{ t('cookieConsent.detailedSettings') }}
            </h2>
            <button
              @click="showPreferences = false"
              class="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-500 transition"
            >
              <i class="fa-solid fa-xmark text-lg"></i>
            </button>
          </div>

          <div class="p-6 space-y-6">
            <!-- Essential Cookies -->
            <div class="border border-gray-200 rounded-xl p-4">
              <div class="flex items-start justify-between mb-3">
                <div class="flex-1">
                  <h3 class="font-bold text-gray-900 mb-1">
                    {{ t('cookieConsent.essential.title') }}
                  </h3>
                  <span class="inline-block px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-600 rounded">
                    {{ t('cookieConsent.required') }}
                  </span>
                </div>
              </div>
              <p class="text-sm text-gray-600 mb-2">
                {{ t('cookieConsent.essential.description') }}
              </p>
              <ul class="text-sm text-gray-600 list-disc list-inside space-y-1">
                <li>{{ t('cookieConsent.essential.auth') }}</li>
                <li>{{ t('cookieConsent.essential.preferences') }}</li>
                <li>{{ t('cookieConsent.essential.security') }}</li>
              </ul>
            </div>

            <!-- Functional Cookies -->
            <div class="border border-gray-200 rounded-xl p-4">
              <div class="flex items-start justify-between mb-3">
                <div class="flex-1">
                  <h3 class="font-bold text-gray-900">
                    {{ t('cookieConsent.functional.title') }}
                  </h3>
                </div>
                <label class="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    v-model="preferences.functional"
                    class="sr-only peer"
                  >
                  <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>
              <p class="text-sm text-gray-600 mb-2">
                {{ t('cookieConsent.functional.description') }}
              </p>
              <ul class="text-sm text-gray-600 list-disc list-inside space-y-1">
                <li>{{ t('cookieConsent.functional.language') }}</li>
                <li>{{ t('cookieConsent.functional.display') }}</li>
              </ul>
            </div>

            <!-- Analytics Cookies -->
            <div class="border border-gray-200 rounded-xl p-4">
              <div class="flex items-start justify-between mb-3">
                <div class="flex-1">
                  <h3 class="font-bold text-gray-900">
                    {{ t('cookieConsent.analytics.title') }}
                  </h3>
                </div>
                <label class="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    v-model="preferences.analytics"
                    class="sr-only peer"
                  >
                  <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>
              <p class="text-sm text-gray-600 mb-2">
                {{ t('cookieConsent.analytics.description') }}
              </p>
              <ul class="text-sm text-gray-600 list-disc list-inside space-y-1">
                <li>{{ t('cookieConsent.analytics.performance') }}</li>
                <li>{{ t('cookieConsent.analytics.usage') }}</li>
              </ul>
            </div>
          </div>

          <div class="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
            <button
              @click="showPreferences = false"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              {{ t('common.cancel') }}
            </button>
            <button
              @click="savePreferences"
              class="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition"
            >
              {{ t('common.save') }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const { t } = useI18n()

const CONSENT_KEY = 'cookie-consent'
const PREFERENCES_KEY = 'cookie-preferences'

const showBanner = ref(false)
const showPreferences = ref(false)

const preferences = ref({
  essential: true, // Always true, can't be disabled
  functional: false,
  analytics: false
})

const loadPreferences = () => {
  const savedConsent = localStorage.getItem(CONSENT_KEY)
  const savedPreferences = localStorage.getItem(PREFERENCES_KEY)
  
  if (savedConsent) {
    // User has already made a choice
    showBanner.value = false
    
    if (savedPreferences) {
      try {
        const parsed = JSON.parse(savedPreferences)
        preferences.value = { ...preferences.value, ...parsed }
      } catch (e) {
        console.error('Failed to parse cookie preferences:', e)
      }
    }
  } else {
    // Show banner after a short delay
    setTimeout(() => {
      showBanner.value = true
    }, 1000)
  }
}

const saveConsent = (consentType) => {
  localStorage.setItem(CONSENT_KEY, consentType)
  localStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences.value))
  showBanner.value = false
  showPreferences.value = false
  
  // Apply preferences (e.g., load analytics scripts if enabled)
  applyPreferences()
}

const acceptAll = () => {
  preferences.value = {
    essential: true,
    functional: true,
    analytics: true
  }
  saveConsent('all')
}

const rejectAll = () => {
  preferences.value = {
    essential: true,
    functional: false,
    analytics: false
  }
  saveConsent('essential')
}

const savePreferences = () => {
  const hasAccepted = preferences.value.functional || preferences.value.analytics
  saveConsent(hasAccepted ? 'custom' : 'essential')
}

const applyPreferences = () => {
  // Here you would enable/disable analytics, tracking, etc.
  // For example, load Google Analytics only if analytics is enabled
  if (preferences.value.analytics) {
    // Load analytics scripts
    console.log('Analytics enabled')
  }
  
  if (preferences.value.functional) {
    // Enable functional features
    console.log('Functional cookies enabled')
  }
}

onMounted(() => {
  loadPreferences()
})
</script>
