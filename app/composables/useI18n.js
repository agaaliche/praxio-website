import { ref, computed } from 'vue'
import { 
  translations, 
  SUPPORTED_LOCALES, 
  DEFAULT_LOCALE,
  getNestedValue,
  initLanguage,
  setStoredLanguage
} from '@praxio/i18n'

const currentLocale = ref(DEFAULT_LOCALE)

export const useI18n = () => {
  /**
   * Initialize locale on first use
   */
  const init = () => {
    if (typeof window !== 'undefined') {
      currentLocale.value = initLanguage()
      
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
    }
  }

  /**
   * Get translation by key
   * @param {string} key - Translation key in dot notation (e.g., 'header.products')
   * @returns {string} - Translated text
   */
  const t = (key) => {
    const locale = currentLocale.value
    const translation = translations[locale]
    return getNestedValue(translation, key)
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
