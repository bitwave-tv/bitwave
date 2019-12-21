const pkg = require('./package');

module.exports = {
  mode: 'universal',

  /*
  ** Environment variables
  */
  env: {
    version: pkg.version || 'v0.0.0',
    APP_DEBUG: false,
  },

  /*
  ** Headers of the page
  */
  head: {
    title: pkg.name,
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport',     content: 'width=device-width, initial-scale=1' },
      { name: 'description',  hid: 'description', content: pkg.description},
      { name: 'og:site_name', content: '[bitwave.tv]' },
      { name: 'og:image',     content: 'https://cdn.bitwave.tv/static/img/BitWave2.sm.jpg', hid: 'og:image' },
    ],
    script: [],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css?family=Roboto:300,400,500,700|Material+Icons|IBM+Plex+Sans:500&display=swap',
      },
    ],
  },

  /*
  ** Customize the progress-bar color
  */
  loading: { color: '#2196f3' },

  /*
  ** Global CSS
  */
  css: [
    '~/assets/style/app.scss',
    'video.js/dist/video-js.css',
    'vuetify/dist/vuetify.css',
  ],

  workbox: {
    runtimeCaching: [
      {
        urlPattern: 'https://stream.bitwave.tv/stream/.*',
        handler: 'networkOnly',
        strategyOptions: {
          cacheName: 'HLS-cache',
          /*cacheExpiration: {
            maxEntries: 200,
            maxAgeSeconds: 600
          }*/
        },
      },

      // Cache fonts
      {
        urlPattern: 'https://fonts.googleapis.com',
        handler: 'StaleWhileRevalidate',
        method: 'GET',
        strategyOptions: {
          cacheName: 'assets',
        },
      },
      {
        urlPattern: 'https://fonts.gstatic.com',
        handler: 'CacheFirst',
        method: 'GET',
        strategyOptions: {
          cacheName: 'assets',
          cacheExpiration: {
            maxEntries: 10,
            maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
          }
        },
      },

      // Cache basic API responses
      {
        urlPattern: 'https://api.bitwave.tv/api/(?:channels/list|bump)$',
        handler: 'NetworkFirst',
        method: 'GET',
        strategyOptions: {
          cacheName: 'bitwave-api',
        },
      },

      // more workbox cache settings...
    ],
  },

  /*
  ** Manifest Module
  */
  manifest: {
    name: '[bitwave.tv]',
    short_name: '[bitwave.tv]',
    description: 'An open platform live streaming service for creators to freely express themselves.',
    categories: [ 'entertainment', 'social' ],
    lang: 'en',
    display: 'standalone',
    background_color: '#000000',
    theme_color: '#ffff00',
  },

  /*
  ** Plugins to load before mounting the App
  */
  plugins: [
    '@/plugins/firebase',
    '@/plugins/VueClipboard',
  ],

  /*
  ** Nuxt.js modules
  */
  modules: [
    // Doc: https://axios.nuxtjs.org/usage
    '@nuxtjs/axios',
    '@nuxtjs/device',
    '@nuxtjs/pwa',
    '@nuxtjs/recaptcha',
    '@nuxtjs/toast',
    'cookie-universal-nuxt',
    [ '@nuxtjs/google-analytics', { id: 'UA-133753190-2' } ],
    // { src: '~/plugins/nuxt-client-init', ssr: false },
  ],

  /*
  ** Build Modules
  */
  buildModules: [
    '@nuxtjs/vuetify',
    '@nuxtjs/dotenv',
  ],

  /*
  ** Axios module configuration
  */
  axios: {
    // See https://github.com/nuxt-community/axios-module#options
  },

  /*
  ** Vuetify
  */
  vuetify: {
    optionsPath: './vuetify.options.js',
  },

  /*
  ** reCAPTCHA v3
  */
  recaptcha: {
    hideBadge: true,
    siteKey: '6LcEX8QUAAAAADjiUPfbzkyn0KYAaEK263quzCGh',
    version: 3,
  },

  /*
  ** Toast
  */
  toast: {
    position: 'bottom-right',
  },

  /*
  ** Build configuration
  */
  build: {
    /*
    ** You can extend webpack config here
    */

    extractCSS: true,

    extend ( config, ctx ) {

    },
  },
};
