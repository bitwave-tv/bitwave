import Vue from 'vue'
import { VueReCaptcha } from 'vue-recaptcha-v3'

// For more options see below
Vue.use( VueReCaptcha, {
  siteKey: '6LcEX8QUAAAAADjiUPfbzkyn0KYAaEK263quzCGh',
  loaderOptions: {
    autoHideBadge: true,
  },
});
