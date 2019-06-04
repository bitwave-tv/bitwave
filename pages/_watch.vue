<template>
  <v-container flex pa-0>
    <v-layout row>

      <!-- Video And Description -->
      <v-flex>

        <!-- Video JS -->
        <v-layout>
          <v-flex>
            <video
              playsinline
              id="streamplayer"
              class="video-js vjs-fluid vjs-16-9 vjs-custom-skin vjs-big-play-centered"
              height="100%"
              width="100%"
              style="min-width: 200px;"
              controls
              :autoplay="live"
              preload="auto"
              data-setup='{ "aspectRatio":"16:9" }'
            >
              <source
                v-if="live"
                :src="url"
                :type="type"
              >
              <source
                v-else
                :src="getRandomBump()"
                type="video/mp4"
              >
            </video>
          </v-flex>
        </v-layout>

        <!-- Mobile Chat -->
        <v-layout v-show="mobile">
          <v-flex class="mb-3" >
            <v-layout>
              <v-flex style="max-height: 65vh;">
                <no-ssr placeholder="Loading...">
                  <chat
                    :enable="mobile"
                    :chat-channel="name"
                    :dark="true"
                  ></chat>
                </no-ssr>
              </v-flex>
            </v-layout>
          </v-flex>
        </v-layout>

        <!-- Stream Title, Status, Description -->
        <v-layout mt-2>
          <v-flex class="px-3">
            <v-layout class="mb-2" align-center>
              <v-flex shrink>
                <v-icon
                  v-show="live"
                  size="14"
                  color="red"
                  class="blink mr-2"
                >lens</v-icon>
              </v-flex>
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

      </v-flex>


      <!-- Chat -->
      <v-flex shrink v-show="!mobile">
        <v-layout :style="{ width: '450px' }">
          <v-flex
            shrink
            :style="{ position: 'fixed', top: '48px', right: '0', height: 'calc(100vh - 48px)', width: '450px' }"
          >
            <no-ssr placeholder="Loading...">
              <chat
                :chat-channel="name"
                :dark="true"
              ></chat>
            </no-ssr>
          </v-flex>
        </v-layout>
      </v-flex>

    </v-layout>
  </v-container>
</template>

