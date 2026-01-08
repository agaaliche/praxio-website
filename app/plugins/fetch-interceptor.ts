import { $fetch } from 'ofetch'

// Flag to prevent multiple session revocation flows
let isSessionRevoked = false

export default defineNuxtPlugin(() => {
  // Only run on client side
  if (process.server) return

  // Create a custom $fetch instance with error interceptor
  const customFetch = $fetch.create({
    onResponseError({ response }) {
      console.log('🔍 Global fetch interceptor - response error:', response.status)
      
      if (response.status === 401 && !isSessionRevoked) {
        console.log('🚨 Global 401 detected - dispatching session-revoked event')
        isSessionRevoked = true
        
        const event = new CustomEvent('session-revoked', {
          detail: { reason: 'Session expired or revoked' }
        })
        window.dispatchEvent(event)
        console.log('✅ session-revoked event dispatched')
      }
    }
  })

  // Replace global $fetch with our custom one
  globalThis.$fetch = customFetch
})
