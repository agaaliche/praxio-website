export default defineNuxtPlugin({
  name: 'i18n',
  enforce: 'pre', // Run before other plugins
  setup() {
    const { init } = useI18n()
    
    // Initialize i18n immediately on client side
    if (process.client) {
      init()
    }
  }
})
