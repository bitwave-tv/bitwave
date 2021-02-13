<template>
  <div>

    <!-- Category Label -->
    <div class="overline text-center grey--text my-1 tight--text">
      LIVE NOW
    </div>

    <!-- Skeleton loading until fetch completes -->
    <template
      v-if="liveChannelList === null"
      v-for="i in 6"
    >
      <v-list-item
        :key="i"
        class="py-1"
      >
        <v-list-item-avatar
          class="my-1"
        >
          <v-avatar
            :size="42"
          >
            <v-skeleton-loader type="avatar" />
          </v-avatar>
        </v-list-item-avatar>
        <v-list-item-content class="py-0">
          <v-list-item-title>Loading...</v-list-item-title>
          <v-list-item-subtitle>still loading</v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
    </template>

    <!-- List of streams live now -->
    <transition-group
      v-if="liveChannelList"
      name="fade-transition"
      tag="div"
    >

      <div
        v-for="( user ) in liveChannelList"
        :key="user.owner"
      >
        <v-tooltip
          :open-delay="15"
          right
          color="blue-grey darken-4"
          transition="fade-transition"
        >
          <template #activator="{ on: tooltip }">
            <v-list-item
              v-on="{ ...tooltip }"
              :key="user.owner"
              :to="user.to"
              class="py-1"
              router
              exact
              @click="onClick"
              no-prefetch
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
                    :src="user.avatar"
                    :alt="user.name"
                  />
                </v-avatar>
              </v-list-item-avatar>
              <v-list-item-content class="py-0">
                <v-list-item-title>{{ user.title }}</v-list-item-title>
                <v-list-item-subtitle>{{ user.name }}</v-list-item-subtitle>
                <v-list-item-subtitle>{{ user.viewCount }} viewers</v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </template>

          <div
            :key="user.owner"
          >
            <h3>{{ user.title }}</h3>
            <div class="d-flex">
              <div v-if="user.nsfw" class="red--text mr-2">NSFW</div>
              {{ user.name }}
            </div>
            <div>{{ user.viewCount }} viewers </div>
          </div>

        </v-tooltip>
      </div>

    </transition-group>


    <!-- Search button -->
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

  </div>
</template>

<script>
  import { mapGetters } from 'vuex';
  import { VStore } from '@/store';

  const userUpdateRate = 30;

  export default {
    name: 'LiveStreamers',

    data() {
      return {
        liveChannelList: null,
        userListTimer: null,
        updatingList: false,
      };
    },

    fetchOnServer: false,

    async fetch () {
      if ( this.updatingList ) {
        console.log( `A streamer list update is already in progresss!` );
        return;
      }

      const getLiveChannelList = async () => {
        this.updatingList = true;
        try {
          const { data } = await this.$axios.get( 'https://api.bitwave.tv/v1/channels/live', { progress: false }  );
          if ( data && data.hasOwnProperty( 'streamers' ) ) {
            const streamers = data.streamers.map( stream => {
              return { ...stream, viewCount: this.getChannelViews( stream.name ) || 0 };
            });

            // optionally update sorting
            streamers.sort( ( a, b ) => b.viewCount - a.viewCount );

            return streamers
              .filter( stream => stream.name.toLowerCase() !== 'aflive' );
          }
        } catch ( error ) {
          console.warn( `Failed to update sidebar.`, error.message );
        }
      };

      const liveChannels = await getLiveChannelList();
      if ( liveChannels ) {
        this.liveChannelList = liveChannels;
      }

      this.updatingList = false;
    },

    methods: {
      onClick () {
        if ( 'vibrate' in navigator ) window.navigator.vibrate( 10 );
      },
    },

    computed: {
      ...mapGetters({
        getChannelViews: VStore.$getters.getChannelViews,
      }),
    },

    mounted() {
      this.userListTimer = setInterval(
        async () => await this.$fetch(),
        userUpdateRate * 1000,
      );
    },

    beforeDestroy() {
      if ( this.userListTimer ) clearInterval( this.userListTimer );
    }
  };
</script>

