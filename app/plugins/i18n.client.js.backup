export default defineNuxtPlugin({
  name: 'i18n',
  enforce: 'pre', // Run before other plugins
  setup(nuxtApp) {
    const { init } = useI18n()
    
    // Initialize i18n on both client and server
    if (process.client) {
      init()
    } else {
      // SSR: get locale from cookie
      import('@praxio/i18n').then(({ getLanguageFromCookie, DEFAULT_LOCALE }) => {
        const event = nuxtApp.ssrContext?.event
        const cookieHeader = event?.node?.req?.headers?.cookie || ''
        const locale = getLanguageFromCookie(cookieHeader) || DEFAULT_LOCALE
        init(locale)
      })
    }
  }
})
