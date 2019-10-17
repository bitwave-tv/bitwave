<template>
  <v-app :dark="dark">

    <!-- Toolbar -->
    <v-app-bar
      :clipped-left="clipped"
      clipped-right
      text
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

      <v-toolbar-title class="pl-0">
        <v-btn
          to="/"
          depressed
          text
          exact
          active-class
          class="text-none title px-2"
        >{{ title }}</v-btn>
      </v-toolbar-title>

      <v-spacer />

      <notifications />

      <user />

    </v-app-bar>

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
  import Notifications from '~/components/Notifications'

  import { mapState } from 'vuex'

  export default {
    components: {
      User,
      UserList,
      Notifications,
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
