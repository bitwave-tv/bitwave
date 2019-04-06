<template>
  <div>
    <v-layout
      column
    >
      <v-flex
        v-if="false"
      >
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
              id="streamplayer"
              class="video-js vjs-default-skin"
              width="100%"
              controls
              :autoplay="live"
              preload="auto"
              data-setup='{ "aspectRatio":"16:9" }'
              :poster="poster"
            >
              <source
                v-if="name !== '404' && live"
                :src="`https://stream.bitwave.tv/stream/${name}/index.m3u8`"
                type="application/x-mpegURL"
              >
              <source
                v-else
                :src="getRandomBump()"
                type="video/mp4"
              >
            </video>
          </v-responsive>
        </v-card>
      </v-flex>
      <v-flex class="px-3">
        <v-layout>
          <v-flex shrink>
            <v-chip
              v-if="nsfw"
              color="red"
              class="mr-2"
              small
              outline
            >NSFW</v-chip>
          </v-flex>
          <v-flex shrink>
            <h2>{{ streamTitle }}</h2>
          </v-flex>
        </v-layout>
      </v-flex>
    </v-layout>
  </div>
</template>

<script>
  import videojs from 'video.js'
  import 'videojs-contrib-quality-levels'

  export default {
    head() {
      return {
        title: `${this.name} - BitWave.tv`,
        meta: [
          { name: 'og:title', hid: 'og:title', content: `${this.name} - BitWave.tv` },
          { name: 'og:image', content: this.poster },
        ],
      }
    },

    components: {

    },

    data() {
      return {
        poster: 'https://dispatch.sfo2.cdn.digitaloceanspaces.com/static/img/bitwave_cover_sm.jpg',
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
        this.player = videojs('streamplayer', {
          liveui: true,
          playbackRates: [ 0.25, 0.5, 1, 1.25, 1.5, 1.75, 2 ],
        });
        this.qualityLevels = this.player.qualityLevels();
        this.initialized = true;
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
      },

      getRandomBump() {
        // random id between 1 and 29
        const id = (Math.floor(Math.random() * 29) + 1).toString().padStart(2, '0');
        return `https://dispatch.sfo2.cdn.digitaloceanspaces.com/static/bumps/Bump${id}-sm.mp4`;
      },

      playerDispose(){
        if (this.initialized) this.player.dispose();
      },
    },

    async asyncData ({ $axios, params }) {
      try {
        const { data } = await $axios.get(`https://api.bitwave.tv/api/channel/${params.watch}`);

        const name = data.name || 'ERROR';
        const poster = data.poster || 'https://dispatch.sfo2.cdn.digitaloceanspaces.com/static/img/bitwave_cover_sm.jpg';
        const streamTitle = data.title || '⚠ STREAM NOT FOUND ⚠';
        const live = data.live || false;
        const nsfw = data.nsfw || false;

        return {
          name: name,
          poster: poster,
          streamTitle: streamTitle,
          live: live,
          nsfw: nsfw,
        }
      } catch (error) {
        console.log(`ERROR: Failed to find user ${params.watch}`);
        console.error(error.message);

        return {
          name: '404',
          poster: 'https://dispatch.sfo2.cdn.digitaloceanspaces.com/static/img/bitwave_cover_sm.jpg',
          streamTitle: '404 - Stream not found',
          live: false,
          nsfw: false,
        }
      }
    },

    mounted() {
      this.playerInitialize();
      console.log('this is current player instance object:', this.player);
      if (this.live)
        this.watchTimer = setInterval( () => this.trackWatchTime(), 1000 * this.watchInterval );
      else if (this.name !== '404')
        console.log(`${this.name} is offline.`);
    },

    beforeDestroy() {
      if (this.watchTimer) clearInterval(this.watchTimer);
      this.playerDispose();
    },
  }
</script>
