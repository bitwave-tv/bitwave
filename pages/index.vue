<template>
  <v-container fluid>

    <!-- Site Banner -->
    <v-row class="justify-center">
      <div class="d-flex align-center">
        <!-- image: "https://cdn.bitwave.tv/static/img/firework-banner.gif" size: 80 text: Freedom of Expression -->
        <v-img
          v-show="!this.$vuetify.breakpoint.smAndDown"
          src="https://cdn.bitwave.tv/static/emotes/windowoflife-92.gif"
          alt="window of life smash"
          height="92"
          contain
        />
        <div class="font-weight-light display-1 white--text text-center mx-3">brick.of.life.🧱</div>
        <v-img
          v-show="!this.$vuetify.breakpoint.smAndDown"
          src="https://cdn.bitwave.tv/static/emotes/sign3.gif"
          alt="bitwave sign OurAlley window of life"
          height="92"
          contain
        />
      </div>
    </v-row>

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
          :chat-messages="chatMessages"
        />

        <!-- Live Grid -->
        <stream-grid :streamers="streamers" />

        <!-- Homepage Content -->
        <v-card class="mb-3" color="grey darken-4">
          <v-card-title class="headline pb-2">
            <div class="d-flex align-center">
              <v-img
                class="d-block mx-3"
                contain
                max-height="2rem"
                max-width="2rem"
                src="https://cdn.bitwave.tv/static/emotes/cool_blobby.gif?_bw"
                alt="Cool blobby with sunglasses"
                crossorigin
              />
              <h6 class="headline" style="width:100%">Welcome to [bitwave.tv]</h6>
            </div>
            <div class="subheading font-weight-light grey--text" style="word-break: break-word;">
              An open platform live streaming service for creators to freely express themselves.
            </div>
          </v-card-title>

          <v-card-text>
            <div class="d-flex mb-2 align-center">
              <v-btn
                small
                outlined
                color="yellow"
                href="https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=JAN2HKQ9CTYZY&source=url"
                target="_blank"
                class="my-1 mr-1"
              >Donate</v-btn>
              to the bitwave server fund
            </div>

            <div class="mb-1">A straight forward streaming service built entirely on open source software.</div>
            <p>If you're interested in streaming here, just ask for a stream key in any chat, or message us on twitter or discord.</p>

            <div class="d-flex align-center">
              <v-btn
                small
                text
                color="light-blue"
                href="https://discord.gg/4WwJsKx"
                target="_blank"
                title="chat"
                class="my-1 mr-1"
              >Discord</v-btn>
              If you have questions or feedback, join the discord chat.
            </div>

            <div class="mb-2 d-flex align-center">
              <v-btn
                small
                text
                color="light-blue"
                href="https://twitter.com/BitWaveTV"
                target="_blank"
                title="chat"
                class="my-1 mr-1"
              >Twitter</v-btn>
              Message or tag us on Twitter for direct assistance.
            </div>

            <div class="d-flex align-center">
              <v-btn
                small
                text
                color="light-blue"
                href="https://github.com/bitwave-tv/bitwave"
                target="_blank"
                class="my-1 mr-1"
              >Github</v-btn>
              For more information on Bitwave's source code.
            </div>

            <div class="d-flex align-center" v-if="false">
              <v-btn
                small
                text
                color="light-blue"
                href="https://riot.im/app/#/group/+ops:ethanralph.com?hs_url=https://ethanralph.com"
                target="_blank"
                title="chat"
              >Riot</v-btn>
              If you have questions, join the riot chat.
            </div>

            <div class="d-flex align-center">
              <v-btn
                small
                text
                color="light-blue"
                href="https://github.com/bitwave-tv/bitwave/issues"
                target="_blank"
                title="contribute"
                class="my-1 mr-1"
              >issue</v-btn>
              Found a bug? Report it on Github.
            </div>

            <div class="mt-2 d-flex align-center">
              <v-btn
                small
                text
                color="red"
                to="/report"
                class="my-1 mr-1"
              >report</v-btn>
              Need to report content?
            </div>

            <div class="mb-2 d-flex align-center">
              <v-btn
                small
                text
                color="red"
                to="/tos"
                class="my-1 mr-1"
              >ToS</v-btn>
              Our terms of service.
            </div>

            <div class="mb-1">
              Thank you for helping
              <v-chip color="red" outlined small class="mx-1">ALPHA</v-chip>
              test [bitwave.tv] and I look forward to bringing more exciting features in the future.
            </div>

            <!-- Warrant canary -->
            <div class="mb-0">
              We have not been served any secret court orders and are not under any gag orders.
            </div>

            <div class="text-xs-right">
              <em><small>&mdash; Dispatch</small></em>
            </div>
          </v-card-text>

          <v-divider class="mb-2" />

          <v-card-actions class="pt-0">
            <div class="grey--text">
              Bitwave Media &copy; {{ new Date().getFullYear() }}
            </div>
            <v-spacer/>
            <v-btn
              small
              color="yellow"
              text
              nuxt
              to="/login"
            >Login</v-btn>
            <v-btn
              class="black--text"
              small
              color="yellow"
              nuxt
              to="/login"
            >Register</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
  import StreamGrid from '@/components/StreamGrid'
  import BannerVideo from '@/components/BannerVideo';
  import { Chat as ChatStore } from '@/store/chat';

  export default {
    scrollToTop: true,

    head () {
      return {
        title: `Homepage - [bitwave.tv]`,
        link: [
          { rel: 'canonical', href: `https://bitwave.tv` },
        ],
        meta: [
          { name: 'og:title',       hid: 'og:title',       content: `Livestream Homepage - [bitwave.tv]` },
          { name: 'og:description', hid: 'og:description', content: `An open platform live streaming service for creators to freely express themselves.` },
          { name: 'og:image',       hid:'og:image',        content: this.poster},
          { name: 'description',    hid: 'description',    content: 'An open platform live streaming service for creators to freely express themselves.' },
          { name: 'twitter:card',        content: 'summary_large_image' },
          { name: 'twitter:site',        content: '@BitwaveTV' },
          { name: 'twitter:title',       content: 'Livestream Homepage - [bitwave.tv]' },
          { name: 'twitter:description', content: 'An open platform live streaming service for creators to freely express themselves.' },
          { name: 'twitter:image',       content: this.poster },
        ],
      }
    },

    components: {
      BannerVideo,
      StreamGrid,
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

    },

    async asyncData ({ $axios, store }) {
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

      const getChatHydration = async ( channel ) => {
        try {
          const global = store.state[ChatStore.namespace][ChatStore.$states.global];
          if ( global === null ) return null;
          const { data } = await $axios.getSSR( `https://chat.bitwave.tv/v1/messages${ global ? '' : `/${channel}` }`, { timeout } );
          if ( data && data.success ) return data.data;
        } catch ( error ) {
          console.log( `Chat hydration request failed` );
          console.error( error.message );
        }
        return null;
      };

      // Get chat data for chat
      const channel = streams.live.length > 0 ? streams.live[0].name : 'error';
      const chatMessages = await getChatHydration( channel );

      return {
        live: streams.live,
        streamers: streams.streamers,
        chatMessages: chatMessages,
        offline: false,
      }
    },

    computed: {
      mobile () {
        return this.mounted
          ? this.$vuetify.breakpoint.smAndDown
          : !this.$device.isDesktopOrTablet;
      },
    },

    mounted () {
      this.mounted = true;
      if ( this.offline ) this.$toast.error( 'API Error: SSR Hydration failed', { duration: 5000, icon: 'error', position: 'top-center' } );
    },
  }
</script>

