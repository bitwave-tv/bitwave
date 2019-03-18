<template>
  <div>

    <v-layout
      column
    >
      <v-flex>
        <v-tabs
          dark
          slider-color="#2196f3"
        >
          <v-tab>
            DISPATCH
          </v-tab>
          <v-tab>
            ARCHIVE
          </v-tab>
        </v-tabs>
      </v-flex>

      <hr class="v-divider theme--light">

      <v-flex class="px-3 py-2">
        <v-card>
          <v-responsive
            :aspect-ratio="16/9"
          >
            <video
              playsinline
              id="myPlayer"
              class="video-js vjs-default-skin"
              width="50%"
              controls
              autoplay
              muted
              preload="auto"
              data-setup='{ "aspectRatio":"16:9" }'
              poster="/bitwave_cover.png"
            >
              <source
                src="https://bitwave.tv/stream/murderder/index.m3u8"
                type="application/x-mpegURL"
              >
            </video>
          </v-responsive>
        </v-card>
      </v-flex>

      <v-flex class="px-3">
        <h2>STREAM TITLE</h2>
      </v-flex>

    </v-layout>

  </div>
</template>

<script>
  import videojs from 'video.js';

  export default {
    components: {

    },

    data() {
      return {
        player: null,
        initialized: false,
        streams: {
          hls: 'https://bitwave.tv/stream/dispatch/',
        },
      }
    },

    computed: {

    },

    methods: {
      playerInitialize(){
        this.player = videojs('myPlayer', {
          liveui: true,
        });
        this.initialized = true;
      },

      playerDispose(){
        if (this.initialized) this.player.dispose();
      },
    },

    mounted() {
      // if (process.browser) window.videojs = require('video.js');
      this.playerInitialize();

      // window.playerEvents = this;
      console.log('this is current player instance object:', this.player);
    },

    beforeDestroy() {
      this.playerDispose();
    },
  }
</script>
