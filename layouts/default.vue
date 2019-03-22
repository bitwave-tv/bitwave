<template>
  <v-app
    :dark="dark"
  >

    <!-- R-Nav Chat Drawer -->
    <v-navigation-drawer
      v-model="rightDrawer"
      :right="right"
      width="400px"
      stateless
      clipped
      fixed
      flat
      app
    >
      <tlk-chat />
      <!--<chat />-->
    </v-navigation-drawer>

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
          o="/"
          flat
          exact
          class="text-none title px-2"
        >{{ title }}</v-btn>
      </v-toolbar-title>

      <v-switch
        v-model="dark"
        :label="`${ !!dark ? 'Night' : 'Day' }`"
        color="yellow"
        hide-details
      ></v-switch>

      <v-spacer />

      <!--<user v-if="currentUser && currentUser.displayName" />-->
      <!--<login v-else />-->

      <v-btn
        icon
        @click.stop="rightDrawer = !rightDrawer"
      >
        <v-icon>menu</v-icon>
      </v-btn>

    </v-toolbar>

    <!-- L-Nav Drawer -->
    <user-list />

    <!-- Content -->
    <v-content>
      <nuxt />
    </v-content>

    <!-- Footer -->
    <v-footer
      v-if="false"
      :fixed="fixed"
      class="px-2"
      app
    >
      <span>BitWave TV &copy; 2019</span>
    </v-footer>

  </v-app>
</template>

<script>
  import Login from '~/components/Login'
  import User from '~~/components/User'

  import Chat from '~/components/Chat'
  import TlkChat from '~/components/TlkChat'

  import UserList from '~/components/UserList'

  import { mapState } from 'vuex'

  export default {
    components: {
      Login,
      User,
      Chat,
      TlkChat,
      UserList,
    },

    data() {
      return {
        title: 'BitWave.tv',

        dark: true,
        clipped: false,
        fixed: false,

        miniVariant: true,
        drawer: true,

        right: true,
        rightDrawer: true,
      }
    },

    methods: {

    },

    computed: {
      ...mapState({
        currentUser: state => state.user.currentUser,
      }),
    },

    mounted() {},
  }
</script>

<style>
  .v-toolbar__content {
    padding-left: 0;
  }
</style>
