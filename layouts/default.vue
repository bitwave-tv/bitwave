<template>
  <v-app
    :dark="dark"
  >

    <!-- Nav Drawer -->
    <v-navigation-drawer
      v-model="drawer"
      :mini-variant="miniVariant"
      :clipped="clipped"
      stateless
      fixed
      app
    >
      <v-list>
        <v-list-tile
          v-for="(item, i) in items"
          :key="i"
          :to="item.to"
          router
          exact
        >
          <v-list-tile-action>
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title v-text="item.title" />
          </v-list-tile-content>
        </v-list-tile>
      </v-list>
    </v-navigation-drawer>

    <!-- Chat -->
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
      <!--<chat />-->
      <tlk-chat />
    </v-navigation-drawer>

    <!-- Toolbar -->
    <v-toolbar
      :clipped-left="clipped"
      clipped-right
      dark
      dense
      fixed
      app
    >
      <v-toolbar-side-icon @click="drawer = !drawer" />

      <v-btn
        icon
        @click.stop="miniVariant = !miniVariant"
      >
        <v-icon>{{ `chevron_${miniVariant ? 'right' : 'left'}` }}</v-icon>
      </v-btn>

      <v-btn
        icon
        @click.stop="dark = !dark"
      >
        <v-icon>brightness_medium</v-icon>
      </v-btn>

      <v-toolbar-title
        class="mx-2"
        v-text="title"
      />

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

  import { mapState } from 'vuex'

  export default {
    components: {
      Login,
      User,
      Chat,
      TlkChat,
    },

    data() {
      return {
        clipped: true,
        drawer: true,
        fixed: false,
        dark: true,
        items: [
          {
            icon: 'home',
            title: 'Welcome',
            to: '/',
          },
          {
            icon: 'apps',
            title: 'Inspire',
            to: '/inspire',
          },
          {
            icon: 'ondemand_video',
            title: 'Dispatch',
            to: '/dispatch',
          },
          {
            icon: 'ondemand_video',
            title: 'Murderder',
            to: '/murderder',
          },
        ],
        miniVariant: true,
        right: true,
        rightDrawer: true,
        title: 'BitWave.tv',
      }
    },

    methods: {

    },

    computed: {
      ...mapState({
        currentUser: state => state.user.currentUser
      })
    },

    mounted() {

    },
  }
</script>
