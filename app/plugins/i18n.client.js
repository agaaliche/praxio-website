export default defineNuxtPlugin(() => {
  const { init } = useI18n()
  
  // Initialize i18n on client side only
  if (process.client) {
    init()
  }
})
