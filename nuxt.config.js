const pkg = require('./package');


const VuetifyLoaderPlugin = require('vuetify-loader/lib/plugin');

module.exports = {
  mode: 'universal',

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
        href: 'https://fonts.googleapis.com/css?family=Roboto:300,400,500,700|Material+Icons',
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
    '~/assets/style/app.styl',
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
        }
      }
    ]
  },

  /*
  ** Manifest Module
  */
  manifest: {
    name: '[bitwave.tv]',
    short_name: '[bitwave.tv]',
    lang: 'en',
    display: 'standalone',
    description: 'An open platform live streaming service for creators to freely express themselves.',
    background_color: '#000',
    orientation: 'any',
    theme_color: '#ffff00',
  },

  /*
  ** Plugins to load before mounting the App
  */
  plugins: [
    '@/plugins/vuetify',
    '@/plugins/firebase',
    '@/plugins/VueClipboard',
  ],

  /*
  ** Nuxt.js modules
  */
  modules: [
    // Doc: https://axios.nuxtjs.org/usage
    '@nuxtjs/axios',
    '@nuxtjs/pwa',
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
  ** Build configuration
  */
  build: {
    transpile: [ 'vuetify/lib' ],
    plugins: [ new VuetifyLoaderPlugin() ],
    loaders: {
      stylus: {
        import: [ '~assets/style/variables.styl' ],
      },
    },

    /*
    ** You can extend webpack config here
    */
    extend(config, ctx) {

    },
  },
};
