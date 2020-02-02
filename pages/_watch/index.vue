<template>
  <div :style="{ paddingRight: mobile ? landscape ? '50%' : '0' : '450px' }">

    <!-- Streamer Top Bar -->
    <v-sheet
      class="py-2 px-3 hide-scrollbar"
      color="#212121"
      tile
      style="border-right: solid 1px #ffeb3b; overflow: auto"
    >
      <div class="d-flex align-center justify-space-between">
        <div class="d-flex align-center grey--text">
          <v-avatar size="32">
            <img v-if="avatar" :src="avatar" :alt="name" />
            <v-icon v-else>warning</v-icon>
          </v-avatar>
          <div class="mx-2">{{ name }}</div>
        </div>
        <div class="d-flex align-center">
          <v-chip
            v-show="nsfw"
            color="red"
            class="mr-2"
            small
            outlined
          >NSFW</v-chip>
          <KickStreamButton :streamer="name" v-if="isAdmin" />
          <FollowButton :streamer-id="owner" />
        </div>
      </div>
    </v-sheet>


    <!-- Video JS -->
    <v-responsive :aspect-ratio="16/9">
      <v-sheet
        color="grey darken-4"
        class="fill-height"
        v-intersect="{
          handler: onIntersect,
          options: {
            threshold: [ 0, 0.5, 1.0 ],
          },
        }"
      >
        <div
          :class="{ 'detach-player': smartDetach, 'elevation-6': smartDetach }"
        >
          <video
            playsinline
            id="streamplayer"
            class="video-js vjs-custom-skin vjs-big-play-centered vjs-16-9"
            controls
            autoplay
            preload="auto"
            :poster="posterCacheBusted"
            :style="{ width: '100%' }"
          >
            <source
              v-if="live"
              :src="url"
              :type="type"
            >
          </video>

          <!-- Detached player topbar overlay -->
          <div
            v-if="smartDetach"
            class="d-flex align-center justify-space-between detach-overlay"
          >
            <h5 class="white--text body-2 ml-2">{{ name }}</h5>
            <v-btn
              color="white"
              text
              icon
              pa-0
              @click="setDetach( false )"
            >
              <v-icon color="white">close</v-icon>
            </v-btn>
          </div>
        </div>

        <v-img
          v-if="smartDetach"
          :lazy-src="posterCacheBusted"
          :src="posterCacheBusted"
          height="100%"
          style="filter: grayscale(80%);"
        >
          <div class="fill-height" style="background-image: radial-gradient( transparent 50%, black )"></div>
        </v-img>
      </v-sheet>

      <!-- Video Overlay -->
      <stickers />

    </v-responsive>


    <!-- Chat -->
    <div :key="1"
      class="d-flex"
      :class="{ 'chat-desktop': !mobile || ( mobile && landscape ) }"
      :style="{
        maxHeight: mobile && !landscape ? '390px' : '100%',
        width: mobile && landscape ? '50%' : null
      }"
    >
      <chat
        :chat-channel="name"
        :hydration-data="chatMessages"
      />
    </div>


    <!-- Stream Info -->
    <stream-info
      :name="name"
      :live="live"
      :title="title"
      :nsfw="nsfw"
      :description="description"
      :timestamp="timestamp"
    />

  </div>
</template>

