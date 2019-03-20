<template>
  <v-app
    :dark="dark"
  >

    <!-- L-Nav Drawer -->
    <v-navigation-drawer
      v-model="drawer"
      :mini-variant="miniVariant"
      :clipped="clipped"
      stateless
      fixed
      app
    >
      <v-layout
        fill-height
        column
      >
        <v-flex
          shrink
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
          <hr/>
        </v-flex>

        <!-- User Channels -->
        <v-flex>
          <v-list class="py-1">
            <v-list-tile
              class="py-1"
              v-for="(user, i) in users"
              :key="i"
              :to="user.to"
              router
              exact
            >
              <v-list-tile-avatar
              >
                <img :src="user.avatar" :alt="user.name">
              </v-list-tile-avatar>
              <v-list-tile-content>{{ user.name }}</v-list-tile-content>
            </v-list-tile>
          </v-list>
        </v-flex>

        <!--<hr>-->

        <!-- Minify Panel -->
        <v-flex
          shrink
          :align-self-center="!!miniVariant"
          :align-self-end="!miniVariant"
          class="px-2"
        >

          <v-btn
            style="min-width: 32px;"
            color="blue"
            block
            outline
            @click.stop="miniVariant = !miniVariant"
          >
            <v-icon>{{ `chevron_${miniVariant ? 'right' : 'left'}` }}</v-icon>
          </v-btn>

          <!--<v-btn
            class="px&#45;&#45;2"
            style="min-width: 32px;"
            :block="miniVariant"
            color="blue"
            outline
            @click.stop="miniVariant = !miniVariant"
          >
            <v-icon>{{ `chevron_${miniVariant ? 'right' : 'left'}` }}</v-icon>
          </v-btn>-->
        </v-flex>

      </v-layout>

    </v-navigation-drawer>


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
      dark
      dense
      fixed
      app
    >
      <v-toolbar-side-icon @click="drawer = !drawer" />

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
        title: 'BitWave.tv',

        dark: true,
        clipped: true,
        fixed: false,

        miniVariant: true,
        drawer: true,

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
        ],

        users: [
          {
            name: 'Dispatch',
            avatar: 'https://www.gravatar.com/avatar/b88fd66ccef2d2ebbc343bfb08fb2efb?d=identicon',
            to: '/dispatch',
          },
          {
            name: 'Murderder',
            avatar: 'https://cdn.discordapp.com/avatars/523643556133601284/8062a6e3870f355ff04b3ca04dd12efd.webp?size=128',
            to: '/murderder',
          },
        ],

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

    mounted() {

    },
  }
</script>
