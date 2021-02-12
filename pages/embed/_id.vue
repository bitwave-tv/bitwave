<template>
    <div>

      <!-- Countdown to Live -->
      <div
        v-if="showCountdown"
        style="position:absolute; display: flex; justify-content: flex-end; width: 100%; padding: 1rem;"
      >
        <div
          style="position: relative; z-index: 10; opacity: 80%;"
        >
          <countdown
            :timestamp="new Date( scheduled )"
            :key="scheduled"
          />
        </div>
      </div>

      <stream-player
        :poster="posterCacheBusted"
        :autoplay="autoplay"
        :class="{ 'odysee-skin': isOdysee }"
        :odysee="isOdysee"
      />

      <!-- Footer -->
      <v-sheet
        v-if="!isOdysee"
        class="pa-2"
        color="grey darken-4"
        tile
      >
        <div class="overline">Powered by Bitwave Media</div>
      </v-sheet>

      <div v-show="false">
        <chat
          dark
          :chat-channel="name"
          :force-global="false"
        />
      </div>
    </div>
</template>

<script>
  import StreamPlayer from '@/components/Channel/StreamPlayer';

  import { mapMutations, mapState } from 'vuex';
  import { Player } from '@/store/player';

  import { db } from '@/plugins/firebase';


  const ODYSEE_VID = 'https://cdn.bitwave.tv/static/odysee-intro.mp4';

  export default {
    name: 'embed-id',

    layout: 'overlay',

    components: { StreamPlayer },

    data () {
      return {
        name: null,
        avatar: null,
        title: null,
        description: null,
        poster: null,
        live: null,
        nsfw: null,
        owner: null,
        url: null,
        type: null,
        scheduled: null,
      };
    },

    methods: {
      ...mapMutations(Player.namespace, {
        setSource: Player.$mutations.setSource,
        setPoster: Player.$mutations.setPoster,
      }),

      getStreamData () {
        const channel = this.$route.params.id;
        const streamer  = (this.name || channel ).toLowerCase();
        this.streamDataListener = db
          .collection( 'streams' )
          .doc( streamer )
          .onSnapshot(
            async doc => await this.streamDataChanged( doc.data() ),
            error => {
              this.$sentry.captureException( error );
            }
          );
      },

      async streamDataChanged ( data ) {
        // Streamer user properties
        this.name   = data.user.name;
        this.avatar = data.user.avatar;
        this.owner  = data.owner;

        // Grab Stream Data
        this.title       = data.title;
        this.description = data.description;

        // Stream properties
        this.nsfw  = data.nsfw;
        const live = data.live;

        // Process timestamp
        this.timestamp = data.timestamp
          ? data.timestamp.toDate()
          : null;

        // Process scheduled date
        this.scheduled = data.scheduled
          ? data.scheduled.toDate().toString()
          : null;

        // Stream media
        const url  = data.url;
        const type = data.type || `application/x-mpegURL`; // DASH -> application/dash+xml

        // Cover image
        if ( live ) {
          this.poster = data.thumbnail;
          this.setPoster( data.thumbnail );
        }

        // Detect offline stream
        if ( !this.live && !live ) {
          console.debug( 'User is offline' );
        }

        // Detect user going LIVE
        else if ( !this.live && live ) {
          // immediately set to LIVE state
          this.live = live;

          console.log( 'Livestream starting' );
          if ( this.offlineResetInterval ) clearInterval( this.offlineResetInterval );

          // Load and Play stream
          this.setSource({ url, type });
        }

        // Detect user going OFFLINE
        else if ( this.live && !live ) {
          // immediately set to OFFLINE state
          this.live = live;

          console.log( 'Livestream ending' );

          // Experimental feature to prevent constant retries when player empties
          // This should reduce erroneous 404's on the ingestion servers

          const CHECK_INTERVAL = 5;
          const MAX_TIME = 90;

          // Try to prevent resetting while watching stale data
          const canReset = () => {
            const atLiveEdge = $bw.player.liveTracker && $bw.player.liveTracker.atLiveEdge();
            const isPaused   = $bw.player.paused();
            return atLiveEdge && !isPaused;
          };

          // Attempt to end stream and reset player
          let TIME = 0;
          const endStream = async () => {
            // Abort if stream goes live
            if ( this.live ) {
              clearInterval( this.offlineResetInterval );
              return;
            }

            // Always increment time
            TIME += CHECK_INTERVAL;

            // Check if satisfy requirements or have exceeded our max time
            if ( !canReset() &&  TIME <= MAX_TIME ) return;

            // Remove our interval
            if ( this.offlineResetInterval ) clearInterval( this.offlineResetInterval );

            // Reset basic player properties
            this.poster = data.cover;

            this.setPoster( data.thumbnail );
            this.setSource({
              url: ODYSEE_VID,
              type: 'video/mp4',
            });
          };

          // Keep timer ID so we can cancel early if stream recovers
          this.offlineResetInterval = setInterval( async () => await endStream(), CHECK_INTERVAL * 1000 );
        }

        // Detect source change
        else if ( this.source.url !== url  || this.source.type !== type ) {
          this.setSource({ url, type });
        }

        this.live = live;
      },
    },

    computed: {
      ...mapState(Player.namespace, {
        source : Player.$states.source,
      }),

      autoplay () {
        if ( !this.live ) return false;
        return this.$route.query.autoplay === 'true' ||
          this.$route.query.autoplay === '1' ||
          false;
      },

      overlayId () {
        return this.$route.params.id;
      },

      isOdysee () {
        const skin = this.$route.query.skin || this.$route.query.s;
        return skin && skin.toLowerCase() === 'odysee';
      },

      posterCacheBusted () {
        if ( this.live ) {
          const coeff = 1000 * 60; // Cache bust poster every minute
          const timestamp = Math.round( Date.now() / coeff ) * coeff;
          return `${this.poster}?${timestamp}`;
        } else {
          return this.poster;
        }
      },


      // TODO: hookup data to detect when the last stream was
      showCountdown () {
        if ( this.live ) return false;
        if ( !this.scheduled ) return false;
        // if ( !this.timestamp ) return false;

        // Do not show countdown if last streamed timestamp is after scheduled
        // if ( this.timestamp > this.scheduled ) return false;

        return true;
      },
    },

    async asyncData ( { $axios, params, query } ) {
      const user = params.id;
      const skin = query.skin || query.s;
      const isOdysee = skin && skin.toLowerCase() === 'odysee';

      // adjust default image according to skin
      const errorPoster = isOdysee
        ? 'https://cdn.bitwave.tv/static/img/BitWave2.sm.jpg'
        : 'https://cdn.bitwave.tv/static/img/odysee-banner-live-mockup-2.jpg';

      // Timeout to prevent SSR from locking up
      const timeout = process.server
        ? process.env.SSR_TIMEOUT
        : 0;

      try {
        const { data } = await $axios.getSSR( `https://api.bitwave.tv/api/channel/${user}`, { timeout } );

        const name   = data.name;
        const avatar = data.avatar;
        let   poster = data.poster || errorPoster;
        const title  = data.title ;
        const desc   = data.description;
        const live   = data.live;
        const nsfw   = data.nsfw;
        const owner  = data.owner;
        const scheduled = data.scheduled || false;
        let   type   = data.type   || `application/x-mpegURL`; // DASH -> application/dash+xml
        let   url    = data.url;

        const thumb  = data.thumbnail;
        if ( data.thumbnail ) poster = live ? thumb : poster;

        if ( !live ) {
          // Force override offline bump video for odysee
          if ( isOdysee ) {
            url = ODYSEE_VID;
            type = 'video/mp4';
          } else {
            const { data } = await $axios.getSSR( 'https://api.bitwave.tv/api/bump', { timeout } );
            url = data.url;
            type = 'video/mp4';
          }
        }

        return { name, avatar, title, description: desc, poster, live, nsfw, owner, url, type, scheduled };

      } catch ( error ) {
        console.log( `ERROR: Failed to find user ${user}: ${error.message}` );

        return {
          name   : '404 Error',
          avatar : 'https://cdn.bitwave.tv/static/img/glitchwave.gif',
          poster : errorPoster,
          title  : 'Streamer not found',
          description : 'Invalid Stream',
          live   : false,
          nsfw   : false,
          url    : null,
          type   : null,
          scheduled : false,
        }
      }
    },

    mounted () {
      this.getStreamData();
    },

    async created () {
      this.setPoster( this.poster );
      this.setSource({ url: this.url, type: this.type });
    },
  };
</script>
