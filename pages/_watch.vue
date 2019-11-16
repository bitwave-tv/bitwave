<template>
  <div :style="{ paddingRight: mobile ? '0' : '450px' }">

    <!-- Streamer Top Bar -->
    <v-sheet class="pa-2" color="#212121" style="border-right: solid 1px #ffeb3b">
      <div class="d-flex align-center justify-space-between">

        <div class="d-flex align-center grey--text">
          <v-avatar
            size="32"
            class="mr-2"
          >
            <img
              :src="avatar"
              :alt="name"
            />
          </v-avatar>
          {{ name }}
        </div>

        <div class="d-flex align-center">
          <v-chip
            v-if="nsfw"
            color="red"
            class="mr-2"
            :outlined="false"
            small
            outlined
          >NSFW</v-chip>

          <FollowButton :streamer-id="owner" />
        </div>

      </div>
    </v-sheet>

    <!-- Video And Description -->

    <!-- Video JS -->
    <v-layout>
      <v-flex>
        <video
          playsinline
          id="streamplayer"
          class="video-js vjs-fluid vjs-16-9 vjs-custom-skin vjs-big-play-centered"
          height="100%"
          width="100%"
          style="min-width: 200px;"
          controls
          :autoplay="live"
          preload="auto"
          data-setup='{ "aspectRatio":"16:9", "html": { "hls": { "overrideNative": "true" } } }'
          :poster="poster"
        >
          <source
            :src="url"
            :type="type"
          >
        </video>
      </v-flex>
    </v-layout>

    <!-- Chat -->
    <v-layout :class="{ 'chat-desktop': !mobile }">
      <v-flex :style="{ maxHeight: mobile ? '390px' : '100%' }">
        <client-only placeholder="Loading...">
          <chat
            :chat-channel="name"
          ></chat>
        </client-only>
      </v-flex>
    </v-layout>

      <!-- Stream Title, Status -->
      <v-sheet
        class="elevation-2 pa-3 mb-4"
        color="grey darken-4"
      >

        <div class="d-flex align-center">
          <!-- Live Indicator -->
          <v-chip
            v-show="live"
            class="blink flex-shrink-0"
            label
            outlined
            color="red"
            small
          >
            <v-icon left size="10" class="mr-2">lens</v-icon>
            LIVE
          </v-chip>

          <!-- Stream Title -->
          <h3 class="mx-2 flex-grow-1 subtitle-1">
            {{ title }}
          </h3>

          <!-- Stream Actions -->
          <div class="d-flex flex-shrink-0">
            <EditStreamData
              v-if="name.toLowerCase() === username.toLowerCase()"
              :username="username"
              :title="title"
              :description="description"
              :nsfw="nsfw"
            ></EditStreamData>

            <v-btn
              v-if="false"
              color="yellow"
              class="mr-2"
              outlined
              small
              @click="showStreamStats = !showStreamStats"
            >
              <v-icon>timeline</v-icon>
            </v-btn>

            <ShareStream :user="name"></ShareStream>
          </div>
        </div>

      </v-sheet>

      <!-- Description -->
      <v-layout class="px-3 my-2" ref="description">
        <v-flex id="description">
          <vue-markdown
            v-if="description"
            :source="description"
          ></vue-markdown>
        </v-flex>
      </v-layout>

  </div>
</template>

