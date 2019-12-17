<template>
  <div :style="{ paddingRight: mobile ? '0' : '450px' }">


    <!-- Streamer Top Bar -->
    <v-sheet
      class="py-2 px-3"
      color="#212121"
      style="border-right: solid 1px #ffeb3b"
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
            v-if="nsfw"
            color="red"
            class="mr-2"
            small
            outlined
          >NSFW</v-chip>
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
      <chat :chat-channel="name" />
    </div>


    <!-- Stream Info -->
    <stream-info
      :name="name"
      :live="live"
      :title="title"
      :nsfw="nsfw"
      :description="description"
    />

  </div>
</template>

<script>
  import videojs from 'video.js'
  // import 'dashjs'
  // import 'videojs-contrib-dash'
  import 'videojs-contrib-quality-levels'
  import 'videojs-hls-quality-selector'

  import { mapGetters } from 'vuex';
  import { db } from '@/plugins/firebase.js';

  import Chat from '~/components/Chat';
  import FollowButton from '@/components/FollowButton';
  import { VStore } from '@/store';
  import StreamInfo from '@/components/Channel/StreamInfo';

  export default {
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
      }
    },

    methods: {
      playerInitialize () {

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
          // Restore Volume
          try {
            /*console.log(`Volume: ${this.player.volume()}, Muted: ${this.player.muted()}`);
            let muted = localStorage.getItem( 'muted' );
            console.log(`Muted: ${muted}`);
            if ( muted !== null ) {
              this.player.muted( muted );
            }*/
            let volume = localStorage.getItem( 'volume' );
            if ( volume !== null ) this.player.volume( volume );
          } catch ( error ) {
            // No volume value in memory
            console.warn( 'Failed to find prior volume level' );
          }
        });

        // Load all qualities
        this.qualityLevels = this.player.qualityLevels();
        this.player.hlsQualitySelector({
          displayCurrentQuality: true,
        });

        // Save volume on change
        this.player.on( 'volumechange', () => {
          localStorage.setItem( 'volume', this.player.volume() );
          localStorage.setItem( 'muted',  this.player.muted() );
        });

        // Begin playing when new media is loaded
        this.player.on( 'loadeddata', () => this.player.play() );

        this.player.on( 'ended', async () => {
          this.url = await this.getRandomBump();
          // this.player.load();
          this.reloadPlayer();
        });

        this.player.on( 'error', error =>{
          // Brush player errors under the rug
          console.warn(error);
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
        return data.url;
      },

      playerDispose (){
        if ( this.player ) this.player.dispose();
      },

      getStreamData () {
        const streamer  = this.name.toLowerCase();
        const streamRef = db.collection( 'streams' ).doc( streamer );
        this.streamDataListener = streamRef.onSnapshot(
          async doc => await this.streamDataChanged( doc.data() ),
          error => console.warn( error )
        );
      },

      async streamDataChanged ( data ) {
        // Grab Stream Data
        this.title = data.title;
        this.description = data.description;
        this.nsfw  = data.nsfw;
        this.owner = data.owner;

        const live = data.live;
        const url  = data.url;
        const type = data.type || `application/x-mpegURL`; // application/x-mpegURL | application/dash+xml

        const thumbnail = data.thumbnail;

        if ( live ) this.poster = thumbnail;

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
        // this.player.reset();
        // this.player.load();

        if ( !this.initialized ) return;
        this.player.poster = this.poster;
        this.player.src( { src: this.url, type: this.type } );
      },
    },

    async asyncData ( { $axios, params } ) {
      const user = params.watch;
      try {
        const { data } = await $axios.get( `https://api.bitwave.tv/api/channel/${user}` );

        const name   = data.name;
        const avatar = data.avatar;
        let   poster = data.poster || 'https://cdn.bitwave.tv/static/img/BitWave2.sm.jpg';
        const title  = data.title  || 'No Title';
        const description = data.description || 'No Description';
        const live   = data.live;
        const nsfw   = data.nsfw;
        const owner  = data.owner;
        let   type   = data.type   || `application/x-mpegURL`; // DASH -> application/dash+xml
        let   url    = data.url;

        const thumb  = data.thumbnail;
        if ( data.thumbnail ) poster = live ? thumb : poster;

        if ( !live ) {
          const { data } = await $axios.get( 'https://api.bitwave.tv/api/bump' );
          url = data.url;
          type = 'video/mp4';
        }

        return { name, avatar, title, description, poster, live, nsfw, owner, url, type };

      } catch ( error ) {
        console.log( `ERROR: Failed to find user ${user}: ${error.message}` );

        return {
          name   : '404 Error',
          avatar : 'https://cdn.bitwave.tv/static/img/glitchwave.gif',
          poster : 'https://cdn.bitwave.tv/static/img/BitWave2.sm.jpg',
          title  : 'Streamer not found',
          description : 'Invalid Stream',
          live   : false,
          nsfw   : false,
          url    : null,
          type   : null,
        }
      }
    },

    computed: {
      ...mapGetters({
        username: VStore.$getters.getUsername,
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
    },

    async validate ( { params, query, store, $axios } ) {
      const user = params.watch;
      if ( !user.match( /^[a-zA-Z0-9._-]+$/ ) ) {
        return false;
      }
      const { data } = await $axios.get( `https://api.bitwave.tv/api/channel/${user}` );
      return !!data.name;
    },

    beforeRouteUpdate ( to, from, next ) {
      const params = to.params;
      next();
    },

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
