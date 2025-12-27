// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  
  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxtjs/google-fonts',
    '@vueuse/nuxt'
  ],

  googleFonts: {
    families: {
      Inter: [300, 400, 500, 600, 700],
      'Plus Jakarta Sans': [400, 500, 600, 700]
    }
  },

  tailwindcss: {
    cssPath: '~/assets/css/tailwind.css',
    configPath: 'tailwind.config.js'
  },

  app: {
    head: {
      title: 'Praxio - Medical Software Solutions',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Praxio provides innovative medical software solutions for healthcare professionals.' }
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
      ]
      // FontAwesome is loaded via client-only plugin to prevent SSR hydration issues
    }
  },

  runtimeConfig: {
    // Server-only config (not exposed to client)
    dbHost: process.env.DB_HOST || 'localhost',
    dbUser: process.env.DB_USER || 'root',
    dbPassword: process.env.DB_PASSWORD || '',
    dbName: process.env.DB_NAME || 'master',
    dbPort: process.env.DB_PORT || '3306',
    dbSocketPath: process.env.DB_SOCKET_PATH || '',
    
    // Stripe
    stripeSecretKey: process.env.STRIPE_SECRET_KEY || '',
    stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
    
    // Email (uses same Firebase Extension as inrManager)
    useFirebaseEmail: process.env.USE_FIREBASE_EMAIL || 'false',
    firebaseServiceAccount: process.env.FIREBASE_SERVICE_ACCOUNT || '',
    siteUrl: process.env.SITE_URL || 'http://localhost:3000',
    
    // Public config (exposed to client)
    public: {
      apiUrl: process.env.NUXT_PUBLIC_API_URL || 'https://inr-backend-pq7nv4e3fq-uk.a.run.app',
      stripePublishableKey: process.env.STRIPE_PUBLISHABLE_KEY || '',
      siteUrl: process.env.SITE_URL || 'http://localhost:3000'
    }
  }
})
