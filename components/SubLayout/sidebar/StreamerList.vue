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
          v-for="( user ) in liveChannelList"
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
  import { mapGetters } from 'vuex';
  import { VStore } from '@/store';
  import { auth, db } from '@/plugins/firebase';

  export default {
    name: 'StreamerList',

    serverCacheKey: () => Math.trunc( Date.now() / ( 1000 * 30 ) ),

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

        liveChannelList: [],

        userUpdateRate: 30,
        userListTimer: null,

        following: [],
        followingLimit: 5,
      }
    },

    fetchOnServer: false,

    async fetch () {
      const getLiveChannelList = async () => {
        try {
          const { data } = await this.$axios.get( 'https://api.bitwave.tv/api/channels/live', { progress: false }  );
          if ( data && data.hasOwnProperty( 'users' ) ) return  data.users;
        } catch ( error ) {
          console.warn( `Failed to update sidebar.`, error.message );
        }
      };

      const liveChannels = await getLiveChannelList();
      if ( liveChannels ) {
        this.liveChannelList = liveChannels;
      }
    },

    methods: {
      onClick () {
        if ( 'vibrate' in navigator ) window.navigator.vibrate( 10 );
      },

      async authenticated ( user ) {
        if ( user ) await this.getFollowing( user.uid );
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

            // Detect when user is not following anyone
            if ( query.empty ) return;

            const streamers = query.docs.map( doc => doc.data().streamerId );

            // Remove live streamers from following list
            this.following = data.users.filter( streamer => streamers.includes( streamer.owner ) && !streamer.live );
          } catch ( error ) {
            console.error( `Failed to get following:`, error.message );
          }
        }
      },
    },

    computed: {
      ...mapGetters({
        uid : VStore.$getters.getUID,
      }),
    },

    async mounted () {
      this.unsubAuthChanged = auth.onAuthStateChanged( async user => await this.authenticated( user ) );
      this.userListTimer = setInterval(
        async () => await this.$fetch(),
        this.userUpdateRate * 1000
      );
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
