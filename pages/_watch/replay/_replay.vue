<template>
  <div :style="{
    marginRight: pageMarginRight,
    borderTight: 'solid 1px #212121',
  }">

    <!-- Streamer Top Bar -->
    <v-sheet
      class="py-2 px-3 hide-scrollbar bw-channel-topbar"
      color="accentwave"
      tile
    >
      <div class="d-flex align-center justify-space-between">
        <div class="d-flex align-center grey--text">
          <v-avatar size="32">
            <img
              v-if="avatar"
              :src="`${avatar}`"
              :alt="name"
            />
            <v-icon v-else>account_circle</v-icon>
          </v-avatar>
          <div class="mx-2">{{ name }}</div>
        </div>
        <div class="d-flex align-center">
          <template v-if="nsfw">
            <div class="font-weight-bold red--text body-2">NSFW</div>
            <v-divider vertical class="mx-2"/>
          </template>
          <KickStreamButton
            v-if="isAdmin"
            :streamer="name"
          />
          <FollowButton
            :streamer-id="owner"
          />
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
        <div :class="{
          'detach-player': smartDetach,
          'elevation-6': smartDetach,
        }">
          <video
            playsinline
            id="streamplayer"
            class="video-js vjs-custom-skin vjs-big-play-centered vjs-16-9 bw-vjs-replay"
            controls
            :autoplay="live || !disableBumps"
            preload="auto"
            :poster="posterCacheBusted"
            :style="{ width: '100%' }"
          ></video>

          <!-- Detached player topbar overlay -->
          <div
            v-if="smartDetach"
            class="d-flex align-center detach-overlay"
          >
            <h5 class="white--text body-2 ml-2">{{ name }}</h5>
            <v-spacer/>
            <v-btn
              color="white"
              text
              icon
              pa-0
              @click="openPiP"
            >
              <v-icon color="white">picture_in_picture</v-icon>
            </v-btn>
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
    <div
      v-if="displayChat"
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

    <!-- Restore chat FAB -->
    <v-fab-transition>
      <v-btn
        v-show="!displayChat"
        color="primary"
        fixed
        fab
        dark
        bottom
        right
        class="v-btn--example"
        @click="showChat"
      >
        <v-icon color="black">question_answer</v-icon>
      </v-btn>
    </v-fab-transition>


    <!-- Replay Info -->
    <replay-info
      :archive-id="$route.params.replay"
      :name="name"
      :title="title"
      :nsfw="nsfw"
      :description="description"
      :timestamp="timestamp"
      :comment-count="commentCount"
      :views="views"
      @update="replayUpdated"
      @click:timestamp="onClickTimestamp"
      replay
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
  import ReplayInfo from '@/components/Replay/ReplayInfo';

  import { Chat as ChatStore } from '@/store/chat';
  import { VStore } from '@/store';
  import { Player } from '@/store/player';

  const KickStreamButton = async () => await import( '@/components/Admin/KickStreamButton' );
  const Stickers = async () => await import ( '@/components/effects/Stickers' );

  export default {
    name: 'replay',

    scrollToTop: true,

    head () {
      return {
        title: `${this.name} - [bitwave.tv]`,
        link: [
          { rel: 'canonical', href: `https://bitwave.tv/${this.name}/replay/${this.archiveId}` },
        ],
        meta: [
          { name: 'og:title',       hid: 'og:title',       content: `${this.title} - [bitwave.tv]` },
          { name: 'og:description', hid: 'og:description', content: ( this.description || `${this.name ? this.name : 'Unknown streamer'}'s stream replay.` ).substring( 0, 200 ) },
          { name: 'og:image',       hid:'og:image',        content: this.poster},
          { name: 'author',         content: this.name },
          { name: 'description',    hid: 'description',    content: ( this.description  || `${this.name ? this.name : 'Unknown streamer'}'s stream replay.` ).substring( 0, 200 ) },
          { name: 'profile:username',    content: this.name },
          { name: 'twitter:card',        content: 'summary_large_image' },
          { name: 'twitter:site',        content: '@BitwaveTV' },
          { name: 'twitter:title',       content: ( this.title || '' ).substring( 0,  70 ) },
          { name: 'twitter:description', content: ( this.description  || `${this.name ? this.name : 'Unknown streamer'}'s stream replay.` ).substring( 0, 200 ) },
          { name: 'twitter:image',       content: this.poster },
        ],
      }
    },

    components: {
      Stickers,
      KickStreamButton,
      ReplayInfo,
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
        poster: 'https://cdn.bitwave.tv/static/img/Bitwave_Banner.jpg',
        live: false,
        nsfw: false,
        owner: null,
        url: null,
        type: null,
        timestamp: null,
        commentCount: 0,
        views: 0,

        // Chat hydrated data defaults
        chatMessages: null,
      }
    },

    async asyncData ( { $axios, store, params, error } ) {
      // Timeout to prevent SSR from locking up
      const timeout = process.server ? process.env.SSR_TIMEOUT : 0;

      const getReplayHydration = async id => {
        let replayData;

        // Attempt to load via API server
        try {
          const { data } = await $axios.getSSR( `https://api.bitwave.tv/v1/replays/${id}`, { timeout } );

          // Simple response validation
          if ( data && data.success ) {
            replayData = data.data;
          }
        }

          // API server failed
        catch ( error ) {
          console.error( error.message );

          // API failed with 404, but server did not fail with 5xx
          if ( error.response && error.response.status === 404 ) {
            console.error( `API server reponded with 404` );
            return {
              success: false,
              error: { statusCode: 404, message: `Could not find channel.` },
            };
          }
        }

        // API server failed unexpectedly 5xx - Attempt to load from database
        if ( !replayData ) {
          console.log( `API server failed!` );
          return {
            success: false,
            error: { statusCode: 500, message: `API request failed.` },
          };
        }

        // return results
        const name = replayData.user && replayData.user.name;
        const title = replayData.title;
        const nsfw = replayData.nsfw;

        const commentCount = replayData.commentCount;
        const views = replayData.views;

        return {
          success: true,
          data: {
            name,
            title,
            nsfw,
            commentCount,
            views,
          },
        }

      };

      const result = await getReplayHydration( params.replay );

      if ( result.success ) {
        return result.data;
      } else {
        return {
          name: params.watch,
          title: 'SSR Error',
          nsfw: false,
        };
      }

    },

    methods: {
      playerInitialize () {
        this.initialized = false;

        // Create video.js player
        this.player = videojs( 'streamplayer', {
          liveui: false,
          fluid: true,
          fill: false,
          // aspectRation: '16:9',
          playbackRates: [ 0.25, 0.5, 1, 1.25, 1.5, 2 ],
          plugins: { qualityLevels: {} },
          poster: this.poster,
          inactivityTimeout: 2000,
          suppressNotSupportedError: true,
          controlBar: {
            // currentTimeDisplay : true,
            // timeDivider: true,
            // durationDisplay: true,
            remainingTimeDisplay: false,
          },
          userActions: {
            hotkeys: true,
          },
          html5: {
            hls: {
              overrideNative: !videojs.browser.IS_SAFARI,
              allowSeeksWithinUnsafeLiveWindow: true,
              enableLowInitialPlaylist: true,
              handlePartialData: true,
              smoothQualityChange: true,
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


        // Scroll to adjust volume
        // player.controlBar.volumePanel.volumeControl
        const volumeControlElement = this.player.controlBar.volumePanel.volumeControl.el();

        const handleVolumeScroll = ( event ) => {
          event.preventDefault();
          if ( this.player.muted() ) return;
          const vol = this.player.volume();
          // Scroll 'up'
          if ( event.deltaY < 0 ) this.player.volume( Math.min( 1.0, ( vol + .05 ) ) );
          // Scroll 'down'
          if ( event.deltaY > 0 ) this.player.volume( Math.max( 0.0, ( vol - .05 ) ) );
        };

        // Player is active (mouseover)
        this.player.on( 'useractive', () => {
          volumeControlElement.addEventListener( 'wheel', handleVolumeScroll );
        });

        // Player is inactive
        this.player.on( 'userinactive', () => {
          volumeControlElement.removeEventListener( 'wheel', handleVolumeScroll );
        });

        // Add event listener by default in case user loads with cursor over stream
        volumeControlElement.addEventListener( 'wheel', handleVolumeScroll );



        //---------------------------
        // UX Tweaks & Enhancements
        //---------------------------

        // Prevent volume bar from pushing around the live button
        const controlBar = this.player.controlBar;
        const removeHover = el => el.removeClass( 'vjs-hover' );
        const removeVolumePanelHover = () => removeHover( controlBar.volumePanel );
        // disable default behavior
        controlBar.volumePanel.off( 'mouseout' );
        // reset on control bar mouse out
        controlBar.on( 'mouseleave', removeVolumePanelHover );
        // reset when mouseover spacer
        controlBar.customControlSpacer.on( 'mouseenter', removeVolumePanelHover );

        // remove UI instantly when mouse leaves player
        this.player.on( 'mouseleave', () => this.player.userActive(false) );
        //--------------------------------------------------------------------


        if ( this.jumpToTimestamp && this.jumpToTimestamp > 0 ) {
          const onLoadedMetadata = () => this.player.currentTime( this.jumpToTimestamp );
          this.player.on( 'loadedmetadata', onLoadedMetadata );
        }


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

      async trackReplayView () {
        const url = `https://api.bitwave.tv/v1/replays/${this.archiveId}/watch`;
        try {
          await this.$axios.get( url );
        } catch ( error ) {
          console.error( `Failed to track replay view`, error.message );
        }
      },

      playerDispose (){
        if ( this.player ) this.player.dispose();
      },

      async getStreamData () {
        const archiveData = await db
          .collection( 'archives' )
          .doc( this.archiveId )
          .get();

        if ( !archiveData.exists ) {
          console.warn( `Archive does not exist!` );
          return;
        }

        // Process stream data
        await this.streamDataChanged( archiveData.data() );
      },

      async streamDataChanged ( data ) {
        // Streamer user properties
        // this.name   = data.user.name;
        if ( data.hasOwnProperty( 'user' ) ) {
          this.avatar = data.user.avatar;
        }

        this.owner  = data.owner;

        // Grab Stream Data
        this.name   = data.name;
        this.title  = data.title;

        // Stream properties
        this.nsfw  = data.nsfw;
        this.commentCount = data.commentCount;
        this.views = data.views;

        // Process timestamp
        this.timestamp = data.timestamp
          ? data.timestamp.toDate()
          : null;

        // Stream media
        const url  = data.url;
        const type = 'video/mp4';

        this.setSource({ url, type });

        // Cover image
        // this.poster = data.thumbnail;

        this.live = true;
      },

      reloadPlayer () {
        // this.player.reset(); this.player.load();
        if ( !this.initialized ) return;
        this.player.poster = this.poster;
        this.player.src( { src: this.url, type: this.type } );
      },

      onIntersect ( entries, observer ) {
        this.setDetach( entries[0].intersectionRatio <= 0.5 );
      },

      onOrientationChange () {
        this.landscape = ( window.orientation || screen.orientation.angle ) !== 0;
      },

      onClickTimestamp () {
        this.player.currentTime( this.jumpToTimestamp );
      },

      showChat () {
        this.setDisplayChat( true );
        this.$analytics.logEvent( 'show_chat' );
      },

      ...mapMutations(Player.namespace, {
        setSource: Player.$mutations.setSource,
        setDetach: Player.$mutations.setDetach,
      }),

      ...mapMutations(ChatStore.namespace,{
        setDisplayChat: ChatStore.$mutations.setDisplayChat,
      }),

      ...mapActions( Player.namespace, {
        loadSettings: Player.$actions.loadSettings,
      }),

      async openPiP () {
        try {
          await this.player.requestPictureInPicture();
        } catch ( error ) {
          console.error( error.message );
        }
      },

      replayUpdated ( replayData ) {
        this.title  = replayData.title;
      },
    },

    computed: {
      ...mapState(Player.namespace, {
        source : Player.$states.source,
        pinToLive : Player.$states.keepLive,
        disableBumps : Player.$states.disableBumps,
        detach : Player.$states.detach,
      }),

      ...mapState(ChatStore.namespace, {
        displayChat: ChatStore.$states.displayChat
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

      pageMarginRight () {
        if ( !this.displayChat ) return '0';
        return this.mobile
          ? this.landscape
            ? '50%'
            : '0'
          : '450px';
      },

      archiveId () {
        return this.$route.params.replay;
      },

      jumpToTimestamp () {
        const t = this.$route.query.t;
        const timeInSeconds = parseInt( t );
        return timeInSeconds;
      },
    },

    watch: {
      pinToLive ( pin ) {
        if ( this.player && this.live && pin ) {
          this.player.liveTracker.trigger( 'liveedgechange' );
        }
      },

      source ( newSource ) {
        if ( this.url  !== newSource.url || this.type !== newSource.type ) {
          this.url  = newSource.url;
          this.type = newSource.type;
          this.reloadPlayer();
        }
      },

      '$route.query.t' ( newTimestamp ) {
        if ( this.player )
          this.player.currentTime( this.jumpToTimestamp );
      },
    },

    validate ( { params } ) {
      // Verify username is valid
      const user = params.watch;
      const validator = /^[a-zA-Z0-9._-]+$/;
      return validator.test( user );
    },

    async mounted () {
      if ( this.live ) this.watchTimer = setInterval( () => this.trackWatchTime(), 1000 * this.watchInterval );

      // Track replay view
      this.viewTimer = setTimeout( async () => await this.trackReplayView(), 60 * 1000 );

      await this.loadSettings();

      this.playerInitialize();

      // Get stream data
      await this.getStreamData();

      this.landscape = ( window.orientation || screen.orientation.angle ) !== 0;
      window.addEventListener( 'orientationchange', this.onOrientationChange );

      this.mounted = true;
    },

    beforeDestroy () {
      window.removeEventListener( 'orientationchange', this.onOrientationChange );
      if ( this.streamDataListener ) this.streamDataListener();
      if ( this.watchTimer ) clearInterval( this.watchTimer );
      if ( this.viewTimer ) clearTimeout( this.viewTimer );
      this.playerDispose();
    },
  }
</script>

<style lang='scss'>
  @import "~assets/style/stream-player.scss";

  .detach-player {
    position: fixed;
    left: 80px;
    top: 48px;
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

  .video-js.bw-vjs-replay {
    .vjs-time-control {
      display: flex;
      font-size: 14px;
      line-height: 1em;
      align-items: center;
      min-width: 0;
      padding-left: .5rem;
      padding-right: .5rem;
    }

    .vjs-time-divider {
      padding: 0;
    }
  }
</style>
