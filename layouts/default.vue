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

      <v-flex shrink>
        <v-switch
          v-model="dark"
          :label="`${ !!dark ? 'Night' : 'Day' }`"
          color="yellow"
          hide-details
        ></v-switch>
      </v-flex>

      <v-spacer />

      <user/>

      <v-btn
        v-show="!$vuetify.breakpoint.mdAndUp"
        icon
        @click.stop="rightDrawer = !rightDrawer"
      >
        <v-icon>menu</v-icon>
      </v-btn>

    </v-toolbar>

    <!-- R-Nav Chat Drawer -->
    <v-navigation-drawer
      v-model="rightDrawer"
      :width="width"
      :permanent="$vuetify.breakpoint.mdAndUp"
      right
      clipped
      fixed
      flat
      app
    >
      <!--<tlk-chat />-->
      <chat />
    </v-navigation-drawer>

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
  import User from '~/components/User'

  import Chat from '~/components/Chat'
  import TlkChat from '~/components/TlkChat'

  import UserList from '~/components/UserList'

  import { mapState } from 'vuex'

  export default {
    components: {
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

<style>
  .v-toolbar__content {
    padding-left: 0;
    padding-right: 0;
  }
</style>
