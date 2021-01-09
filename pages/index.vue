<template>
  <div>
    <div class="gradient-background">
      <!-- Goal Progress -->
      <goal-progress v-if="false" />

      <v-container fluid>

        <!-- Site Banner -->
        <message-of-the-day />

        <v-row class="justify-center">
          <v-col
            cols="12"
            md="10"
            xl="8"
          >
            <!-- Banner Stream -->
            <banner-video
              :src="live[0].src"
              :type="live[0].type"
              :poster="poster"
              :name="live[0].name"
              :mobile="mobile"
              :offline="offline"
            />
          </v-col>
        </v-row>


        <!-- Live Now Header -->
        <div class="mb-4">
          <div class="d-flex justify-space-between align-end">
            <div class="headline font-weight-light white--text">
              Live Now
            </div>
            <v-switch
              v-model="blurNSFW"
              label="Blur NSFW thumbnails"
              color="primary"
              hide-details
              dense
              inset
            />
          </div>

          <!-- Livestream Grid -->
          <stream-grid
            :streamers="streamers"
            :blur-nsfw="blurNSFW"
            :cols="12"
            :sm="6"
            :md="4"
            :lg="3"
            :xl="2"
          />
        </div>

        <!-- Trending Replay Header -->
        <div class="mb-4">
          <div class="d-flex justify-space-between align-end">
            <div class="headline font-weight-light white--text">Trending Replays</div>
            <v-switch
              v-model="blurNSFW"
              label="Blur NSFW thumbnails"
              color="primary"
              hide-details
              dense
              inset
            />
          </div>

          <!-- Display a grid of trending replays -->
          <v-lazy
            :min-height="300"
          >
            <lazy-trending-replays
              :limit="6"
              :blur-nsfw="blurNSFW"
              :cols="12"
              :sm="6"
              :md="4"
              :lg="3"
              :xl="2"
            />
          </v-lazy>
        </div>

        <!-- Recent Replay Header -->
        <div class="mb-4">
          <div class="d-flex justify-space-between align-end">
            <div class="headline font-weight-light white--text">Recent Replays</div>
            <v-switch
              v-model="blurNSFW"
              label="Blur NSFW thumbnails"
              color="primary"
              hide-details
              dense
              inset
            />
          </div>

          <!-- Replay Grid -->
          <v-lazy
            :min-height="300"
          >
            <lazy-replay-grid
              :limit="6"
              :blur-nsfw="blurNSFW"
              :cols="12"
              :sm="6"
              :md="4"
              :lg="3"
              :xl="2"
            />
          </v-lazy>
        </div>

        <!-- Homepage Content -->
        <about-us class="mb-5 mt-2" />

      </v-container>
    </div>

    <!-- Footer -->
    <simple-footer :version="version" />
  </div>
</template>

<script>
  import { mapState, mapMutations, mapActions } from 'vuex';
  import { VStore } from "@/store";

  export default {
    scrollToTop: true,

    head () {
      return {
        title: `Homepage - [bitwave.tv]`,
        link: [
          { rel: 'canonical', href: `https://bitwave.tv` },
        ],
        meta: [
          { property: 'og:title',            hid: 'og:title',       content: `Livestream Homepage - [bitwave.tv]` },
          { property: 'og:url',              hid: 'og:url',         content: `https://bitwave.tv` },
          { property: 'og:description',      hid: 'og:description', content: `An open platform live streaming service for creators to freely express themselves.` },
          { property: 'og:image',            hid:'og:image',        content: this.poster},
          { property: 'description',         hid: 'description',    content: 'An open platform live streaming service for creators to freely express themselves.' },
          { property: 'twitter:card',        content: 'summary_large_image' },
          { property: 'twitter:site',        content: '@BitwaveTV' },
          { property: 'twitter:title',       content: 'Livestream Homepage - [bitwave.tv]' },
          { property: 'twitter:description', content: 'An open platform live streaming service for creators to freely express themselves.' },
          { property: 'twitter:image',       content: this.poster },
        ],
      }
    },

    data () {
      return {
        mounted: false,
        player: null,
        poster: 'https://cdn.bitwave.tv/static/img/Bitwave_Banner.jpg',
        chatMessages: null,
        offline: true,
      }
    },

    methods: {
      ...mapMutations ({
        setBlurNsfw : VStore.$mutations.setBlurNsfw,
      }),

      ...mapActions ({
        loadSettings : VStore.$actions.loadSettings,
      }),
    },

    async asyncData ({ $axios }) {
      const defaultLive = [
        {
          "src": 'https://cdn.bitwave.tv/static/bumps/2a3un.mp4',
          "name": "offline",
          "type": "video/mp4",
        },
      ];

      // Timeout to prevent SSR from locking up
      const timeout = process.server ? process.env.SSR_TIMEOUT : 0;

      const getStreams = async () => {
        try {
          const { data } = await $axios.getSSR( 'https://api.bitwave.tv/v1/channels/live', { timeout } );
          if ( data && data.success ) {
            return {
              live: data.live,
              streamers: data.streamers,
            }
          } else {
            console.log( `API Error:`, data );
          }
        } catch ( error ) {
          console.error( `Failed to get live channels from API server: ${error.message}` );
          return {
            live: defaultLive,
            streamers: [],
          }
        }
        console.log( `Failed to get live channels from API server` );
        return {
          live: defaultLive,
          streamers: [],
        }
      };

      const streams = await getStreams();

      return {
        live: streams.live,
        streamers: streams.streamers,
        offline: false,
      }
    },

    computed: {
      ...mapState({
        getBlurNsfw : VStore.$states.blurNsfw,
      }),

      blurNSFW: {
        get () { return this.getBlurNsfw; },
        set ( data ) {
          this.setBlurNsfw( data );
        }
      },

      mobile () {
        return this.mounted
          ? this.$vuetify.breakpoint.smAndDown
          : !this.$device.isDesktopOrTablet;
      },

      version () {
        return `v${process.env.version}`;
      },
    },

    mounted () {
      this.mounted = true;
      if ( this.offline ) this.$toast.error( 'API Error: SSR Hydration failed', { duration: 5000, icon: 'error', position: 'top-center' } );
      this.loadSettings();
    },
  }
</script>
