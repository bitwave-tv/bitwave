<template>
  <div>

    <v-layout
      column
    >
      <v-flex>
        <v-tabs
          dark
          slider-color="yellow"
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

      <v-flex class="px-0 py-3">
        <v-card>
          <v-responsive
            :aspect-ratio="16/9"
          >
            <video
              playsinline
              id="stream-player"
              class="video-js vjs-default-skin"
              width="100%"
              controls
              autoplay
              preload="auto"
              data-setup='{ "aspectRatio":"16:9" }'
              :poster="poster"
            >
              <source
                src="https://bitwave.tv/stream/dispatch/index.m3u8"
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
    <hr>
  </div>
</template>

<script>
  import videojs from 'video.js';

  export default {
    components: {

    },

    data() {
      return {
        poster: 'https://dispatch.sfo2.cdn.digitaloceanspaces.com/static/img/bitwave_cover.png',
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
        this.player = videojs('stream-player', {
          liveui: true,
          playbackRates: [ 0.25, 0.5, 1, 1.25, 1.5, 1.75, 2 ],
        });
        this.initialized = true;
      },

      playerDispose(){
        if (this.initialized) this.player.dispose();
      },
    },

    mounted() {
      this.playerInitialize();

      console.log('this is current player instance object:', this.player);
    },

    beforeDestroy() {
      this.playerDispose();
    },
  }
</script>
