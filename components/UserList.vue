<template>
  <v-navigation-drawer
    :value="value"
    @input="$emit('input', $event)"
    :mini-variant="miniVariant"
    :clipped="false"
    color="grey darken-4"
    app
  >
    <v-layout
      fill-height
      column
    >
      <v-flex shrink>
        <v-list
          class="py-0"
          dense
        >
          <v-list-item
            class="py-1"
            v-for="( item, i ) in items"
            :key="i"
            :to="item.to"
            router
            exact
          >
            <v-list-item-action class="my-1">
              <v-avatar
                color="#eee"
                size="40"
                class="blue--text"
              >
                <v-icon light :size="item.size" >{{ item.icon }}</v-icon>
              </v-avatar>
            </v-list-item-action>
            <v-list-item-content class="py-0">
              <v-list-item-title>{{ item.title }}</v-list-item-title>
              <v-list-item-subtitle>[bitwave.tv]</v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </v-flex>

      <!-- User Channels -->
      <v-flex
        class="hide-scrollbar"
        style="overflow-y: auto; will-change: transform;"
      >
        <v-list
          class="pt-0"
          dense
        >
          <template
            v-for="( user, i ) in sidebarData"
          >
            <v-lazy
              :value="i < 15"
              min-height="56"
              :key="i"
            >
              <v-list-item
                class="py-1"
                :to="user.to"
                router
                exact
              >
                <v-list-item-avatar
                  :color="user.live ? user.nsfw ? '#ff9800' : '#0f0' : '#000'"
                  class="my-1"
                >
                  <v-badge
                    v-model="user.live && user.nsfw"
                    :color="!!user.nsfw ? 'orange' : 'green'"
                    overlap
                  >
                    <template v-slot:badge>
                      <v-icon small>flag</v-icon>
                    </template>
                    <v-avatar
                      :size="user.live ? 36 : 40"
                    >
                      <img :class="{ offline : !user.live }" :src="user.avatar" :alt="user.name">
                    </v-avatar>
                  </v-badge>
                </v-list-item-avatar>
                <v-list-item-content class="py-0">
                  <v-list-item-title>{{ user.title }}</v-list-item-title>
                  <v-list-item-subtitle>{{ user.name }}</v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
            </v-lazy>
          </template>

          <!-- View All Streamers -->
          <v-list-item
            class="py-0"
            to="/streamers"
            router
            exact
          >
            <v-list-item-avatar>
              <v-avatar
                color="#eee"
                size="40"
                class="blue--text"
              >
                <v-icon light>more_horiz</v-icon>
              </v-avatar>
            </v-list-item-avatar>
            <v-list-item-content>
              <v-list-item-title>View All</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </v-flex>
    </v-layout>

    <!-- Minify Panel -->
    <template v-slot:append>
      <div class="pa-2">
        <v-btn
          color="yellow"
          block
          outlined
          @click.stop="miniVariant = !miniVariant"
        >
          <v-icon>{{ `chevron_${miniVariant ? 'right' : 'left'}` }}</v-icon>
        </v-btn>
      </div>
    </template>
  </v-navigation-drawer>
</template>

<script>
  import { mapGetters, mapActions } from 'vuex';
  import { VStore } from '@/store';

  export default {
    name: 'UserList',

    props: {
      value: { type: Boolean },
    },

    data() {
      return {
        miniVariant: true,

        items: [
          {
            icon   : 'whatshot', //blur_on // ondemand_video // live_tv
            size   : 32,
            title  : 'Home',
            to     : '/',
          },
        ],
        userUpdateRate: 10,
        userListTimer: null,
      }
    },

    methods: {
      ...mapActions({
        fetchData : VStore.$actions.fetchSidebarData,
      }),
    },

    computed: {
      ...mapGetters({
        sidebarData: VStore.$getters.getSidebarData,
      }),
    },

    async mounted () {
      this.userListTimer = setInterval( async () => await this.fetchData(), this.userUpdateRate * 1000 );
    },

    beforeDestroy () {
      if ( this.userListTimer ) clearInterval( this.userListTimer );
    },
  }
</script>

<style lang='scss'>
  .hide-scrollbar {
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
