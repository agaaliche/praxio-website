/**
 * FontAwesome Kit - Client-only plugin
 * This prevents SSR hydration mismatches caused by FontAwesome's 
 * auto-replacement of <i> tags with <svg> elements
 */
export default defineNuxtPlugin(() => {
  // Only run on client
  if (import.meta.server) return

  // Load FontAwesome Kit dynamically on client
  const script = document.createElement('script')
  script.src = 'https://kit.fontawesome.com/7782e74c84.js'
  script.crossOrigin = 'anonymous'
  document.head.appendChild(script)
})
