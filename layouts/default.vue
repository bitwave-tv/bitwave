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
      <v-btn
        icon
        @click.stop="drawer = !drawer"
      >
        <v-icon>menu</v-icon>
      </v-btn>

      <v-toolbar-title class="ml-1 mr-1">
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

      <user />

    </v-toolbar>

    <!-- L-Nav Drawer -->
    <user-list v-model="drawer" />

    <!-- Content -->
    <v-content>
      <nuxt />
    </v-content>
  </v-app>
</template>

<script>
  import User from '~/components/User'
  import UserList from '~/components/UserList'

  import { mapState } from 'vuex'

  export default {
    components: {
      User,
      UserList,
    },

    data() {
      return {
        title: '[bitwave.tv]',

        dark: true,
        clipped: false,
        fixed: false,

        miniVariant: true,
        drawer: null,

        right: true,
        showChat: true,
      }
    },

    methods: {

    },

    computed: {
      ...mapState({
        currentUser: state => state.user.currentUser,
      }),

      mobile () {
        return !this.$vuetify.breakpoint.smAndUpmdAndUp;
      },

      width () {
        return this.$vuetify.breakpoint.smAndUp ? 450 : 300;
      },
    },

    created() {
      this.showChat = this.$vuetify.breakpoint.smAndUp;
    }
  }
</script>
