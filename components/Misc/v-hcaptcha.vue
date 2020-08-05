<template>
  <client-only>
    <vue-hcaptcha
      :sitekey="sitekey"
      :theme="theme"
      :tabindex="tabindex"
      @verify="onVerify"
      @expired="onExpired"
      @error="onError"
    />
  </client-only>
</template>

<script>
  const VueHcaptcha = async () => await import( '@hcaptcha/vue-hcaptcha' );

  export default {
    name: 'v-hcaptcha',

    components: {
      VueHcaptcha,
    },

    props: {
      tabindex: {
        type: String,
        default: 0,
      },
      theme: {
        type: String,
        default: 'light',
      },
      size: {
        type: String,
        default: 'normal',
      },
    },

    data() {
      return {
        sitekey: process.env.HCAPTCHA_SITE_KEY,
      };
    },

    methods: {
      // hCaptcha Verified
      onVerify ( data ) {
        console.log( `hcaptcha verified:`, data );
        this.$emit( 'verify', data );
      },

      // hCaptcha Expired
      onExpired ( data ) {
        console.warn( `hcaptcha expired:`, data );
        this.$emit( 'expired', data );
      },

      // hCaptcha Error
      onError ( data ) {
        console.error( `hcaptcha error:`, data );
        this.$emit( 'error', data );
      },
    },
  };
</script>
