<template>
  <v-sheet color="black">
    <video
      playsinline
      id="streamplayer"
      class="video-js vjs-custom-skin vjs-big-play-centered vjs-16-9"
      controls
      :autoplay="autoplay"
      preload="auto"
      :poster="poster"
      :style="{ width: '100%' }"
    >
      <source
        :src="source"
        :type="type"
      >
    </video>
  </v-sheet>
</template>

<script>
  import videojs from 'video.js';
  import '@videojs/http-streaming';
  import 'videojs-contrib-quality-levels'
  import 'videojs-hls-quality-selector'

  const DEBUG_VIDEO_JS = false;

  export default {
    name: 'StreamPlayer',

    props: {
      poster   : { type: String },
      source   : { type: String },
      type     : { type: String },
      autoplay : { type: Boolean },
    },

    data () {
      return {
        initialized: false,
        recentBumps: [],
      };
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


        // Video Player Ready
        this.player.ready( () => this.onPlayerReady() );


        // --- Video.js plugin functions

        // Add reloadSourceOnError plugin
        this.player.reloadSourceOnError({ errorInterval: 10 });

        // Load all qualities
        this.qualityLevels = this.player.qualityLevels();
        this.player.hlsQualitySelector({
          displayCurrentQuality: true,
        });

        // Save volume on change
        this.player.on( 'volumechange', () => this.onVolumeChange() );
        this.player.on( 'loadeddata',   () => this.onLoadedData() );
        this.player.on( 'ended',  async () => this.onPlayerEnded() );
        this.player.on( 'error',     error => this.onError( error ) );

        this.initialized = true;
      },

      onPlayerReady () {
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

        this.player.tech().on( 'retryplaylist', ( event ) => {
          console.log( `retryplaylist:`, event );
          if ( !this.live ) console.log( `livestream is offline.` );
        });

        this.player.tech().on( 'usage', ( event ) => {
          console.log( `${event.name}:`, event );
        });

        this.player.liveTracker.on('liveedgechange', async () => {
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
          }, 8 * 1000 );
        });

        window.$bw = {
          getVideoLogs: this.player.log.history,
          hls: this.player.tech({ IWillNotUseThisInPlugins: true }).hls,
          player: this.player,
        };

        if ( DEBUG_VIDEO_JS ) {
          this.player.log.level('debug');
        }

        this.initialized = true;
      },

      reloadPlayer () {
        if ( !this.initialized ) return;
        this.player.poster = this.poster;
        this.player.src( { src: this.url, type: this.type } );
        this.player.play();
      },

      onVolumeChange () {
        try {

          localStorage.setItem( 'volume', this.player.volume() );
          localStorage.setItem( 'muted',  this.player.muted() );
        } catch ( error ) {
          console.warn( 'Failed to access localStorage to save volume level' );
        }
      },

      onLoadedData () {
        // this.player.play(); // Begin playing when new media is loaded
      },

      async onPlayerEnded () {
        this.url = await this.getRandomBump();
        this.reloadPlayer();
      },

      onError ( error ) {
        // Brush player errors under the rug
        if ( !this.live ) console.log( 'streamer offline and got an error' );
        console.warn( `player error:`, error );
      },

      playerDispose (){
        if ( this.player ) this.player.dispose();
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
    },

    computed: {},

    mounted () {
      this.playerInitialize();
    },

    beforeDestroy () {
      this.playerDispose();
    },
  };
</script>

<style lang='scss'>
  @import "~assets/style/stream-player.scss";
</style>
