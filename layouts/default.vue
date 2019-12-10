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

      <stream-info />

      <notifications />

      <user class="ml-4" />

    </v-app-bar>

    <!-- L-Nav Drawer -->
    <user-list v-model="drawer" />

    <!-- Content -->
    <v-content>
      <v-fade-transition>
        <nuxt />
      </v-fade-transition>
    </v-content>

  </v-app>
</template>

<script>
  import User from '~/components/User'
  import UserList from '~/components/UserList'
  import Notifications from '~/components/Notifications'
  import StreamInfo from '@/components/StreamInfo';

  import { mapState } from 'vuex'

  export default {
    components: {
      User,
      UserList,
      Notifications,
      StreamInfo,
    },

    data() {
      return {
        title: '[bitwave.tv]',
        drawer: undefined,
      }
    },

    methods: {

    },

    computed: {
      ...mapState({
        currentUser: state => state.user.currentUser,
      }),
    },

    created() {

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
