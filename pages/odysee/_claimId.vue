<template>
  <div>
    <!-- Bitwave Stream Player -->
    <bitwave-video-player
      :live="live"
      :autoplay="live"
      :docked="false"
      @ended="onEnded"
      @stats="trackWatchTime"
      class="odysee-skin"
      :odysee="true"
    >
      <template #title>
        <h5 class="white--text body-2 ml-2">{{ name }}</h5>
      </template>
    </bitwave-video-player>

    <div v-if="!mounted" class="ma-3 text-h5 text-center" style="position: absolute; top: 0; left: 0; right: 0;">
      Please enable cookies if nothing appears...
    </div>


    <!--  Chat (required for view count)  -->
    <!--  not required anymore  -->
    <div v-if="false">
      <chat
        dark
        :chat-channel="claimId"
        :force-global="false"
      />
    </div>
  </div>
</template>

<script>
import { db } from '@/plugins/firebase';
import { mapMutations } from 'vuex';
import { Player } from '@/store/player';


const CHECK_INTERVAL = 5;
const MAX_TIME = 90;

const ODYSEE_VID = 'https://cdn.bitwave.tv/static/odysee-intro.mp4';
const DEFAULT_POSTER = 'https://cdn.bitwave.tv/static/img/streaming_odysee.jpg';

export default {
  name: 'odysee-embed',

  layout: 'overlay',

  data () {
    return {
      mounted: false,
      streamDataListener: null,
      offlineResetInterval: null,

      // Stream data
      claimId: null,
      live: false,
      thumbnail: DEFAULT_POSTER,
      timestamp: null,
      type: 'video/mp4',
      url: ODYSEE_VID,

      // Derived data
      poster: DEFAULT_POSTER,
    }
  },

  methods: {
    ...mapMutations(Player.namespace, {
      setSource: Player.$mutations.setSource,
      setPoster: Player.$mutations.setPoster,
    }),

    getStreamData () {
      const claimId = this.$route.params.claimId.toLowerCase();

      // Create database listener for our claim id
      this.streamDataListener = db
        .collection( 'odysee-streams' )
        .doc( claimId )
        .onSnapshot(
          async doc => await this.onStreamDataChanged( doc.data() ),
          error => {
            console.error( error );
            this.$sentry.captureException( error );
          }
        );
    },

    // Stream data has updated for our claim id
    async onStreamDataChanged ( data ) {
      // Stream properties
      const live = data.live;

      // Process timestamp
      this.timestamp = data.timestamp
        ? data.timestamp.toDate()
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
        console.debug( `Channel is currently offline - but we've added a DB listener to detect if this changes automatically.` );
      }

      // Detect user going LIVE
      else if ( !this.live && live ) {
        // immediately set to LIVE state
        this.live = live;

        console.log( `Livestream is starting! (Channel was OFFLINE, but is now LIVE)` );
        if ( this.offlineResetInterval ) {
          clearInterval( this.offlineResetInterval );
        }

        // Load and Play stream
        this.setSource({ url, type });
      }

      // Detect user going OFFLINE
      else if ( this.live && !live ) {
        // immediately set to OFFLINE state
        this.live = live;

        console.log( 'Livestream is ending! (Channel was LIVE, but is now OFFLINE)' );

        // Experimental feature to prevent constant retries when player empties
        // This should reduce erroneous 404's on the ingestion servers

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
          this.poster = data.thumbnail;
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

    async onEnded () {
      console.log(`The current player's source media has ended.`);

      this.setSource({
        url: ODYSEE_VID,
        type: 'video/mp4',
      });
    },

    trackWatchTime ( stats ) {
      this.$ga.event({
        eventCategory : 'odysee-stream',
        eventAction   : 'watch-duration',
        eventLabel    : this.claimId,
        eventValue    : stats.duration,
      });
      this.$ga.event({
        eventCategory : 'odysee-stream',
        eventAction   : 'watch-interval',
        eventLabel    : this.claimId,
        eventValue    : stats.interval,
      });
    },
  },

  computed: {
    posterCacheBusted () {
      if ( this.live ) {
        const coeff = 1000 * 60; // Cache bust poster every minute
        const timestamp = Math.round( Date.now() / coeff ) * coeff;
        return `${this.poster}?${timestamp}`;
      } else {
        return this.poster;
      }
    },
  },

  created () {
    this.claimId = this.$route.params.claimId.toLowerCase();

    this.setPoster( this.poster );
    this.setSource({ url: this.url, type: this.type });
  },

  mounted () {
    this.getStreamData(); // Get stream data
    this.mounted = true;
  },

  beforeDestroy() {
    if ( this.streamDataListener ) this.streamDataListener();
    if ( this.offlineResetInterval ) clearInterval( this.offlineResetInterval );
  },

  validate ( { params } ) {
    // Verify claim id does not contain invalid characters
    const claimId = params.claimId;
    const validator = /^[a-zA-Z0-9._-]+$/;
    return validator.test( claimId );
  },
}
</script>

<style lang='scss'>
  @import "~assets/style/stream-player.scss";
</style>
