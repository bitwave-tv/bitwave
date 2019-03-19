<template>
  <div>

    <v-layout
      class="pa-2"
      row
      justify-space-around
    >

      <v-flex
        v-for="(stream, index) in streams"
        :key="stream.src"
        class="ma-2"
      >
        <v-card>
          <video
            playsinline
            :id="`player-${index}`"
            class="video-js vjs-default-skin"
            width="100%"
            controls
            autoplay
            muted
            preload="auto"
            data-setup='{ "aspectRatio":"16:9" }'
            :poster="poster"
          >
            <source
              :src="stream.src"
              :type="stream.type"
            >
          </video>
        </v-card>
      </v-flex>

    </v-layout>


  <v-container
    class="pt-0"
    fluid
  >
    <v-layout
      column
      justify-center
      align-center
    >
      <v-flex
        xs12
        sm10
        md8
      >
        <v-card class="mb-3">
          <video
            playsinline
            id="solo-player"
            class="video-js vjs-default-skin"
            width="100%"
            controls
            muted
            preload="auto"
            data-setup='{ "aspectRatio":"16:9" }'
            :poster="poster"
          >
            <source
              :src="live[0].src"
              :type="live[0].type"
            >
          </video>
        </v-card>

        <v-card class="mb-3">
          <v-card-title class="headline">Welcome to BitWave</v-card-title>
          <v-card-text>
            <p>Vuetify is a progressive Material Design component framework for Vue.js. It was designed to empower developers to create amazing applications.</p>
            <p>For more information on Vuetify, check out the <a
              href="https://vuetifyjs.com"
              target="_blank"
            >documentation</a>.</p>
            <p>If you have questions, please join the official <a
              href="https://chat.vuetifyjs.com/"
              target="_blank"
              title="chat"
            >discord</a>.</p>
            <p>Find a bug? Report it on the github <a
              href="https://github.com/vuetifyjs/vuetify/issues"
              target="_blank"
              title="contribute"
            >issue board</a>.</p>
            <p>Thank you for developing with Vuetify and I look forward to bringing more exciting features in the future.</p>
            <div class="text-xs-right">
              <em><small>&mdash; John Leider</small></em>
            </div>
            <hr class="my-3">
            <a
              href="https://nuxtjs.org/"
              target="_blank"
            >Nuxt Documentation</a>
            <br>
            <a
              href="https://github.com/nuxt/nuxt.js"
              target="_blank"
            >Nuxt GitHub</a>
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn
              color="primary"
              flat
              nuxt
              to="/inspire"
            >Continue</v-btn>
          </v-card-actions>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>

  </div>
</template>

<script>
  // videojs
  import videojs from 'video.js';
  import 'videojs-contrib-dash';

  export default {
    components: {
    },

    data() {
      return {
        player: null,
        initialized: false,

        poster: '/bitwave_cover.png',

        playerOptions: {
          // videojs options
          muted: true,
          html5: { hls: { withCredentials: false, } },
          sources: [{
            withCredentials: false,
            type: "application/x-mpegURL",
            src: "http://bitwave.tv/stream/dispatch/",
          }],
        },

      }
    },

    computed: {

    },

    methods: {
      playerInitialize(){
        this.player = videojs('solo-player', {
          liveui: true,
          playbackRates: [0.5, 1, 1.25, 1.5, 1.75, 2],
        });
        this.initialized = true;
      },
      playerDispose(){
        this.player.dispose();
      },
    },

    async asyncData({ $axios, params }) {
      const host = process.env_production ? 'localhost:4000' : 'api.bitwave.tv';
      const { data } = await $axios.get(`http://${host}/api/sources/list`);
      return {
        streams: data.streams,
        videos: data.videos,
        live: data.live,
      };
    },

    mounted() {
      this.playerInitialize();
    },

    beforeDestroy() {
      this.playerDispose();
    },
  }
</script>
