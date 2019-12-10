<template>
  <v-card
    v-if="live"
    color="black"
    class="d-flex flex-wrap elevation-8"
  >
    <div
      class="flex-grow-1 align-self-center"
      style="min-width: 40%;"
    >
      <video
        playsinline
        id="solo-player"
        class="video-js vjs-default-skin vjs-fluid"
        controls
        autoplay
        muted
        preload="auto"
        data-setup='{ "aspectRatio":"16:9" }'
        :poster="poster"
      >
        <source
          :src="src"
          :type="type"
        >
      </video>
    </div>

    <div
      class="d-flex flex-shrink-1"
      :style="{ width: mobile ? '100%' : '450px', 'max-height': mobile ? '500px' : '555px' }"
    >
      <chat :chat-channel="name"/>
    </div>
  </v-card>
</template>

<script>
  import videojs from 'video.js'
  // import 'videojs-contrib-dash'

  import Chat from '@/components/Chat'

  export default {
    name: 'BannerVideo',

    props: {
      src    : { type: String },
      type   : { type: String },
      poster : { type: String },
      name   : { type: String },
      mobile : { type: Boolean, default: false },
    },

    components: {
      Chat,
    },

    data() {
      return {
        live: true,
        initialized: false,
      };
    },

    methods: {
      playerInitialize () {
        try {
          this.player = videojs( 'solo-player', {
            // liveui: true,
            // playbackRates: [0.5, 1, 1.25, 1.5, 1.75, 2],
          } );
          this.initialized = true;
        } catch ( error ) {
          console.error( error );
          this.initialized = false;
        }
      },

      playerDispose () {
        if ( this.player ) this.player.dispose();
      },

      updatePlayerSrc () {
        this.player.src({ type: 'video/mp4', src: 'https://cdn.bitwave.tv/static/bumps/Bump33-sm.mp4' });
      },
    },

    mounted () {
      this.playerInitialize();
    },

    beforeDestroy () {
      this.playerDispose();
    },
  };
</script>

<style lang='scss'>
  /*.video-js .vjs-live-control {
    margin-left: 1rem;
  }*/
</style>
