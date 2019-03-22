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
    <v-navigation-drawer
      v-model="drawer"
      :mini-variant="miniVariant"
      :clipped="clipped"
      stateless
      fixed
      flat
      dark
      app
    >
      <v-layout
        fill-height
        column
      >
        <v-flex shrink>
          <v-list class="pb-0">
            <v-list-tile
              class="py-1"
              v-for="(item, i) in items"
              :key="i"
              :to="item.to"
              router
              exact
            >
              <v-list-tile-action>
                <v-avatar color="#eee" size="40" class="blue--text" >
                  <v-icon  light :size="item.size" >{{ item.icon }}</v-icon>
                </v-avatar>
              </v-list-tile-action>
              <v-list-tile-content>
                <v-list-tile-title>{{ item.title }}</v-list-tile-title>
              </v-list-tile-content>
            </v-list-tile>
          </v-list>
          <!--<hr/>-->
        </v-flex>

        <!-- User Channels -->
        <v-flex>
          <v-list class="pt-0">
            <v-list-tile
              class="py-1"
              v-for="(user, i) in users"
              :key="i"
              :to="user.to"
              router
              exact
            >
              <v-list-tile-avatar>
                <img :src="user.avatar" :alt="user.name">
              </v-list-tile-avatar>
              <v-list-tile-content>{{ user.name }}</v-list-tile-content>
            </v-list-tile>
          </v-list>
        </v-flex>

        <!-- Minify Panel -->
        <v-flex
          shrink
          :align-self-center="!!miniVariant"
          :align-self-end="!miniVariant"
          class="px-2"
        >

          <v-btn
            style="min-width: 32px;"
            color="yellow"
            block
            outline
            @click.stop="miniVariant = !miniVariant"
          >
            <v-icon>{{ `chevron_${miniVariant ? 'right' : 'left'}` }}</v-icon>
          </v-btn>
        </v-flex>
      </v-layout>
    </v-navigation-drawer>

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

  import axios from 'axios'
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
        title: 'BitWave.tv',

        dark: true,
        clipped: false,
        fixed: false,

        miniVariant: true,
        drawer: true,

        items: [
          {
            icon: 'whatshot', //blur_on // ondemand_video // live_tv
            size: 32,
            title: 'Welcome',
            to: '/',
          },
          /*{
            icon: 'apps',
            title: 'Inspire',
            to: '/inspire',
          },*/
        ],

        users: [],

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

    async mounted() {
      const { data } = await axios.get('https://api.bitwave.tv/api/channels/list');
      this.users = data.users;
    },
  }
</script>

<style>
  .v-toolbar__content {
    padding-left: 0;
  }
</style>
