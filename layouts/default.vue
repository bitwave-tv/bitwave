<template>
  <v-app>

    <!-- Toolbar -->
    <v-app-bar
      app
      :clipped-left="false"
      dark
      dense
      fixed
      color="#212121"
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
          id="logo"
          exact-active-class="app-title-active"
          class="text-none title px-2"
        >{{ title }}</v-btn>
      </v-toolbar-title>

      <v-spacer />

      <notifications />

      <user class="ml-3" />

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

        fixed: false,

        miniVariant: true,
        drawer: undefined,

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

<style lang="scss">
  #logo.app-title-active {
    &:hover::before {
      opacity: 0.24;
    }

    &::before {
      opacity: 0;
    }
  }
</style>
