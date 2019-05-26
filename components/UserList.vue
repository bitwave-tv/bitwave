<template>
  <v-navigation-drawer

    :value="value"
    :mini-variant="miniVariant"
    :clipped="clipped"

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
              <v-avatar
                color="#eee"
                size="40"
                class="blue--text"
              >
                <v-icon light :size="item.size" >{{ item.icon }}</v-icon>
              </v-avatar>
            </v-list-tile-action>
            <v-list-tile-content>
              <v-list-tile-title>{{ item.title }}</v-list-tile-title>
            </v-list-tile-content>
          </v-list-tile>
        </v-list>
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
            <v-list-tile-avatar
              :color="user.live ? user.nsfw ? '#ff9800' : '#0f0' : '#000'"
            >

              <v-badge
                v-model="user.live && user.nsfw"
                :color="!!user.nsfw ? 'orange' : 'green'"
                overlap
              >
                <template #badge>
                  <v-icon>{{ user.nsfw ? 'priority_high' : 'play_arrow' }}</v-icon>
                </template>
                <v-avatar
                  :size="user.live ? 36 : 40"
                >
                  <img :class="{ offline : !user.live }" :src="user.avatar" :alt="user.name">
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

    props: {
      value: { type: Boolean },
    },

    data() {
      return {
        drawer: true,
        clipped: false,
        miniVariant: true,

        items: [
          {
            icon: 'whatshot', //blur_on // ondemand_video // live_tv
            size: 32,
            title: 'Home',
            to: '/',
          },
        ],
        users: [],
        userUpdateRate: 10,
        userListTimer: null,
      }
    },

    methods: {
      toggleMini() {
        this.miniVariant = !this.miniVariant;
      },

      async updateList() {
        try {
          const { data } = await axios.get('https://api.bitwave.tv/api/channels/list');
          this.users = data.users;
        } catch (error) {
          console.error(`ERROR: Failed to update user list.`);
          console.log(error.message);
        }
      },

    },

    async created() {
      await this.updateList();
    },

    async mounted() {
      this.userListTimer = setInterval( async () => await this.updateList(), 1000 * this.userUpdateRate );
    },

    beforeDestroy() {
      if (this.userListTimer) clearInterval(this.userListTimer);
    },
  }
</script>

<style lang='scss'>
  .hide-scrollbar {
    overflow-y: scroll;
    scrollbar-width: none; /* Firefox */
    -ms-overflow-style: none;  /* IE 10+ */

    &::-webkit-scrollbar {
      width: 0;
      height: 0;
    }
  }

  .offline {
    -webkit-filter: grayscale(60%);
    filter: grayscale(60%);
  }
</style>
