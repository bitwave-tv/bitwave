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
      <!--<v-toolbar-side-icon @click="drawer = !drawer">
        <v-icon large>devices</v-icon>
      </v-toolbar-side-icon>-->

      <!--<v-toolbar-side-icon @click="drawer = !drawer" />-->

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

  import { mapState } from 'vuex'

  export default {
    components: {
      User,
    },

    data() {
      return {
        title: '[bitwave.tv]',

        dark: true,
        clipped: false,
        fixed: false,

        miniVariant: true,
        drawer: true,

        right: true,
        rightDrawer: this.$vuetify.breakpoint.smAndUp,
        width: this.$vuetify.breakpoint.smAndUp ? 450 : 300,
      }
    },

    methods: {

    },

    computed: {
      ...mapState({
        currentUser: state => state.user.currentUser,
      }),
    },
  }
</script>
