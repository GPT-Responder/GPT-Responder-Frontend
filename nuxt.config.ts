// https://nuxt.com/docs/api/configuration/nuxt-config
import fs from 'fs'
import path from 'path'
export default defineNuxtConfig({
  app: {
    head: {
      link: [{ rel: 'icon', type: 'image/png', href: '/favicon.png' }]
    }
  },
  devtools: {
    enabled: true,

    timeline: {
      enabled: true,
    },
  },
  server: {
    https: {
      key: fs.readFileSync(path.resolve(__dirname, 'localhost-key.pem')),
      cert: fs.readFileSync(path.resolve(__dirname, 'localhost.pem'))
    }
  },
  modules: ['@nuxtjs/tailwindcss', 'nuxt-icon'],
  components: [
    {
      path: '~/components/ui',
      // this is required else Nuxt will autoImport `.ts` file
      extensions: [
        '.vue',
      ],
      // prefix for your components, eg: UiButton
      prefix: ''
    },
  ],
})