<script>
  import videojs from 'video.js'
  import 'videojs-contrib-quality-levels'
  import 'videojs-hls-quality-selector'

  import { mapState, mapGetters, mapMutations, mapActions } from 'vuex';
  import { db } from '@/plugins/firebase.js';

  import Chat from '~/components/Chat';
  import FollowButton from '@/components/FollowButton';
  import StreamInfo from '@/components/Channel/StreamInfo';

  import { Chat as ChatStore } from '@/store/chat';
  import { VStore } from '@/store';
  import { Player } from '@/store/player';

  const KickStreamButton = async () => await import( '@/components/Admin/KickStreamButton' );
  const Stickers = async () => await import ( '@/components/effects/Stickers' );

  export default {
    name: 'watch',

    scrollToTop: true,

    head () {
      return {
        title: `${this.name} - [bitwave.tv]`,
        link: [
          { rel: 'canonical', href: `https://bitwave.tv/${this.name}` },
        ],
        meta: [
          { name: 'og:title',       hid: 'og:title',       content: `${this.title} - [bitwave.tv]` },
          { name: 'og:description', hid: 'og:description', content: (this.description || '').substring( 0, 200 ) },
          { name: 'og:image',       hid:'og:image',        content: this.poster},
          { name: 'author',         content: this.name },
          { name: 'description',    hid: 'description',    content: (this.name || '').substring( 0, 200 ) },
          { name: 'profile:username',    content: this.name },
          { name: 'twitter:card',        content: 'summary_large_image' },
          { name: 'twitter:site',        content: '@BitwaveTV' },
          { name: 'twitter:title',       content: ( this.title || '' ).substring( 0,  70 ) },
          { name: 'twitter:description', content: ( this.description  || '' ).substring( 0, 200 ) },
          { name: 'twitter:image',       content: this.poster },
        ],
      }
    },

    components: {
      Stickers,
      KickStreamButton,
      StreamInfo,
      FollowButton,
      Chat,
    },

    data () {
      return {
        mounted: false,
        landscape: false,
        player: null,
        qualityLevels: null,
        initialized: false,
        watchDuration: 0,
        watchInterval: 60,
        lastWatch: null,
        watchTimer: null,
        showStreamStats: false,
        streamDataListener: null,
        recentBumps: [],

        // performance logging
        lastVPQ: null,


        // Hydrated data defaults
        name: '',
        avatar: null,
        title: '',
        description: '',
        poster: '',
        live: false,
        nsfw: false,
        owner: null,
        url: null,
        type: null,
        timestamp: null,

        // Chat hydrated data defaults
        chatMessages: [],
      }
    },

    methods: {
      playerInitialize () {
        this.initialized = false;

        // Create video.js player
        this.player = videojs( 'streamplayer', {
          liveui: true,
          fluid: true,
          fill: true,
          // aspectRation: '16:9',
          playbackRates: [ 0.25, 0.5, 1, 1.25, 1.5, 2 ],
          plugins: { qualityLevels: {} },
          poster: this.poster,
          html5: {
            hls: {
              overrideNative: !videojs.browser.IS_SAFARI,
              allowSeeksWithinUnsafeLiveWindow: true,
              enableLowInitialPlaylist: true,
              handlePartialData: true,
            },
          },
        });

        window.$bw = {
          player: this.player,
          getVideoLogs: this.player.log.history,
          hls: null,
        };

        // --- Video.js plugin functions

        // Add reloadSourceOnError plugin
        this.player.reloadSourceOnError({ errorInterval: 10 });

        // Load all qualities
        this.qualityLevels = this.player.qualityLevels();
        this.player.hlsQualitySelector({
          displayCurrentQuality: true,
        });


        // Autoplay detection magic
        /*const autoPlayEvents = [ 'loadedmetadata', 'durationchange' ];
        const autoPlayListener = event => {
          // Attempt Autoplay
          const attemptAutoplay = () => {
            this.player.play()
              .then(() => {
                if ( process.env.APP_DEBUG ) console.log( `Autoplayed` )
              })
              .catch ( error => {
                if ( process.env.APP_DEBUG ) console.log( `Autoplay prevented, Attempting to autoplay muted.`, error );
                this.player.muted( true );
                this.player.play();
              });
          };
          if (event.type === 'durationchange' && this.player.duration() === Infinity) {
            attemptAutoplay();
            this.player.off( autoPlayEvents, autoPlayListener );
          }
          if (event.type === 'loadedmetadata') {
            attemptAutoplay();
            this.player.off( autoPlayEvents, autoPlayListener );
          }
        };
        this.player.on( autoPlayEvents, autoPlayListener ); //*/


        // Video Player Ready
        this.player.ready( async () => {
          // Restore Volume & mute
          try {
            console.log( `Volume: ${this.player.volume()}, Muted: ${this.player.muted()}` );
            let muted = JSON.parse( localStorage.getItem( 'muted' ) );
            if ( muted !== null ) this.player.muted( muted );
            let volume = localStorage.getItem( 'volume' );
            if ( volume !== null ) this.player.volume( volume );
          } catch ( error ) {
            console.warn( 'Failed to find prior volume level' ); // No volume value in memory
          }

          const playerTech = this.player.tech({ IWillNotUseThisInPlugins: true });

          playerTech.on( 'retryplaylist', ( event ) => {
            console.log( `retryplaylist:`, event );
            if ( !this.live ) console.log( `livestream is offline.` );
          });

          playerTech.on( 'usage', ( event ) => {
            console.log( `${event.name}:`, event );
          });

          this.player.liveTracker.on( 'liveedgechange', async () => {
            // This is currently an opt-in feature
            if ( !this.pinToLive ) return;

            // Only respond to when we fall behind
            if ( this.player.liveTracker.atLiveEdge() ) return;

            // Don't respond to when user has paused the player
            if ( this.player.paused() ) return;

            console.log('We have fallen behind live!');

            setTimeout(() => {
              // Do not jump ahead if user has paused the player
              if ( this.player.paused() ) return;

              console.log( 'Attempting to catch back up to live.' );
              this.player.liveTracker.seekToLiveEdge();
            }, 5 * 1000 );
          });

          this.setSource({ url: this.url, type: this.type });

          this.initialized = true;
        });

        // Save volume on change
        this.player.on( 'volumechange', () => {
          if ( !this.initialized ) return;
          const volume = this.player.volume();
          const muted  = this.player.muted();
          if ( typeof volume === 'undefined' || typeof muted === 'undefined' ) return;
          localStorage.setItem( 'volume', volume );
          localStorage.setItem( 'muted',  muted );
        });

        // PiP events
        this.player.on( 'enterpictureinpicture', () => {
          this.setDetach( false );
        });

        // Begin playing when new media is loaded
        this.player.on( 'loadeddata', () => {
          if ( !window.$bw.hls && this.live ) window.$bw.hls = this.player.tech({ IWillNotUseThisInPlugins: true }).hls;
        });

        this.player.on( 'ended', async () => {
          this.setSource({ url: await this.getRandomBump(), type: 'video/mp4' });
        });

        this.player.on( 'error', error => {
          // Brush player errors under the rug
          if ( !this.live ) console.log( 'streamer offline and got an error' );
          console.warn( `player error:`, error );
        });

        this.getStreamData(); // Get stream data
      },

      trackWatchTime () {
        this.watchDuration += this.watchInterval;
        this.$ga.event({
          eventCategory : 'stream',
          eventAction   : 'watch-time',
          eventLabel    : this.name,
          eventValue    : this.watchDuration / 60,
        });
        this.$ga.event({
          eventCategory : 'stream',
          eventAction   : 'watch-interval',
          eventLabel    : this.name,
          eventValue    : this.watchInterval / 60,
        });
        this.checkDroppedFrames();
      },

      async getRandomBump () {
        const { data } = await this.$axios.get( `https://api.bitwave.tv/api/bump` );
        // limit to checking 15 most recent bumps
        if ( this.recentBumps.length >= 15 ) this.recentBumps = this.recentBumps.splice( -15 );
        // Recurse until we get a fresh bump
        if ( this.recentBumps.includes( data.url ) ){
          console.log(`Recently seen ${data.url}, getting a new bump`);
          return await this.getRandomBump();
        }
        this.recentBumps.push( data.url );
        return data.url;
      },

      playerDispose (){
        if ( this.player ) this.player.dispose();
      },

      getStreamData () {
        const streamer  = ( this.name || this.channel ).toLowerCase();
        this.streamDataListener = db
          .collection( 'streams' )
          .doc( streamer )
          .onSnapshot(
            async doc => await this.streamDataChanged( doc.data() ),
            error => console.warn( error )
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

        // Stream media
        const url  = data.url;
        const type = data.type || `application/x-mpegURL`; // DASH -> application/dash+xml

        // Cover image
        if ( live ) this.poster = data.thumbnail;

        // Detect offline stream
        if ( !this.live && !live ) console.debug( 'User is offline' );

        // Detect user going live
        else if ( !this.live && live ) {
          console.log( 'Livestream starting' );
          this.live = live;

          // Load and Play stream
          this.setSource({ url, type });
        }

        // Detect user going [ online -> offline ]
        /*else if ( this.live && !live ) {
          console.log( 'Livestream ending' );
        }*/

        // Detect source change
        else if ( this.url !== url  || this.type !== type ) {
          this.setSource({ url, type });
        }

        this.live = live;
      },

      reloadPlayer () {
        // this.player.reset(); this.player.load();
        if ( !this.initialized ) return;
        this.player.poster = this.poster;
        this.player.src( { src: this.url, type: this.type } );
      },

      // Logs & reports dropped frames
      checkDroppedFrames () {
        // disable reporting when stream is offline
        if ( !this.live ) return;

        // Ensure we have access to HLS tech & stats
        if ( !$bw || !$bw.hls || !$bw.hls.stats ) return;

        if ( !this.lastVPQ ) {
          this.lastVPQ = { ...$bw.hls.stats.videoPlaybackQuality };
          return;
        }

        const playbackQuality = { ...$bw.hls.stats.videoPlaybackQuality };

        // Ensure we have enough data to prevent false positives
        if ( !playbackQuality.totalVideoFrames > 6000 ) return;

        // Detect how many frames we have dropped since our last check
        const percentDroppedFrames = (
          ( playbackQuality.droppedVideoFrames - this.lastVPQ.droppedVideoFrames )
          / ( playbackQuality.totalVideoFrames - this.lastVPQ.totalVideoFrames )
            * 100 );

        // Log dropped frames at various levels
        if ( percentDroppedFrames >= 20)
          console.warn( `We have dropped more than 20% of frames!\n${percentDroppedFrames.toFixed(1)}% of frames (${playbackQuality.droppedVideoFrames - this.lastVPQ.droppedVideoFrames}) dropped since our last check.` );
        else if ( percentDroppedFrames >= 5 )
          console.log( `We have dropped more than 5% of frames!\n${percentDroppedFrames.toFixed(1)}% of frames (${playbackQuality.droppedVideoFrames - this.lastVPQ.droppedVideoFrames}) dropped since our last check.` );
        else if ( percentDroppedFrames > 0 )
          console.debug( `Good news, we have dropped very few (if any) frames.\nOnly ${percentDroppedFrames.toFixed(1)}% of frames (${playbackQuality.droppedVideoFrames - this.lastVPQ.droppedVideoFrames}) dropped since our last check.` );

        // Log dropped frames for analyzing and finding bottlenecked regions
        this.$ga.event({
          eventCategory : 'playback-errors',
          eventAction   : 'dropped-frames',
          eventLabel    : this.name,
          eventValue    : percentDroppedFrames,
        });

        // Update for next loop
        this.lastVPQ = { ...$bw.hls.stats.videoPlaybackQuality };
      },

      onIntersect ( entries, observer ) {
        this.setDetach( entries[0].intersectionRatio <= 0.5 );
      },

      onOrientationChange () {
        this.landscape = ( window.orientation || screen.orientation.angle ) !== 0;
      },

      ...mapMutations(Player.namespace, {
        setSource: Player.$mutations.setSource,
        setDetach: Player.$mutations.setDetach,
      }),

      ...mapActions( Player.namespace, {
        loadSettings: Player.$actions.loadSettings,
      }),
    },

    async asyncData ( { $axios, params, store, error } ) {
      const channel = params.watch;

      const getChannelHydration = async () => {
        let channelData = null;

        // Attempt to load via API server
        try {
          const { data } = await $axios.get( `https://api.bitwave.tv/api/channel/${channel}` );
          // Simple response validation
          if ( data && data.hasOwnProperty( 'name' ) ) {
            channelData = data;
          }
        }

        // API server failed
        catch ( error ) {
          console.error( error.message );

          // API failed with 404, but server did not fail with 5xx
          if ( error.response && error.response.status === 404 ) {
            console.error( `API server reponded with 404` );
            return { success: false, error: { statusCode: 404, message: `Could not find channel.` } };
          }
        }

        // API server failed unexpectedly 5xx - Attempt to load from database
        if ( !channelData ) {
          // API server failed, query database directly
          try {
            console.log( `API server failed! Attempting to bypass.` );

            const streamer  = channel.toLowerCase();

            const streamDoc = await db
              .collection( 'streams' )
              .doc( streamer )
              .get();

            // Channel does not exist in database (404)
            if ( !streamDoc.exists ) {
              console.error( `Database query did not find streamer!` );
              return { success: false, error: { statusCode: 404, message: `Could not find channel.` } };
            }

            const data = streamDoc.data();

            // Re-map channel data
            channelData = {
              name: data.user.name,
              avatar: data.user.avatar,
              to: `/${data.user.name}`,
              title: data.title,
              description: data.description,
              poster: data.cover,
              thumbnail: data.thumbnail,
              live: data.live,
              nsfw: data.nsfw,
              url: data.url,
              owner: data.owner,
            };

          }

          // API & Database query failure
          catch ( error ) {
            console.error( `Database query failed!` );
            console.error( error.message );
            return { success: false, error: { statusCode: 500, message: `Bitwave API cache failed & Bitwave Database API failed!\n${error.message}` } };
          }
        }

        try {
          const data = channelData;

          // Streamer user properties
          const name   = data.name;
          const avatar = data.avatar;
          const owner  = data.owner;

          // Stream data
          const title       = data.title;
          const description = data.description;

          // Stream properties
          const nsfw = data.nsfw;
          const live = data.live;

          // Stream media
          let type = data.type || `application/x-mpegURL`; // DASH -> application/dash+xml
          let url  = data.url;

          // Process timestamp
          const timestamp = data.timestamp
            ? new Date( data.timestamp )
            : null;

          // Process cover image
          const poster = live
            ? data.thumbnail
            : data.poster;


          // Fallback to bump if offline
          if ( live === false ) {
            try {
              const { data } = await $axios.get( 'https://api.bit.wave.tv/api/bump' );
              url = data.url;
              type = 'video/mp4';
            } catch ( error ) {
              console.error( error.message );
              url  = 'https://cdn.bitwave.tv/static/bumps/2a3un.mp4';
              type = 'video/mp4';
            }
          }

          return {
            success: true,
            data: {
              name,
              avatar,
              title,
              description,
              poster,
              live,
              nsfw,
              owner,
              url,
              type,
              timestamp,
            }
          }
        }

        // Unknown error, unlikely to occur
        catch ( error ) {
          console.error( error.message );
          return { success: false, error: { statusCode: 500, message: `Unknown API Error!\n${error.message}` } };
        }

        // Should never occur
        return { success: false, error: { statusCode: 500, message: `This should never occur.` } };
      };

      const getChatHydration = async () => {
        try {
          const global = store.state[ChatStore.namespace][ChatStore.$states.global];
          const { data } = await $axios.get( `https://chat.bitwave.tv/v1/messages${ global ? '' : `/${channel}` }` );
          if ( data && data.success ) return data.data;
        } catch ( error ) {
          console.log( `Chat hydration request failed` );
          console.error( error.message );
        }
        return null;
      };


      // Get Channel data for page
      const channelData = await getChannelHydration();
      console.log( channelData );
      if ( channelData.success === false  ) {
        console.log( `Channel Data API failed - Displaying error page.` );
        error( { ...channelData.error } );
        return;
      }

      // Get chat data for chat
      const chatMessages = await getChatHydration();
      if ( !chatMessages ) {
        const errorMessage = `Failed to load chat data for ${channel}`;
        console.error( errorMessage );
      }

      return {
        channel: channel,
        ...channelData.data,
        chatMessages: chatMessages || [],
      };
    },

    computed: {
      ...mapState(Player.namespace, {
        source : Player.$states.source,
        pinToLive : Player.$states.keepLive,
        detach : Player.$states.detach,
      }),

      ...mapGetters({
        username : VStore.$getters.getUsername,
        user     : VStore.$getters.getUser,
        isAdmin  : VStore.$getters.isAdmin,
      }),

      posterCacheBusted () {
        if ( this.live ) {
          const coeff = 1000 * 60; // Cache bust poster every minute
          const timestamp = Math.round( Date.now() / coeff ) * coeff;
          return `${this.poster}?${timestamp}`;
        } else {
          return this.poster;
        }
      },

      mobile () {
        return this.mounted
          ? this.$vuetify.breakpoint.smAndDown
          : !this.$device.isDesktopOrTablet;
      },

      smartDetach () {
        return this.detach
          && !this.mobile
          && this.player
          && !this.player.isInPictureInPicture();
      },
    },

    watch: {
      pinToLive ( pin ) {
        if ( this.player && this.live && pin ) {
          this.player.liveTracker.trigger( 'liveedgechange' );
        }
      },

      source ( newSource ) {
        this.url  = newSource.url;
        this.type = newSource.type;
        this.reloadPlayer();
      },
    },

    async validate ( { params } ) {
      // Verify username is valid
      const user = params.watch;
      const validator = /^[a-zA-Z0-9._-]+$/;
      return validator.test( user );
    },

    async mounted () {
      if ( this.live ) this.watchTimer = setInterval( () => this.trackWatchTime(), 1000 * this.watchInterval );

      await this.loadSettings();

      this.landscape = ( window.orientation || screen.orientation.angle ) !== 0;
      window.addEventListener( 'orientationchange', this.onOrientationChange );

      this.playerInitialize();

      this.mounted = true;
    },

    beforeDestroy () {
      window.removeEventListener( 'orientationchange', this.onOrientationChange );
      if ( this.streamDataListener ) this.streamDataListener();
      if ( this.watchTimer ) clearInterval( this.watchTimer );
      this.playerDispose();
    },
  }
</script>

<style lang='scss'>
  @import "~assets/style/stream-player.scss";

  .detach-player {
    position: fixed;
    left: 80px;
    bottom: 16px;
    margin: 1rem;
    width: 20rem;
    height: 11.25rem;
    z-index: 10;
    overflow: hidden;

    &:hover .detach-overlay {
      transform: translateY( 0 );
    }
  }

  .detach-overlay {
    width: 100%;
    position: absolute;
    top: 0;
    transform: translateY( -100% );
    transition: .1s;
    background-color: rgba(0,0,0,.75);
  }
</style>
