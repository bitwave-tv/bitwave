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
            {{ user }}
          </v-tab>
          <v-tab>
            ARCHIVE
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
                :src="`https://bitwave.tv/stream/${user}/index.m3u8`"
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
  import videojs from 'video.js';
  import axios from 'axios';

  export default {
    components: {

    },

    data() {
      return {
        poster: 'https://dispatch.sfo2.cdn.digitaloceanspaces.com/static/img/bitwave_cover.png',
        streamTitle: '',
        player: null,
        initialized: false,
        streams: {
          hls: `https://bitwave.tv/stream/${this.user}/`,
        },
      }
    },

    computed: {
      user() {
        return this.$route.params.watch;
      }
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

    async asyncData ({ params }) {
      const { data } = await axios.get('https://api.bitwave.tv/api/channels/list');
      const users = data.users;
      // console.log(users);
      let poster = '';
      let streamTitle = 'STREAM NOT FOUND';
      for ( let i=0, max=users.length; i<max; i++ ) {
        if (users[i].username === params.watch) {
          poster = users[i].poster;
          streamTitle = users[i].name;
        }
      }
      return {
        poster: poster,
        streamTitle: streamTitle,
      }
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
