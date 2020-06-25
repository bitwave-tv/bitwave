<template>
  <v-app id="overlay">
    <!-- Content -->
    <v-content style="max-height: 100vh">
      <nuxt />
    </v-content>
  </v-app>
</template>

<script>
  export default {
    components: {

    },

    data() {
      return {

      }
    },

    mounted: function() {
      const elHtml = document.getElementsByTagName('html')[0]
      elHtml.style.overflowY = 'auto'
    },

    destroyed: function() {
      const elHtml = document.getElementsByTagName('html')[0]
      elHtml.style.overflowY = null
    },
  }
</script>

<style lang="scss">
  #overlay.v-application {
    background: transparent;
  }
</style>
