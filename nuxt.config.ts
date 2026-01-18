// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxtjs/google-fonts',
    '@vueuse/nuxt',
    '@nuxtjs/i18n'
  ],

  i18n: {
    defaultLocale: 'en',
    strategy: 'no_prefix',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'praxio_language',
      redirectOn: 'root',
      alwaysRedirect: false,
      fallbackLocale: 'en'
    },
    locales: [
      {
        code: 'en',
        name: 'English',
        file: 'en.json'
      },
      {
        code: 'fr',
        name: 'Français',
        file: 'fr.json'
      }
    ],
    lazy: false,
    langDir: '../i18n/locales',
    compilation: {
      strictMessage: false,
      escapeHtml: false
    }
  },

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
      ],
      script: [
        { src: 'https://kit.fontawesome.com/7782e74c84.js', crossorigin: 'anonymous' }
      ]
      // FontAwesome Kit for custom Retroact logo icon
    }
  },

  runtimeConfig: {
    // Server-only config (not exposed to client)
    // Nuxt automatically loads these from .env.local without process.env
    dbHost: 'localhost',
    dbUser: 'root',
    dbPassword: '',
    dbName: 'master',
    dbPort: '3306',
    dbSocketPath: '',

    // Stripe
    stripeSecretKey: '',
    stripeWebhookSecret: '',

    // SSO
    ssoSecret: '',
    jwtSecret: '',

    // Email (uses same Firebase Extension as inrManager)
    useFirebaseEmail: 'false',
    firebaseServiceAccount: '',
    siteUrl: 'http://localhost:3000',

    // Public config (exposed to client)
    public: {
      apiUrl: 'https://inr-backend-pq7nv4e3fq-uk.a.run.app',
      stripePublishableKey: '',
      siteUrl: 'http://localhost:3000',
      retroactUrl: 'http://localhost:8081'
    }
  },

  nitro: {
    routeRules: {
      '/tickets': {
        headers: {
          'X-Frame-Options': 'ALLOWALL',
          'Content-Security-Policy': 'frame-ancestors *'
        }
      }
    }
  }
})
