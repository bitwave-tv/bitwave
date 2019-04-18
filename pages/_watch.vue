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
                v-if="live"
                :src="url"
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
        <v-layout class="mb-2">
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
            <h2>{{ title }}</h2>
          </v-flex>
        </v-layout>
        <v-layout>
          <v-flex id="description">
            <vue-markdown
              v-if="desc"
              :source="desc"
            ></vue-markdown>
          </v-flex>
        </v-layout>
      </v-flex>
    </v-layout>
  </div>
</template>

<script>
  import videojs from 'video.js'
  import 'videojs-contrib-quality-levels'

  import { db } from '@/plugins/firebase.js'

  import VueMarkdown from '~/components/VueMarkdown'


  export default {
    head() {
      return {
        title: `${this.name} - BitWave.tv`,
        meta: [
          { name: 'og:title', hid: 'og:title', content: `${this.name}'s Stream - BitWave.tv` },
          { name: 'og:description', hid: 'og:description', content: `${(this.desc || '').split(200)} - BitWave.tv` },
          { name: 'description', hid: 'description', content: `${this.name} - BitWave.tv` },
          { name: 'og:image', content: this.poster },
          { name: 'author', content: this.name },
          { name: 'profile:username', content: this.name },
        ],
      }
    },

    components: {
      VueMarkdown,
    },

    data() {
      return {
        player: null,
        qualityLevels: null,
        initialized: false,
        watchDuration: 0,
        watchInterval: 30,
        lastWatch: null,
        watchTimer: null,
        streamDataListener: null,
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
        this.getStreamData();
        this.initialized = true;
      },

      trackWatchTime() {
        this.watchDuration += this.watchInterval;
        this.$ga.event({
          eventCategory: 'stream',
          eventAction: 'watch-time',
          eventLabel: this.name,
          eventValue: this.watchDuration / 60,
        });
        this.$ga.event({
          eventCategory: 'stream',
          eventAction: 'watch-interval',
          eventLabel: this.name,
          eventValue: this.watchInterval / 60,
        });
        console.log(`Watch Time: ${this.watchDuration}s on ${this.name}`);
      },

      getRandomBump() {
        // random id between 1 and 29
        const id = (Math.floor(Math.random() * 29) + 1).toString().padStart(2, '0');
        return `https://cdn.bitwave.tv/static/bumps/Bump${id}-sm.mp4`;
      },

      playerDispose(){
        if (this.initialized) this.player.dispose();
      },

      getStreamData () {
        const streamer = this.name.toLowerCase();
        const streamRef = db.collection('streams').doc(streamer);
        this.streamDataListener = streamRef.onSnapshot( async doc => await this.streamDataChanged( doc.data() ), error => console.warn(error) );
      },

      async streamDataChanged (data) {
        // Grab Stream Data
        this.title = data.title;
        this.desc  = data.description;
        this.live  = data.live;
        this.nsfw  = data.nsfw;

        console.log(`Stream Metadata Update.`, data);
      },

      async verifyChannel (user) {
        try {
          const {data} = await $axios.get(`https://api.bitwave.tv/api/channel/${user}`);
          return data.name;
        } catch (error) {
          console.log(`Channel ${user} does not exist`);
          return null;
        }
      },
    },

    async asyncData ({ $axios, params }) {
      const user = params.watch;
      try {
        const { data } = await $axios.get(`https://api.bitwave.tv/api/channel/${user}`);

        const name   = data.name   || 'No Username';
        const title  = data.title  || 'No Title';
        const desc   = data.description || 'No Description';
        const poster = data.poster || 'https://cdn.bitwave.tv/static/img/bitwave_cover_sm.jpg';
        const live   = data.live   || false;
        const nsfw   = data.nsfw   || false;
        const url    = data.url    || `https://stream.bitwave.tv/stream/${name}/index.m3u8`;

        return { name, title, desc, poster, live, nsfw, url, };

      } catch (error) {
        console.log(`ERROR: Failed to find user ${user}`);
        console.error(error.message);

        return {
          name: '404',
          title: '⚠ STREAM NOT FOUND ⚠',
          desc: 'Invalid Stream',
          poster: 'https://cdn.bitwave.tv/static/img/bitwave_cover_sm.jpg',
          live: false,
          nsfw: false,
          url: '',
        }
      }
    },

    async validate ({ params, query, store, $axios }) {
      const user = params.watch;
      if (!user.match(/^[a-zA-Z0-9._-]+$/)) {
        return false;
      }
      const { data } = await $axios.get(`https://api.bitwave.tv/api/channel/${user}`);
      return !!data.name;
    },

    async fetch ({ store, params }) {
      // const channel = this.verifyChannel(params.watch);
      // store.commit('setChannel', { channel: channel });
    },

    beforeRouteUpdate (to, from, next) {
      const params = to.params;
      if (params) console.log(`Watching: ${params.watch}`);
      next();
    },

    async mounted() {
      this.playerInitialize();

      console.debug('video.js:', this.player);

      if (this.live)
        this.watchTimer = setInterval( () => this.trackWatchTime(), 1000 * this.watchInterval );
      else if (this.name !== '404')
        console.log(`${this.name} is offline.`);
    },

    beforeDestroy() {
      if (this.streamDataListener) this.streamDataListener();
      if (this.watchTimer) clearInterval(this.watchTimer);
      this.playerDispose();
    },
  }
</script>

<style lang='scss'>
  a {
    color: yellow;
    text-decoration: none;
  }
</style>
