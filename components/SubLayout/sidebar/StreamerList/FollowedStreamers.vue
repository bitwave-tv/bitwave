<template>
  <div>
    <div>
      <v-slide-x-transition>
        <div
          v-if="following.length > 0"
          class="overline text-center grey--text mt-3 mb-1 tight--text"
        >FOLLOWING</div>
      </v-slide-x-transition>

      <!-- List of streams following  -->
      <template
        v-for="user in following"
      >
        <!--<v-lazy
          min-height="56"
          :key="`${user.owner}-offline`"
          transition="slide-x-transition"
        >-->
          <v-list-item
            class="py-1"
            router
            exact
            no-prefetch
            :to="user.to"
            :title="`${user.name}`"
            @click="onClick"
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
                  :src="user.avatar"
                  :alt="user.name"
                >
              </v-avatar>
            </v-list-item-avatar>
            <v-list-item-content class="py-0">
              <v-list-item-title>{{ user.title }}</v-list-item-title>
              <v-list-item-subtitle>{{ user.name }}</v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
        <!--</v-lazy>-->
      </template>
    </div>
  </div>
</template>

<script>
  import { auth, db } from '@/plugins/firebase';
  import { mapGetters } from 'vuex';
  import { VStore } from '@/store';

  const followingLimit = 10;

  export default {
    name: 'FollowedStreamers',

    data() {
      return {
        following: [],
        unsubAuthChanged: null,
      };
    },

    methods: {
      onClick () {
        if ( 'vibrate' in navigator ) window.navigator.vibrate( 10 );
      },

      async getFollowing ( userId ) {
        if ( !userId ) return;

        try {
          const { data } = await this.$axios.get( 'https://api.bitwave.tv/api/channels/list', { progress: false } );
          const query = await db
            .collection('followers')
            .where('viewerId', '==', userId)
            .limit( followingLimit )
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

    computed: {

    },

    mounted() {
      // Login listener
      this.unsubAuthChanged = auth
        .onAuthStateChanged( async user => {
          if ( user )
            await this.getFollowing( user.uid );
        });
    },

    beforeDestroy() {
      if ( this.unsubAuthChanged ) this.unsubAuthChanged();
    },

  };
</script>
