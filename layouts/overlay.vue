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
  }
</script>

<style lang="scss">
  #overlay.v-application {
    background: transparent;
  }
</style>
