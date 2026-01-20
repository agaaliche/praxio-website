import { ref, computed } from 'vue'
import { 
  translations, 
  SUPPORTED_LOCALES, 
  DEFAULT_LOCALE,
  getNestedValue,
  initLanguage,
  setStoredLanguage,
  getLanguageFromCookie
} from '@praxio/i18n'

// CRITICAL: Initialize locale IMMEDIATELY on module load, BEFORE any component renders
// This ensures SSR gets the correct locale from the start
function getInitialLocale() {
  if (typeof window !== 'undefined') {
    // Client: try localStorage/cookie
    return initLanguage()
  } else {
    // SSR: try to get from Nuxt's SSR context (will be set by plugin)
    // For now, default to DEFAULT_LOCALE - plugin will update it immediately
    return DEFAULT_LOCALE
  }
}

const currentLocale = ref(getInitialLocale())
let isInitialized = false

export const useI18n = () => {
  /**
   * Initialize locale on first use
   * @param {string} ssrLocale - Optional locale from SSR (cookie)
   */
  const init = (ssrLocale) => {
    if (isInitialized) return
    isInitialized = true
    
    if (typeof window !== 'undefined') {
      // Client-side: use localStorage/cookie
      const clientLocale = initLanguage()
      currentLocale.value = clientLocale
      console.log(`🌐 Client i18n: Initialized with locale: ${clientLocale}`)
      
      // Listen for language changes from other apps
      window.addEventListener('storage', (e) => {
        if (e.key === 'praxio_language' && e.newValue) {
          if (SUPPORTED_LOCALES.includes(e.newValue)) {
            currentLocale.value = e.newValue
          }
        }
      })
      
      // Listen for custom language change events (same-window updates)
      window.addEventListener('praxio:language-change', (e) => {
        if (e.detail?.locale && SUPPORTED_LOCALES.includes(e.detail.locale)) {
          currentLocale.value = e.detail.locale
        }
      })
    } else if (ssrLocale && SUPPORTED_LOCALES.includes(ssrLocale)) {
      // Server-side: use provided locale from cookie
      currentLocale.value = ssrLocale
      console.log(`🌐 SSR i18n: Using locale from cookie: ${ssrLocale}`)
    }
  }

  /**
   * Get translation by key
   * @param {string} key - Translation key in dot notation (e.g., 'header.products')
   * @param {Object} params - Parameters for interpolation (e.g., { days: 5 })
   * @returns {string} - Translated text with interpolated values
   */
  const t = (key, params = {}) => {
    const locale = currentLocale.value
    const translation = translations[locale]
    let text = getNestedValue(translation, key)
    
    // Interpolate parameters
    if (params && typeof text === 'string') {
      Object.keys(params).forEach(param => {
        text = text.replace(new RegExp(`\\{${param}\\}`, 'g'), params[param])
      })
    }
    
    return text
  }

  /**
   * Set current locale
   * @param {string} locale - Locale code
   */
  const setLocale = (locale) => {
    if (!SUPPORTED_LOCALES.includes(locale)) {
      console.warn(`Locale "${locale}" is not supported`)
      return
    }
    currentLocale.value = locale
    setStoredLanguage(locale)
  }

  /**
   * Get current locale
   */
  const locale = computed(() => currentLocale.value)

  /**
   * Get available locales
   */
  const locales = computed(() => SUPPORTED_LOCALES)

  return {
    t,
    locale,
    locales,
    setLocale,
    init
  }
}
