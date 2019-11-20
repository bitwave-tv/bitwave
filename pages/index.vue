<template>
  <v-container fluid>
    <v-row class="justify-center">
      <v-col
        cols="12"
        md="10"
        xl="8"
      >
        <!-- Banner Stream -->
        <v-card
          v-if="live"
          color="black"
          class="d-flex align-center flex-wrap elevation-8 mb-2"
        >
          <div
            class="flex-grow-1"
            style="min-width: 40%;"
          >
            <video
              playsinline
              id="solo-player"
              class="video-js vjs-default-skin vjs-fluid"
              controls
              autoplay
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
          </div>

          <div class="d-flex flex-shrink-1" :style="{ width: mobile ? '100%' : '450px', 'max-height': mobile ? '500px' : '555px' }" >
            <chat :chat-channel="live[0].name"/>
          </div>
        </v-card>

        <!-- Live Grid -->
        <stream-grid :streamers="streamers" />

        <!-- Homepage Content -->
        <v-card class="mb-3" color="grey darken-4">
          <v-card-title class="headline pb-0">
            <div class="d-flex align-center">
              <div class="mx-3">
                <v-img
                  class="d-block"
                  contain
                  max-height="2rem"
                  max-width="2rem"
                  src="https://cdn.bitwave.tv/static/emotes/cool_blobby.gif"
                  alt="Cool blobby with sunglasses"
                  @click="updatePlayerSrc"
                ></v-img>
              </div>
              <div class="ml-4">
                <h6 class="headline" style="width:100%">Welcome to [bitwave.tv]</h6>
                <div class="subheading grey--text" style="word-break: break-word;">
                  An open platform live streaming service for creators to freely express themselves.
                </div>
              </div>
            </div>
          </v-card-title>

          <v-card-text>
            <div class="d-flex mb-2 align-center">
              <v-btn
                small
                text
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

            <div class="mb-1">Thank you for helping <v-chip color="red" outlined small class="mx-1">ALPHA</v-chip> test [bitwave.tv] and I look forward to bringing more exciting features in the future.</div>
            <div class="mb-0">We have not been served any secret court orders and are not under any gag orders.</div>

            <div class="text-xs-right">
              <em><small>&mdash; Dispatch</small></em>
            </div>
          </v-card-text>

          <v-divider></v-divider>

          <v-card-actions class="pt-0">
            <v-col>
              <span>Bitwave Media &copy; {{ new Date().getFullYear() }}</span>
            </v-col>
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
  // videojs
  import videojs from 'video.js'
  // import 'videojs-contrib-dash'
  import Chat from '~/components/Chat'
  import StreamGrid from '@/components/StreamGrid'

  export default {
    head () {
      return {
        title: `Homepage - [bitwave.tv]`,
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
      StreamGrid,
      Chat,
    },

    data () {
      return {
        player: null,
        initialized: false,
        poster: 'https://cdn.bitwave.tv/static/img/BitWave2.sm.jpg',
      }
    },

    computed: {
      mobile () {
        return this.$vuetify.breakpoint.mdAndDown;
      },
    },

    methods: {
      playerInitialize () {
        this.player = videojs( 'solo-player', {
          // liveui: true,
          // playbackRates: [0.5, 1, 1.25, 1.5, 1.75, 2],
        });
        this.initialized = true;
      },

      playerDispose () {
        if ( this.player ) this.player.dispose();
      },

      updatePlayerSrc () {
        this.player.src({ type: 'video/mp4', src: 'https://cdn.bitwave.tv/static/bumps/Bump33-sm.mp4' });
      },
    },

    async asyncData ({ $axios }) {
      const live = ( await $axios.get( `https://api.bitwave.tv/api/sources/list`) ).data.live;
      const { data } = await $axios.get( 'https://api.bitwave.tv/api/channels/list' );
      return {
        streamers: data.users.filter( s => s.live ),
        live: live,
      }
    },

    mounted () {
      this.playerInitialize();
    },

    beforeDestroy () {
      this.playerDispose();
    },
  }
</script>

<style>
  .video-js .vjs-live-control {
    margin-left: 1rem;
  }
</style>
