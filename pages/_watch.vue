<template>
  <div>
    <v-layout
      column
    >
      <v-flex>
        <v-tabs
          dark
          slider-color="#ff9800"
        >
          <v-tab>
            {{ name }}
          </v-tab>
          <v-tab>
            ARCHIVES
          </v-tab>
        </v-tabs>
      </v-flex>

      <hr class="v-divider theme--light">

      <v-flex class="px-0 pb-2 pt-0">
        <v-card>
          <v-responsive
            :aspect-ratio="16/9"
          >
            <video
              playsinline
              id="myPlayer"
              class="video-js vjs-default-skin"
              width="100%"
              controls
              autoplay
              preload="auto"
              data-setup='{ "aspectRatio":"16:9" }'
              :poster="poster"
            >
              <source
                :src="`https://stream.bitwave.tv/stream/${name}/index.m3u8`"
                type="application/x-mpegURL"
              >
            </video>
          </v-responsive>
        </v-card>
      </v-flex>
      <v-flex class="px-3">
        <h2>{{ streamTitle }}</h2>
      </v-flex>
    </v-layout>
  </div>
</template>

<script>
  import videojs from 'video.js'
  import 'videojs-contrib-quality-levels'

  export default {
    components: {

    },

    data() {
      return {
        poster: 'https://dispatch.sfo2.cdn.digitaloceanspaces.com/static/img/bitwave_cover.png',
        streamTitle: '',
        player: null,
        qualityLevels: null,
        initialized: false,
        watchDuration: 0,
        watchInterval: 30,
        lastWatch: null,
        watchTimer: null,
      }
    },

    computed: {

    },

    methods: {
      playerInitialize(){
        this.player = videojs('myPlayer', {
          liveui: true,
          playbackRates: [ 0.25, 0.5, 1, 1.25, 1.5, 1.75, 2 ],
        });
        this.qualityLevels = this.player.qualityLevels();
        this.initialized = true;
      },

      playerDispose(){
        if (this.initialized) this.player.dispose();
      },

      trackWatchTime() {
        this.watchDuration += this.watchInterval;
        this.$ga.event({
          eventCategory: 'stream',
          eventAction: 'watch-time',
          eventLabel: this.name,
          eventValue: this.watchDuration,
        });
        console.log(`Watch Time: ${this.watchDuration}s on ${this.name}`);
        this.watchTimer = setTimeout( () => this.trackWatchTime(), 1000 * this.watchInterval );
      },
    },

    async asyncData ({ $axios, params }) {
      const { data } = await $axios.get(`https://api.bitwave.tv/api/channel/${params.watch}`);

      let poster = '';
      let streamTitle = '⚠ STREAM NOT FOUND ⚠';

      const name = data.name;
      poster = data.poster;
      streamTitle = data.title;

      return {
        name: name,
        poster: poster,
        streamTitle: streamTitle,
      }
    },

    mounted() {
      this.playerInitialize();
      console.log('this is current player instance object:', this.player);
      setTimeout( () => this.trackWatchTime(), 1000 * this.watchInterval );
    },

    beforeDestroy() {
      if (this.watchTimer) clearTimeout(this.watchTimer);
      this.playerDispose();
    },
  }
</script>