<script>
  import videojs from 'video.js'
  import 'dashjs'
  import 'videojs-contrib-dash'
  import 'videojs-contrib-quality-levels'
  import 'videojs-hls-quality-selector'

  import { db } from '@/plugins/firebase.js'

  import VueMarkdown from '~/components/VueMarkdown'
  import Chat from '~/components/Chat'

  export default {
    head() {
      return {
        title: `${this.name} - [bitwave.tv]`,
        meta: [
          { name: 'og:title',       hid: 'og:title',       content: `${this.title} - [bitwave.tv]` },
          { name: 'og:description', hid: 'og:description', content: (this.desc || '').substring(0, 200) },
          { name: 'og:image',       hid:'og:image',        content: this.poster},
          { name: 'author',         content: this.name },
          { name: 'description',    hid: 'description',    content: (this.name || '').substring(0, 200) },
          { name: 'profile:username',    content: this.name },
          { name: 'twitter:card',        content: 'summary_large_image' },
          { name: 'twitter:site',        content: '@BitwaveTV' },
          { name: 'twitter:title',       content: ( this.title || '' ).substring(0,  70) },
          { name: 'twitter:description', content: ( this.desc  || '' ).substring(0, 200) },
          { name: 'twitter:image',       content: this.poster },
        ],
      }
    },

    components: {
      VueMarkdown,
      Chat,
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
      mobile () {
        return !this.$vuetify.breakpoint.smAndUp;
        // if (process.browser) return !this.$vuetify.breakpoint.smAndUp;
        // return false;
      },
    },

    methods: {
      playerInitialize(){

        // Get stream data
        this.getStreamData();

        // Create video.js player
        this.player = videojs('streamplayer', {
          liveui: true,
          playbackRates: [ 0.25, 0.5, 1, 1.25, 1.5, 1.75, 2 ],
          plugins: { qualityLevels: {} },
          // poster: this.poster,
        });

        // Video Player Ready
        this.player.ready( () => {
          // Restore Volume
          try {
            let volume = localStorage.getItem('volume');
            if ( volume !== null ) {
              this.player.volume(volume);
            }
          } catch (e) {
            // No volume value in memory
            console.warn('Failed to find prior volume level');
          }
        });

        // Load all qualities
        this.qualityLevels = this.player.qualityLevels();
        this.player.hlsQualitySelector();

        // Listen to change events for when the player selects a new quality level
        this.qualityLevels.on('change', () => {
          console.log('Quality Level changed:', this.qualityLevels[this.qualityLevels.selectedIndex]);
        });

        // Save volume on change
        this.player.on('volumechange', () => {
          localStorage.setItem( 'volume', this.player.volume() );
          localStorage.setItem( 'muted',  this.player.muted() )
        });

        // Begin playing when new media is loaded
        this.player.on( 'loadeddata', () => this.player.play() );

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
        console.debug(`Watch Time: ${this.watchDuration}s on ${this.name}`);
      },

      getRandomBump() {
        // random id between 1 and 29
        const id = (Math.floor(Math.random() * 29) + 1).toString().padStart(2, '0');
        return `https://cdn.bitwave.tv/static/bumps/Bump${id}-sm.mp4`;
      },

      playerDispose(){
        if (this.player) this.player.dispose();
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
        this.nsfw  = data.nsfw;

        console.log(`Stream Metadata Update.`, data);

        const live = data.live;
        const url  = data.url  || `https://cdn.stream.bitwave.tv/stream/${name}/index.m3u8`;
        const type = data.type || `application/x-mpegURL`; // DASH -> application/dash+xml

        const thumbnail = data['thumbnail'] || null;
        // this.poster = ( live && thumbnail ) ? thumbnail : this.poster;

        // Detect user going live
        if (!this.live && live) {
          this.live = live;
          // Load and Play stream
          this.player.src({ src: url, type: type });
          // this.player.load();
          this.reloadPlayer();
        }

        // Detect source change
        if (this.url !== url  || this.type !== type) {
          this.url  = url;
          this.type = type;

          // Load and Play stream
          // this.player.src({ src: url, type: type });
          // this.player.load();

          this.reloadPlayer();
        }

        this.live = live;
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

      reloadPlayer () {
        if ( !this.initialized ) return;
        this.player.reset();
        this.player.src({ src: this.url, type: this.type });
        if (this.poster) this.player.poster = this.poster;
        this.player.load();
        console.log('Player reloaded');
      },
    },

    async asyncData ({ $axios, params }) {
      const user = params.watch;
      try {
        const { data } = await $axios.get(`https://api.bitwave.tv/api/channel/${user}`);

        const name   = data.name   || 'No Username';
        const title  = data.title  || 'No Title';
        const desc   = data.description || 'No Description';
        let   poster = data.poster || 'https://cdn.bitwave.tv/static/img/BitWave2.sm.jpg';
        const live   = data.live   || false;
        const nsfw   = data.nsfw   || false;
        const url    = data.url    || `https://cdn.stream.bitwave.tv/stream/${name}/index.m3u8`;
        const type   = data.type   || `application/x-mpegURL`; // DASH -> application/dash+xml

        const thumb  = data['thumbnail'] || false;
        if ( data.thumbnail ) {
          poster = live ? thumb : poster;
        }

        return { name, title, desc, poster, live, nsfw, url, type };

      } catch (error) {
        console.log(`ERROR: Failed to find user ${user}`);
        console.error(error.message);

        return {
          name: '404 Error',
          title: '⚠ 404 - STREAM NOT FOUND ⚠',
          desc: 'Invalid Stream',
          poster: 'https://cdn.bitwave.tv/static/img/BitWave2.sm.jpg',
          live: false,
          nsfw: false,
          url: '',
          type: '',
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

    beforeRouteUpdate (to, from, next) {
      const params = to.params;
      if (params) console.log(`Watching: ${params.watch}`);
      next();
    },

    async mounted() {

      if (this.live)
        this.watchTimer = setInterval( () => this.trackWatchTime(), 1000 * this.watchInterval );
      else if (this.name !== '404')
        console.log(`${this.name} is offline.`);

      if (process.client) {
        this.$nextTick( () => {
          this.playerInitialize();
          console.debug('video.js:', this.player);
        });
      }
    },

    beforeDestroy() {
      if (this.streamDataListener) this.streamDataListener();
      if (this.watchTimer) clearInterval(this.watchTimer);
      this.playerDispose();
    },
  }
</script>

<style lang='scss'>
  .video-js .vjs-tech {
    height: auto !important;
    position: absolute !important;
  }

  a {
    color: yellow;
    text-decoration: none;
  }

  #description {
    text-overflow: ellipsis;

    img {
      max-width: 100%;
    }
  }

  .blink{
    text-decoration: blink;
    -webkit-animation-name: blinker;
    -webkit-animation-duration: 0.6s;
    -webkit-animation-iteration-count:infinite;
    -webkit-animation-timing-function:ease-in-out;
    -webkit-animation-direction: alternate;
  }
  @-webkit-keyframes blinker {
    from {opacity: 1.0;}
    to {opacity: 0.0;}
  }
</style>
