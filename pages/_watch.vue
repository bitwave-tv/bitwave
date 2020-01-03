<template>
  <div :style="{ paddingRight: mobile ? '0' : '450px' }">


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
            <img :src="avatar" :alt="name" />
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
      <v-sheet color="black">
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
            :src="url"
            :type="type"
          >
        </video>
      </v-sheet>
    </v-responsive>


    <!-- Chat -->
    <div
      class="d-flex"
      :class="{ 'chat-desktop': !mobile }"
      :style="{ maxHeight: mobile ? '390px' : '100%' }"
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

  import { mapGetters } from 'vuex';
  import { db } from '@/plugins/firebase.js';

  import Chat from '~/components/Chat';
  import FollowButton from '@/components/FollowButton';
  import { VStore } from '@/store';
  import StreamInfo from '@/components/Channel/StreamInfo';

  const KickStreamButton = async () => await import( '@/components/Admin/KickStreamButton' );

  export default {
    name: 'watch',

    scrollToTop: true,

    head () {
      return {
        title: `${this.name} - [bitwave.tv]`,
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
      KickStreamButton,
      StreamInfo,
      FollowButton,
      Chat,
    },

    data () {
      return {
        mounted: false,
        player: null,
        qualityLevels: null,
        initialized: false,
        watchDuration: 0,
        watchInterval: 60,
        lastWatch: null,
        watchTimer: null,
        showStreamStats: false,
        streamDataListener: null,
        description: null,
        timestamp: null,
        recentBumps: [],
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
            },
          },
        });

        // Video Player Ready
        this.player.ready( () => {
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
        });

        // Load all qualities
        this.qualityLevels = this.player.qualityLevels();
        this.player.hlsQualitySelector({
          displayCurrentQuality: true,
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

        // Begin playing when new media is loaded
        this.player.on( 'loadeddata', () => {
          // this.player.play()
        });

        this.player.on( 'ended', async () => {
          this.url = await this.getRandomBump();
          // this.player.load();
          this.reloadPlayer();
        });

        this.player.on( 'error', error =>{
          // Brush player errors under the rug
          if ( this.live ) console.log( 'streamer offline and got an error' );
          console.warn( error );
        });

        this.initialized = true;

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
      },

      async getRandomBump () {
        const { data } = await this.$axios.get( `https://api.bitwave.tv/api/bump` );
        // limit to checking 5 most recent bumps
        if ( this.recentBumps.length >= 10 ) this.recentBumps = this.recentBumps.splice( -10 );
        // Recurse until we get a fresh bump
        if ( this.recentBumps.includes( data.url ) ){
          console.log(`Recently seen ${data.url}, getting a new bump`);
          return this.getRandomBump();
        }
        this.recentBumps.push( data.url );
        return data.url;
      },

      playerDispose (){
        if ( this.player ) this.player.dispose();
      },

      getStreamData () {
        const streamer  = this.name.toLowerCase();
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
          this.url  = url;
          this.type = type;

          this.reloadPlayer();
        }

        // Detect source change
        else if ( this.url !== url  || this.type !== type ) {
          this.url  = url;
          this.type = type;
          this.reloadPlayer();
        }

        this.live = live;
      },

      reloadPlayer () {
        // this.player.reset(); this.player.load();
        if ( !this.initialized ) return;
        this.player.poster = this.poster;
        this.player.src( { src: this.url, type: this.type } );
      },
    },

    async asyncData ( { $axios, params } ) {
      const user = params.watch;
      try {
        const { data } = await $axios.get( `https://api.bitwave.tv/api/channel/${user}` );

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
        if ( !live ) {
          const { data } = await $axios.get( 'https://api.bitwave.tv/api/bump' );
          url = data.url;
          type = 'video/mp4';
        }

        const getChatHydration = async () => {
          try {
            const { data } = await $axios.get( 'https://chat.bitwave.tv/v1/messages' );
            if ( data.success ) return data.data;
          } catch ( error ) {
            console.log( error );
          }
          return [];
        };

        const chatMessages = await getChatHydration();

        return { name, avatar, title, description, poster, live, nsfw, owner, url, type, timestamp, chatMessages };

      } catch ( err ) {
        console.log( `ERROR: Failed to hydrate channel '${user}':\n`, err );
        return {
          name: 'Error',
          title: 'Failed to preload data',
          url: 'https://cdn.bitwave.tv/static/bumps/2a3un.mp4',
          type: 'video/mp4',
        }
      }
    },

    computed: {
      ...mapGetters({
        username: VStore.$getters.getUsername,
        user: VStore.$getters.getUser,
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

      isAdmin () {
        const user = this.user;
        return user && user.hasOwnProperty( 'role' ) && user.role === 'admin';
      }
    },

    /*async validate ( { params, query, store, $axios } ) {
      const user = params.watch;
      if ( !user.match( /^[a-zA-Z0-9._-]+$/ ) ) {
        return false;
      }
      const { data } = await $axios.get( `https://api.bitwave.tv/api/channel/${user}` );
      return !!data.name;
    },*/

    /*beforeRouteUpdate ( to, from, next ) {
      const params = to.params;
      next();
    },*/

    async mounted () {
      if ( this.live ) this.watchTimer = setInterval( () => this.trackWatchTime(), 1000 * this.watchInterval );
      this.playerInitialize();
      this.mounted = true;
    },

    beforeDestroy () {
      if ( this.streamDataListener ) this.streamDataListener();
      if ( this.watchTimer ) clearInterval( this.watchTimer );
      this.playerDispose();
    },
  }
</script>

<style lang='scss'>
  @import "~assets/style/stream-player.scss";
</style>
