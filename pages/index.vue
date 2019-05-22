<template>
  <v-container
    class="pt-2"
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
        <v-card
          v-if="live"
          class="mb-3"
          color="black"
        >
          <v-layout
            row
            wrap
            align-center
          >
            <v-flex
              style="min-width: 50%;"
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
            </v-flex>

            <v-flex
              shrink
              style="width: 450px;"
            >
              <v-layout style="max-height: 480px;">
                <v-flex>
                  <chat
                    :chat-channel="live[0].name"
                    :dark="true"
                  />
                </v-flex>
              </v-layout>
            </v-flex>
          </v-layout>

        </v-card>

        <v-card class="mb-3">
          <v-card-title class="headline pb-0">
            <h6 class="headline" style="width:100%">Welcome to [bitwave.tv]</h6>
            <v-layout wrap>
              <div class="subheading grey--text">
                An open platform live streaming service for creators to freely express themselves.
              </div>
              <v-flex class="ml-2">
                <v-img
                  contain
                  max-height="2rem"
                  max-width="2rem"
                  src="https://cdn.bitwave.tv/static/emotes/cool_blobby.gif"
                  alt="Cool blobby with sunglasses"
                  @click="updatePlayerSrc"
                ></v-img>
              </v-flex>
            </v-layout>
          </v-card-title>

          <v-card-text>
            <v-flex class="mb-2">
              <v-btn
                small
                outline
                color="yellow"
                href="https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=JAN2HKQ9CTYZY&source=url"
                target="_blank"
              >Donate</v-btn>
              Want to help support the site?
            </v-flex>

            <p>A straight forward streaming service built from the ground up on open source software.
              Bitwave is a project that has grown from the ashes of Stream.me, with all the features Stream.me never implemented.</p>

            <v-flex>
              <v-btn
                small
                outline
                color="light-blue"
                href="https://github.com/bitwave-tv/bitwave"
                target="_blank"
              >Github</v-btn>
              For more information on Bitwave's source code.
            </v-flex>

            <v-flex v-if="false">
              <v-btn
                small
                outline
                color="light-blue"
                href="https://riot.im/app/#/group/+ops:ethanralph.com?hs_url=https://ethanralph.com"
                target="_blank"
                title="chat"
              >Riot</v-btn>
              If you have questions, join the riot chat.
            </v-flex>

            <v-flex>
              <v-btn
                small
                outline
                color="light-blue"
                href="https://discord.gg/4WwJsKx"
                target="_blank"
                title="chat"
              >Discord</v-btn>
              If you have questions or feedback, join the discord chat.
            </v-flex>

            <v-flex>
              <v-btn
                small
                outline
                color="light-blue"
                href="https://github.com/bitwave-tv/bitwave/issues"
                target="_blank"
                title="contribute"
              >issue</v-btn>
              Find a bug? Report it on Github.
            </v-flex>

            <v-flex class="my-2">
              <v-btn
                small
                outline
                color="red"
                to="/report"
              >File a report</v-btn>
              Need to report content?
            </v-flex>

            <div class="mb-0">Thank you for helping ALPHA test [bitwave.tv] and I look forward to bringing more exciting features in the future.</div>
            <div class="mb-0">We have not been served any secret court orders and are not under any gag orders.</div>

            <div class="text-xs-right">
              <em><small>&mdash; Dispatch</small></em>
            </div>
          </v-card-text>

          <hr class="mb-3">

          <v-card-actions class="pt-0">
            <v-flex>
              <span>Bitwave Media &copy; {{ new Date().getFullYear() }}</span>
            </v-flex>
            <v-spacer/>
            <v-btn
              small
              color="yellow"
              flat
              nuxt
              to="/login"
            >Login</v-btn>
            <v-btn
              light
              small
              color="yellow"
              nuxt
              to="/login"
            >Register</v-btn>
          </v-card-actions>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
  // videojs
  import videojs from 'video.js';
  import 'videojs-contrib-dash';
  import Chat from '~/components/Chat'

  export default {
    head() {
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
      Chat,
    },

    data() {
      return {
        player: null,
        initialized: false,
        poster: 'https://cdn.bitwave.tv/static/img/BitWave2.sm.jpg',
      }
    },

    computed: {

    },

    methods: {
      playerInitialize(){
        this.player = videojs('solo-player', {
          // liveui: true,
          // playbackRates: [0.5, 1, 1.25, 1.5, 1.75, 2],
        });
        this.initialized = true;
      },

      playerDispose(){
        this.player.dispose();
      },

      updatePlayerSrc() {
        this.player.src({ type: 'video/mp4', src: 'https://cdn.bitwave.tv/static/bumps/Bump33-sm.mp4' });
      },
    },

    async asyncData({ $axios }) {
      const host =  'https://api.bitwave.tv';
      const { data } = await $axios.get(`${host}/api/sources/list`);
      return {
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

<style>
  .video-js .vjs-live-control {
    margin-left: 1rem;
  }
</style>
