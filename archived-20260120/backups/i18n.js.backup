import { getLanguageFromCookie, DEFAULT_LOCALE } from '@praxio/i18n'

export default defineNuxtPlugin({
  name: 'i18n',
  enforce: 'pre', // Run before other plugins  
  setup(nuxtApp) {
    // Get the i18n composable - this will initialize with DEFAULT_LOCALE on SSR
    const i18nInstance = useI18n()
    
    // IMMEDIATELY override the locale BEFORE any component renders
    if (process.server) {
      const event = nuxtApp.ssrContext?.event
      const cookieHeader = event?.node?.req?.headers?.cookie || ''
      const locale = getLanguageFromCookie(cookieHeader) || DEFAULT_LOCALE
      console.log(`🌐 SSR i18n plugin: Forcefully setting locale to ${locale} BEFORE rendering`)
      // Force update the locale synchronously
      i18nInstance.setLocale(locale)
    } else {
      // On client: initialize from localStorage/cookie
      console.log(`🌐 Client i18n plugin: Initializing...`)
      i18nInstance.init()
    }
  }
})
