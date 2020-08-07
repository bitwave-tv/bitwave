<template>
  <div>

    <!-- Category Label -->
    <div class="overline text-center grey--text my-1 tight--text">
      LIVE NOW
    </div>

    <!-- Skeleton loading until fetch completes -->
    <template
      v-if="liveChannelList === null"
      v-for="i in 4"
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
      <v-list-item
        v-for="( user ) in liveChannelList"
        :key="user.owner"
        :to="user.to"
        class="py-1"
        router
        exact
        @click="onClick"
        no-prefetch
        :title="`${user.nsfw ? '(NSFW) ' : ''}${user.name}`"
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
        </v-list-item-content>
      </v-list-item>
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

      this.updatingList = false;
    },

    methods: {
      onClick () {
        if ( 'vibrate' in navigator ) window.navigator.vibrate( 10 );
      },
    },

    computed: {},

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

