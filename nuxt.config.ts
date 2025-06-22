import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],
  vite: {
    plugins: [
        tailwindcss()
    ]
  },

  modules: [
    '@nuxt/ui',
    '@nuxtjs/tailwindcss',
    'nuxt-zod-i18n',
    '@nuxtjs/i18n'
  ],

  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:8000/api'
    }
  },
})