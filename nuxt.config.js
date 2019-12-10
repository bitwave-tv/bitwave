const pkg = require('./package');

module.exports = {
  mode: 'universal',

  /*
  ** Environment variables
  */
  env: {
    version: pkg.version || 'v0.0.0',
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
    script: [
      // { src: 'https://tlk.io/embed.js' }
    ],
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
        urlPattern: 'https://fonts.googleapis.com/.*',
        handler: 'cacheFirst',
        method: 'GET',
        strategyOptions: { cacheableResponse: { statuses: [ 0, 200 ] } },
      },
      {
        urlPattern: 'https://fonts.gstatic.com/.*',
        handler: 'cacheFirst',
        method: 'GET',
        strategyOptions: { cacheableResponse: { statuses: [ 0, 200 ] } },
      },
    ]
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
    // orientation: 'any', // Removed to force PWA to respect OS settings
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
  ** Axios module configuration
  */
  axios: {
    // See https://github.com/nuxt-community/axios-module#options
  },

  /*
  ** Build Modules
  */
  buildModules: [
    '@nuxtjs/vuetify',
  ],

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
    extend ( config, ctx ) {

    },
  },
};
