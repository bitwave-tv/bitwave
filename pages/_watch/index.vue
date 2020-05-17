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
            <v-icon v-else>warning</v-icon>
          </v-avatar>
          <div class="mx-2">{{ name }}</div>
        </div>
        <div class="d-flex align-center">
          <template v-if="nsfw">
            <div class="font-weight-bold green--text body-2">NSFQ</div>
            <v-divider vertical class="mx-2"/>
          </template>
          <KickStreamButton
            v-if="isAdmin"
            :streamer="name"
          />
          <FollowButton :streamer-id="owner" />
        </div>
      </div>
    </v-sheet>


    <!-- Video JS -->
    <div class="d-flex justify-space-around">
      <v-responsive
        :aspect-ratio="16/9"
        max-width="calc(150vh - 98px)"
      >
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

          <!-- Bitwave Stream Player -->
          <bitwave-video-player
            :live="live"
            :autoplay="live || !disableBumps"
            :docked="smartDetach"
            @ended="onEnded"
            @stats="trackWatchTime"
          >
            <template #title>
              <h5 class="white--text body-2 ml-2">{{ name }}</h5>
            </template>

          </bitwave-video-player>

          <div
            v-if="smartDetach"
            style="height: 100%; width: 100%;"
          >
            <div
              id="bw-player-thumbnail"
              :style="`background-image: url('${posterCacheBusted}\');`"
            ></div>
          </div>

        </v-sheet>

        <!-- Video Overlay -->
        <stickers />

      </v-responsive>
    </div>


    <!-- Chat -->
    <div
      v-if="displayChat"
      :key="1"
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
  import { mapState, mapGetters, mapMutations } from 'vuex';

  import { Chat as ChatStore } from '@/store/chat';
  import { VStore } from '@/store';
  import { Player } from '@/store/player';

  import { db } from '@/plugins/firebase.js';

  import Chat from '@/components/Chat';
  import FollowButton from '@/components/FollowButton';
  import StreamInfo from '@/components/Channel/StreamInfo';
  import BitwaveVideoPlayer from '@/components/BitPlayer/BitwaveVideoPlayer';

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
      BitwaveVideoPlayer,
    },

    data () {
      return {
        mounted: false,
        landscape: false,
        initialized: false,
        showStreamStats: false,
        streamDataListener: null,
        recentBumps: [],

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

        // Chat hydrated data defaults
        chatMessages: null,
      }
    },

    methods: {
      async onEnded () {
        console.log(`Player source ended`);
        this.setSource({ url: await this.getRandomBump(), type: 'video/mp4' });
      },

      trackWatchTime ( stats ) {
        this.$ga.event({
          eventCategory : 'stream',
          eventAction   : 'watch-time',
          eventLabel    : this.name,
          eventValue    : stats.duration,
        });
        this.$ga.event({
          eventCategory : 'stream',
          eventAction   : 'watch-interval',
          eventLabel    : this.name,
          eventValue    : stats.interval,
        });
      },

      async getRandomBump () {
        const { data } = await this.$axios.get( `https://api.bitwave.tv/api/bump` );
        // limit to checking 15 most recent bumps
        if ( this.recentBumps.length >= 15 ) this.recentBumps = this.recentBumps.splice( -15 );
        // Recurse until we get a fresh bump
        if ( this.recentBumps.includes( data.url ) ){
          console.log( `Recently seen ${data.url}, getting a new bump` );
          return await this.getRandomBump();
        }
        this.recentBumps.push( data.url );
        return data.url;
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
        if ( live ) {
          this.poster = data.thumbnail;
          this.setPoster( data.thumbnail );
        }

        // Detect offline stream
        if ( !this.live && !live ) console.debug( 'User is offline' );

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
              url: await this.getRandomBump(),
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

      onIntersect ( entries, observer ) {
        this.setDetach( entries[0].intersectionRatio <= 0.5 );
      },

      onOrientationChange () {
        this.landscape = ( window.orientation || screen.orientation.angle ) !== 0;
      },

      showChat () {
        this.setDisplayChat( true );
        this.$analytics.logEvent( 'show_chat' );
      },

      ...mapMutations(Player.namespace, {
        setSource: Player.$mutations.setSource,
        setPoster: Player.$mutations.setPoster,
        setDetach: Player.$mutations.setDetach,
      }),

      ...mapMutations(ChatStore.namespace,{
        setDisplayChat: ChatStore.$mutations.setDisplayChat,
      }),
    },

    async asyncData ( { $axios, store, params, error } ) {
      const channel = params.watch;


      // Timeout to prevent SSR from locking up
      const timeout = process.server ? process.env.SSR_TIMEOUT : 0;

      const getChannelHydration = async () => {
        let channelData = null;

        // Attempt to load via API server
        try {
          const { data } = await $axios.getSSR( `https://api.bitwave.tv/api/channel/${channel}`, { timeout } );
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
            return {
              success: false,
              error: { statusCode: 404, message: `Could not find channel '${channel}'.` },
            };
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
              return {
                success: false,
                error: { statusCode: 404, message: `Could not find channel '${channel}'.` },
              };
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

            console.log( `Bypass should be successfull...` );

          }

          // API & Database query failure
          catch ( error ) {
            console.error( `Database query failed!` );
            console.error( error.message );
            return {
              success: false,
              error: { statusCode: 500, message: `Bitwave API cache failed & Bitwave Database API failed!<br>${error.message}` },
            };
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
              const { data } = await $axios.getSSR( 'https://api.bitwave.tv/api/bump', { timeout } );
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
          console.error( `Unknown API Error: ${error.message}` );
          return {
            success: false,
            error: { statusCode: 500, message: `Unknown API Error!\n${error.message}` },
          };
        }

        // Should never occur
        console.error( `Something is REALLY fucked up! This should never occur`, this );
        return {
          success: false,
          error: { statusCode: 500, message: `This should never occur.` },
        };
      };

      // Get Channel data for page
      const channelData = await getChannelHydration();
      if ( channelData.success === false  ) {
        console.error( `Channel Data API failed.`, channelData.error );
        if ( channelData && !channelData.success ) {
          error( { ...channelData.error } );
          return;
        }
      }

      const getChatHydration = async ( channel ) => {
        try {
          const global = store.state[ChatStore.namespace][ChatStore.$states.global];
          if ( global === null ) return null;
          const { data } = await $axios.getSSR( `https://chat.bitwave.tv/v1/messages${ global ? '' : `/${channel}` }`, { timeout } );
          if ( data && data.success ) return data.data;
        } catch ( error ) {
          console.log( `Chat hydration request failed` );
          console.error( error.message );
        }
        return null;
      };

      // Get chat data for chat
      let chatMessages = [];
      if ( process.client ) {
        chatMessages = await getChatHydration( channel );
      }

      return {
        channel: channel,
        ...channelData.data,
        chatMessages: chatMessages,
      };
    },

    computed: {
      ...mapState(Player.namespace, {
        source : Player.$states.source,
        inPiP: Player.$states.inPiP,
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
          && !this.inPiP;
      },

      pageMarginRight () {
        if ( !this.displayChat ) return '0';
        return this.mobile
          ? this.landscape
            ? '50%'
            : '0'
          : '450px';
      },
    },

    validate ( { params } ) {
      // Verify username is valid
      const user = params.watch;
      const validator = /^[a-zA-Z0-9._-]+$/;
      return validator.test( user );
    },

    async created () {
      this.setPoster( this.poster );
      this.setSource({ url: this.url, type: this.type });
    },

    async mounted () {
      // this.setSource({ url: this.url, type: this.type });
      this.initialized = true;
      this.getStreamData(); // Get stream data


      this.landscape = ( window.orientation || screen.orientation.angle ) !== 0;
      window.addEventListener( 'orientationchange', this.onOrientationChange );

      this.mounted = true;
    },

    beforeDestroy () {
      window.removeEventListener( 'orientationchange', this.onOrientationChange );
      if ( this.streamDataListener ) this.streamDataListener();
      if ( this.offlineResetInterval ) clearInterval( this.offlineResetInterval );
    },
  }
</script>

<style lang='scss'>
  @import "~assets/style/stream-player.scss";

  .detach-player {
    position: fixed;
    right: 0;
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

  #bw-player-thumbnail {
    position: relative;
    filter: grayscale(80%);
    background-size: cover;
    height: 100%;
    width: 100%;

    &::after {
      content: ' ';
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      left:0;
      width: 100%;
      height: 100%;
      background-image: radial-gradient( transparent 50%, black );
    }
  }
</style>