<script>
  import videojs from 'video.js'
  import 'dashjs'
  import 'videojs-contrib-dash'
  import 'videojs-contrib-quality-levels'
  import 'videojs-hls-quality-selector'

  import { mapGetters } from 'vuex';
  import { db } from '@/plugins/firebase.js';

  import Chat from '~/components/Chat';
  import VueMarkdown from '~/components/VueMarkdown';
  import FollowButton from '@/components/FollowButton';

  // Async Components - We don't expect these components to be required frequently
  const ShareStream    = () => import ( '@/components/ShareStream' );
  const EditStreamData = () => import ( '@/components/EditStreamData' );

  export default {
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
      EditStreamData,
      ShareStream,
      FollowButton,
      VueMarkdown,
      Chat,
    },

    data () {
      return {
        player: null,
        qualityLevels: null,
        initialized: false,
        watchDuration: 0,
        watchInterval: 60,
        lastWatch: null,
        watchTimer: null,
        streamDataListener: null,
        description: null,
        showStreamStats: false,
      }
    },

    computed: {
      ...mapGetters({
        username: 'username',
      }),

      mobile () {
        return this.$vuetify.breakpoint.mdAndDown;
      },
    },

    methods: {
      playerInitialize () {

        // Create video.js player
        this.player = videojs( 'streamplayer', {
          liveui: true,
          // fluid: true,
          // fill: true,
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
        this.player.hlsQualitySelector();

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
        const streamer = this.name.toLowerCase();
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

        console.log( `Stream Metadata Update.`, data );

        const live = data.live;
        const url  = data.url  || `https://cdn.stream.bitwave.tv/stream/${name}/index.m3u8`;
        const type = data.type || `application/x-mpegURL`; // DASH -> application/dash+xml

        const thumbnail = data['thumbnail'] || null;

        if ( live ) this.poster = thumbnail;

        // Detect offline stream
        if ( !this.live && !live ) console.log( 'User is offline' );

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

          console.log( 'Video Source Changed' );

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

        console.log( 'Player reloaded' );
      },

      updateStreamData ( data ) {
        console.log( data );
      },
    },

    async asyncData ( { $axios, params } ) {
      const user = params.watch;
      try {
        const { data } = await $axios.get( `https://api.bitwave.tv/api/channel/${user}` );

        const name   = data.name   || 'No Username';
        const avatar = data.avatar || 'https://cdn.bitwave.tv/static/img/glitchwave.gif';
        const title  = data.title  || 'No Title';
        const description = data.description || 'No Description';
        let   poster = data.poster || 'https://cdn.bitwave.tv/static/img/BitWave2.sm.jpg';
        const live   = data.live   || false;
        const nsfw   = data.nsfw   || false;
        const owner  = data.owner  || '';
        let   url    = data.url    || `https://cdn.stream.bitwave.tv/stream/${name}/index.m3u8`;
        let   type   = data.type   || `application/x-mpegURL`; // DASH -> application/dash+xml

        const thumb  = data['thumbnail'] || false;
        if ( data.thumbnail ) {
          poster = live ? thumb : poster;
        }

        if ( !live ) {
          const { data } = await $axios.get( 'https://api.bitwave.tv/api/bump' );
          url = data.url;
          type = 'video/mp4';
        }

        return { name, avatar, title, description, poster, live, nsfw, owner, url, type };

      } catch ( error ) {
        console.log( `ERROR: Failed to find user ${user}` );
        console.error( error.message );

        return {
          name   : '404 Error',
          avatar : 'https://cdn.bitwave.tv/static/img/glitchwave.gif',
          title  : 'Streamer not found',
          description : 'Invalid Stream',
          poster : 'https://cdn.bitwave.tv/static/img/BitWave2.sm.jpg',
          live   : false,
          nsfw   : false,
          url    : '',
          type   : '',
        }
      }
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
      if ( params ) console.log( `Watching: ${params.watch}` );
      next();
    },

    async mounted () {
      if ( this.live )
        this.watchTimer = setInterval( () => this.trackWatchTime(), 1000 * this.watchInterval );

      if ( process.client ) {
        this.$nextTick( () => {
          this.playerInitialize();
          console.debug( 'video.js:', this.player );
        });
      }
    },

    beforeDestroy () {
      if ( this.streamDataListener ) this.streamDataListener();
      if ( this.watchTimer ) clearInterval( this.watchTimer );
      this.playerDispose();
    },
  }
</script>

<style lang='scss'>
  .video-js {
    font-size: 11px;
    overflow: hidden;

    // Control Bar (container)
    .vjs-control-bar {
      background-color: #333;
      background-color: rgba(50, 50, 50, 0.65);
    }

    // Progress Bar
    .vjs-progress-control.vjs-control {
      position: absolute;
      display: block;
      width: 100%;
      height: 50%;
      transform: translateY(-75%);

      // Circle play head
      .vjs-play-progress::before {
        transform: scale(0);
        transition: transform .3s;
      }

      &:hover {
        .vjs-play-progress::before {
          transform: scale(1);
        }
      }

      // Progress Slider
      .vjs-slider {
        margin: 0 5px;
        top: 50%;
      }
    }

    // Load progress color
    .vjs-load-progress,
    .vjs-load-progress div {
      background-color: rgba(60, 60, 60, 0.5);
    }

    // Progress Bar Background
    .vjs-slider {
      background-color: rgba(60, 60, 60, 0.5);
    }

    // Primary Color Progress
    .vjs-slider-bar {
      background-color: #ffeb3b;
    }

    // Inner Progress Bar
    .vjs-play-progress {
      background-color: #ffeb3b;
      color: #ffeb3b;
    }

    // Spacer
    .vjs-custom-control-spacer {
      display: flex;
      flex: auto;
    }

    // Transcoding menu
    .vjs-tech {
      height: auto !important;
      position: absolute !important;
    }

    // Menu size
    .vjs-playback-rate .vjs-menu .vjs-menu-content {
      width: 125%;
      font-size: 10px;
    }
  }

  // Tooltips
  .vjs-mouse-display .vjs-time-tooltip {
    color: #ffeb3b;
  }

  .vjs-has-started {
    .vjs-control-bar {
      opacity: 1;
      transform: translateY(0);
      transition: transform .3s;
    }

    &.vjs-user-inactive.vjs-playing {
      .vjs-control-bar {
        opacity: 1;
        transform: translateY(127%);
        transition: transform .5s;
      }
    }
  }


  .chat-desktop {
    position : fixed;
    top      : 48px;
    right    : 0;
    height   : calc(100vh - 48px);
    width    : 450px;
  }

  a {
    color: yellow;
    text-decoration: none;
  }

  #description {
    text-overflow: ellipsis;
    word-break: break-word;
    max-width: 100%;

    img {
      max-width: 100%;
    }
  }

  .blink{
    text-decoration: blink;
    -webkit-animation-name: blinker;
    -webkit-animation-duration: 0.6s;
    -webkit-animation-iteration-count:infinite;
    -webkit-animation-timing-function:ease-in-out;
    -webkit-animation-direction: alternate;
  }
  @-webkit-keyframes blinker {
    from {opacity: 1.0;}
    to {opacity: 0.0;}
  }
</style>
