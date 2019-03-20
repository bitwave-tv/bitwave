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
          {
            name: '/COMFY/ Stream',
            avatar: 'https://cdn.discordapp.com/avatars/477288173236649997/446c7ab924d47023b360b311264b1b7a.webp?size=128',
            to: '/comfystream',
          },
          {
            name: 'FearAndLoading',
            avatar: 'https://cdn.discordapp.com/avatars/137756332819218432/dd7beae75c3601d31fcbf6649dc28b93.webp?size=128',
            to: '/FearAndLoading',
          },
          {
            name: 'GodSpeed',
            avatar: 'https://cdn.discordapp.com/avatars/556937797932679168/427e415500c2855b6771b3e8336e3ddf.webp?size=128"',
            to: '/GodSpeed',
          },
          {
            name: 'SPCC',
            avatar: 'https://static1.squarespace.com/static/5c7df4da51f4d4e78749e3fa/t/5c860f62e4966b5f3f4943e4/1552289634671/FavPhone.png?format=1000w',
            to: '/SPCC',
          },
          {
            name: 'WildGoose',
            avatar: 'https://cdn.discordapp.com/avatars/484163031211835405/53b6ee2a4f07a17f6ee443a90ab3c2ec.webp?size=128',
            to: '/wildgoose',
          },
          {
            name: 'cookie',
            avatar: 'https://cdn.discordapp.com/avatars/237946637903724545/58e9e7e2425a4b3cbd79fa6bb830fc61.png?size=128',
            to: '/cookie',
          },
          {
            name: 'KOVALSKI',
            avatar: 'https://cdn.discordapp.com/avatars/203150454547415040/bb8853ae2a244b3c02b3aca32de89442.webp?size=128',
            to: '/kovalski',
          },
          {
            name: 'NPCAnon88',
            avatar: 'https://cdn.discordapp.com/avatars/205981217236058112/d1375b75c6ebf9bd7fe4291bfb7c5456.webp?size=128',
            to: '/npcanon88',
          },
          {
            name: 'Old Angry Normie',
            avatar: 'https://cdn.discordapp.com/avatars/433856881673633792/3b7549128384709ec9340145a9b46b78.webp?size=128',
            to: '/oldangrynormie',
          },
          {
            name: 'Lucky Hecks',
            avatar: 'https://dispatch.sfo2.cdn.digitaloceanspaces.com/static/img/LuckHecksPFP.PNG',
            to: '/heckslucky',
          },
          {
            name: 'Barry O',
            avatar: 'https://cdn.discordapp.com/avatars/318274742081814529/4ded8657bb418dbfba6e8356ae6ce2f4.webp?size=128',
            to: '/barryo',
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

<style >
  .v-toolbar__content {
    padding-left: 0;
  }
</style>
