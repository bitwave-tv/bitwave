<template>
  <v-app :dark="dark">

    <!-- Toolbar -->
    <v-toolbar
      :clipped-left="clipped"
      clipped-right
      flat
      dark
      dense
      fixed
      app
    >
      <v-toolbar-title class="ml-0 mr-1">
        <v-btn
          to="/"
          depressed
          flat
          exact
          active-class
          class="text-none title px-2"
        >{{ title }}</v-btn>
      </v-toolbar-title>

      <v-spacer />

      <user/>

    </v-toolbar>

    <!-- Content -->
    <v-content style="max-height: 100vh">
      <nuxt />
    </v-content>

  </v-app>
</template>

<script>
  import User from '~/components/User'

  export default {
    components: {
      User,
    },

    data() {
      return {
        title: '[bitwave.tv]',
        dark: true,
        clipped: false,
      }
    },
  }
</script>
