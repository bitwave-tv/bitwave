require('dotenv').config();
const pkg = require('./package');

// noinspection PointlessArithmeticExpressionJS
module.exports = {
  mode: 'universal',

  /*
  ** Environment variables
  */
  env: {
    version: pkg.version || '0.0.0',
    VERSION: pkg.version || '0.0.0',
    APP_DEBUG: process.env.APP_DEBUG || false,
    BITWAVE_ENV: process.env.BITWAVE_ENV || process.env.NODE_ENV || 'production',

    WORKBOX_DEBUG: process.env.WORKBOX_DEBUG,

    IPINFO_TOKEN: process.env.IPINFO_TOKEN || '28731f83a6e092',
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
      { name: 'og:image',     content: 'https://cdn.bitwave.tv/static/img/Bitwave_Banner.jpg', hid: 'og:image' },
      // https://cdn.bitwave.tv/static/img/BitWave2.sm.jpg // old image
    ],
    script: [],
    link: [
      {
        rel: 'icon',
        type: 'image/x-icon',
        href: '/favicon.ico',
        crossorigin: 'anonymouse',
      },
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css?family=IBM+Plex+Sans:500&display=swap',
      },
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css?family=Material+Icons',
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


  pwa: {
    workbox: {
      config: { debug: process.env.WORKBOX_DEBUG },

      importScripts: [
        '/bitwave-offline-sw.js',
      ],

      cleanupOutdatedCaches: true,

      /*preCaching: [
        'https://fonts.googleapis.com/css?family=Roboto:100,300,400,500,700,900&display=swap',
        'https://fonts.googleapis.com/css?family=IBM+Plex+Sans:500&display=swap',
        'https://fonts.googleapis.com/css?family=Material+Icons',
      ],*/

      // Runtime caching caches pages as we browse
      runtimeCaching: [
        {
          urlPattern: '/.*',
          handler:    'networkFirst',
          method:     'GET',
          strategyOptions: {
            cacheExpiration: {
              maxEntries: 10,
              maxAgeSeconds: 60 * 60 * 24 * 1, // 1 day
              purgeOnQuotaError: true,
            }
          },
        },

        /*{
          urlPattern: 'https://stream.bitwave.tv/stream/.*',
          handler: 'networkOnly',
          strategyOptions: {
            cacheName: 'HLS-cache',
          },
        },*/


        // Cache fonts
        {
          urlPattern: 'https://fonts.googleapis.com',
          handler: 'NetworkFirst',
          method: 'GET',
          strategyOptions: {
            cacheName: 'assets',
            cacheExpiration: {
              maxEntries: 10,
              maxAgeSeconds: 60 * 60 * 24 * 1, // ( 1 day ) 1 year
              purgeOnQuotaError: true,
            }
          },
        },
        {
          urlPattern: 'https://fonts.gstatic.com',
          handler: 'StaleWhileRevalidate',
          method: 'GET',
          strategyOptions: {
            cacheName: 'assets',
            /*cacheableResponse: {
              statuses: [ 200 ],
            },*/
            cacheExpiration: {
              maxEntries: 10,
              maxAgeSeconds: 60 * 60 * 24 * 1, // ( 1 day ) 1 year
              purgeOnQuotaError: true,
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

        // Long lived API responses
        {
          urlPattern: 'https://api.bitwave.tv/api/channels(/?|/([a-zA-Z0-9._-]+)?)$',
          handler: 'NetworkFirst',
          method: 'GET',
          strategyOptions: {
            cacheName: 'bitwave-api',
          },
        },

        // Cache emotes
        {
          urlPattern: 'https://cdn.bitwave.tv/static/emotes/(.*)\\?4$',
          handler: 'CacheFirst',
          method: 'GET',
          strategyOptions: {
            cacheName: 'bitwave-emotes',
            cacheableResponse: {
              statuses: [ 200 ],
            },
            cacheExpiration: {
              maxEntries: 10,
              maxAgeSeconds: 60 * 60 * 24 * 30, // 30 Days
              purgeOnQuotaError: true,
            },
          },
        },

        // more workbox cache settings...
      ],

      // Automatically cache for offline usage
      offlineAssets: [
        // Route Locations
        /*
        '/',
        '/login',
        '/profile',
        '/chat',
        '/embed',
        */

        // Assets
        '/sounds/tweet.mp3',
        'https://fonts.googleapis.com/css?family=Material+Icons',
        'https://cdn.bitwave.tv/static/img/firework-banner.gif',
      ],

      // routingExtensions: [],
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

    meta: {
      appleStatusBarStyle: 'black-translucent',
      name: '[bitwave.tv]',
      description: 'An open platform live streaming service for creators to freely express themselves.',
      theme_color: '#ffff00',
      ogType: 'website',
      ogHost: 'http://bitwave.tv',
      twitterCard: 'summary_large_image',
      twitterSite: '@BitwaveTV',
      // twitterCreator: '',
    },
  },



  /*
  ** Plugins to load before mounting the App
  */
  plugins: [
    '@/plugins/firebase',
    '@/plugins/VueClipboard',
    { src: '@/plugins/pwa.client.js', mode: 'client' },
    { src: '@/plugins/sw-hook', mode: 'client' },
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
    // progress: false,
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
    keepOnHover: true,
    register: [
      {
        name: 'update',
        message: payload => payload.message,
        options: {
          position: 'top-center',
          icon: 'autorenew',
          theme: 'bitwave',
          className: '',
          type: 'update-toast',
          action: {
            text: 'update',
            class: 'update-toast',
            onClick: ( e, toast ) => {
              console.log( 'Reloading the page to update to latest version of bitwave.' );
              toast.goAway(0);
              window.location.reload();
            }
          },
        },
      },
    ],
  },

  /*
  ** Build configuration
  */
  build: {
    /*
    ** You can extend webpack config here
    */

    crossorigin: true,

    extractCSS: true,

    parallel: process.env.APP_DEBUG === 'true',

    extend ( config, ctx ) {

    },
  },
};
