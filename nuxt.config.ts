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
      ],
      script: [
        { src: 'https://kit.fontawesome.com/7782e74c84.js', crossorigin: 'anonymous' }
      ]
    }
  },

  runtimeConfig: {
    public: {
      apiUrl: process.env.NUXT_PUBLIC_API_URL || 'https://inr-backend-pq7nv4e3fq-uk.a.run.app'
    }
  }
})
