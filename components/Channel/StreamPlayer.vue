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
  import 'videojs-contrib-quality-levels'
  import 'videojs-hls-quality-selector'

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
      };
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
        this.player.ready( () => this.onPlayerReady() );

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
      },

      reloadPlayer () {
        if ( !this.initialized ) return;
        this.player.poster = this.poster;
        this.player.src( { src: this.url, type: this.type } );
      },

      onVolumeChange () {
        localStorage.setItem( 'volume', this.player.volume() );
        localStorage.setItem( 'muted',  this.player.muted() );
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
        console.warn( error );
      },

      playerDispose (){
        if ( this.player ) this.player.dispose();
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
