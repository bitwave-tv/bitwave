<template>
  <!-- User Channels -->
  <div
    class="d-flex flex-column flex-vertical hide-scrollbar"
    style="overflow-y: auto; will-change: transform; overscroll-behavior-y: contain;"
  >
    <v-list
      class="pt-0"
      dense
    >

      <div class="overline text-center grey--text my-1 tight--text">LIVE NOW</div>

      <!-- List of streams live now -->
      <transition-group
        name="fade-transition"
        tag="div"
      >
        <v-list-item
          v-for="( user ) in sidebarData"
          :key="user.owner"
          :to="user.to"
          class="py-1"
          router
          exact
          @click="onClick"
          no-prefetch
          :title="`${user.nsfw ? '(NSFQ) ' : ''}${user.name}`"
        >
          <v-list-item-avatar
            :color="user.live ? user.nsfw ? '#ff4b66' : '#13a9fe' : '#000'"
            class="my-1"
          >
            <v-avatar
              :size="user.live ? user.nsfw ? 34 : 34 : 38"
            >
              <img
                :class="{ offline : !user.live }"
                :src="`${user.avatar}`"
                :alt="user.name"
              />
            </v-avatar>
          </v-list-item-avatar>
          <v-list-item-content class="py-0">
            <v-list-item-title v-if="!collapsed">{{ user.title }}</v-list-item-title>
            <v-list-item-subtitle v-if="!collapsed">{{ user.name }}</v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
      </transition-group>

      <v-slide-x-transition>
        <div
          v-if="uid && following.length > 0"
          class="overline text-center grey--text mt-3 mb-1 tight--text"
        >FOLLOWING</div>
      </v-slide-x-transition>

      <!-- List of streams following  -->
      <template
        v-if="uid"
        v-for="( user ) in following"
      >
        <v-lazy
          min-height="56"
          :key="`${user.owner}-offline`"
          transition="slide-x-transition"
        >
          <v-list-item
            class="py-1"
            :to="user.to"
            router
            exact
            @click="onClick"
            no-prefetch
            :title="`${user.name}`"
          >
            <v-list-item-avatar
              color="#000000"
              class="my-1"
            >
              <v-avatar
                :size="40"
              >
                <img
                  :class="{ offline : !user.live }"
                  :src="`${user.avatar}`"
                  :alt="user.name"
                >
              </v-avatar>
            </v-list-item-avatar>
            <v-list-item-content class="py-0">
              <v-list-item-title v-if="!collapsed">{{ user.title }}</v-list-item-title>
              <v-list-item-subtitle v-if="!collapsed">{{ user.name }}</v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
        </v-lazy>
      </template>

      <!-- Search All Streamers -->
      <v-list-item
        class="py-0"
        to="/streamers"
        router
        exact
        @click="onClick"
        no-prefetch
      >
        <v-list-item-avatar>
          <v-avatar
            color="#eee"
            size="40"
            class="blue--text"
          >
            <v-icon light>search</v-icon>
          </v-avatar>
        </v-list-item-avatar>
        <v-list-item-content>
          <v-list-item-title>View All</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
    </v-list>
  </div>

</template>

<script>
  import { mapGetters, mapActions } from 'vuex';
  import { VStore } from '@/store';
  import { auth, db } from '@/plugins/firebase';

  export default {
    name: 'StreamerList',

    serverCacheKey: () => Math.trunc( Date.now() / ( 1000 * 10 ) ),

    props: {
      collapsed: { type: Boolean },
    },

    data() {
      return {
        items: [
          {
            icon   : 'whatshot',
            size   : 32,
            title  : 'Home',
            to     : '/',
          },
        ],

        userUpdateRate: 20,
        userListTimer: null,

        following: [],
        followingLimit: 5,
      }
    },

    methods: {
      ...mapActions({
        fetchData : VStore.$actions.fetchSidebarData,
      }),

      onClick () {
        if ( 'vibrate' in navigator ) window.navigator.vibrate( 10 );
      },

      async authenticated ( user ) {
        // if ( user ) this.$nextTick( async () => await this.getFollowing( user.uid ) );
        if ( user ) setTimeout( async () => await this.getFollowing( user.uid ), 5000 );
      },

      async getFollowing ( userId ) {
        if ( userId ) {
          try {
            const { data } = await this.$axios.get( 'https://api.bitwave.tv/api/channels/list', { progress: false } );
            const query = await db
              .collection('followers')
              .where('viewerId', '==', userId)
              .limit( this.followingLimit )
              .get();
            const streamers = query.docs.map( doc => doc.data().streamerId );
            this.following = data.users.filter( streamer => streamers.includes( streamer.owner ) && !streamer.live );
          } catch ( error ) {
            console.error( error.message );
          }
        }
      },
    },

    computed: {
      ...mapGetters({
        sidebarData: VStore.$getters.getSidebarData,
        uid : VStore.$getters.getUID,
      }),
    },

    async mounted () {
      this.userListTimer = setInterval( async () => await this.fetchData(), this.userUpdateRate * 1000 );
      this.unsubAuthChanged = auth.onAuthStateChanged( async user => await this.authenticated( user ) );
    },

    beforeDestroy () {
      if ( this.userListTimer ) clearInterval( this.userListTimer );
    },
  }
</script>

<style lang="scss">
  .v-application {
    .tight--text {
      letter-spacing: 0 !important;
    }
  }
</style>
