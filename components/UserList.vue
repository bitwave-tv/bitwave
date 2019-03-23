<template>
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
      <v-flex
        class="hide-scrollbar"
        style="overflow-y: auto"
      >
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

              <v-badge
                v-model="user.live"
                overlap
              >
                <template v-slot:badge>
                  <v-icon>done</v-icon>
                </template>
                <v-avatar
                  size="40"
                >
                  <img :src="user.avatar" :alt="user.name">
                </v-avatar>
              </v-badge>

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
          @click.stop="toggleMini"
        >
          <v-icon>{{ `chevron_${miniVariant ? 'right' : 'left'}` }}</v-icon>
        </v-btn>
      </v-flex>
    </v-layout>
  </v-navigation-drawer>
</template>

<script>
  import axios from 'axios'

  export default {
    name: 'UserList',

    data() {
      return {
        drawer: true,
        clipped: false,
        miniVariant: true,

        items: [
          {
            icon: 'whatshot', //blur_on // ondemand_video // live_tv
            size: 32,
            title: 'Welcome',
            to: '/',
          },
        ],

        users: [],
      }
    },

    methods: {
      toggleMini() {
        this.miniVariant = !this.miniVariant;
      },
      async updateList() {
        const { data } = await axios.get('https://api.bitwave.tv/api/channels/list');
        this.users = data.users;
        setTimeout(() => this.updateList(), 1000 * 60);
      },
    },

    computed: {},

    async mounted() {
      await this.updateList();
    },
  }
</script>

<style lang='scss'>
  .hide-scrollbar {
    overflow-y: scroll;
    scrollbar-width: none; /* Firefox */
    -ms-overflow-style: none;  /* IE 10+ */

    &::-webkit-scrollbar {
      /* WebKit */
      width: 0;
      height: 0;
    }
  }
</style>
