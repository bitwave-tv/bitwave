<template>
  <div>

    <v-layout
      v-if="false"
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
        <v-card class="mb-3">
          <video
            playsinline
            id="solo-player"
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
              :src="live[0].src"
              :type="live[0].type"
            >
          </video>
        </v-card>

        <v-card class="mb-3">

          <v-card-title class="headline pb-0">
            <h6 class="headline" style="width:100%">Welcome to BitWave</h6>
            <v-layout wrap>
              <div class="subheading grey--text">
                IP scratched. /comfychat/. Trolls welcome. Blobby.
              </div>
              <v-flex class="ml-2">
                <v-img
                  v-if="false"
                  contain
                  max-height="2rem"
                  max-width="2rem"
                  src="https://dispatch.sfo2.cdn.digitaloceanspaces.com/static/emotes/cool_blobby.gif"
                  alt="Cool blobby with sunglasses"
                ></v-img>
              </v-flex>
            </v-layout>
          </v-card-title>

          <v-card-text>

            <v-flex>
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
                href="https://github.com/DispatchCommit/BitWave"
                target="_blank"
              >Github</v-btn>
              For more information on BitWave's source code.
            </v-flex>

            <v-flex>
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
                href="https://github.com/DispatchCommit/BitWave/issues"
                target="_blank"
                title="contribute"
              >issue</v-btn>
              Find a bug? Report it on Github.
            </v-flex>

            <v-flex class="my-3">
              <v-btn
                small
                outline
                color="red"
                to="/report"
              >File a report</v-btn>
              Need to report content?
            </v-flex>

            <p>Thank you for helping alpha test BitWave.tv and I look forward to bringing more exciting features in the future.</p>

            <div class="text-xs-right">
              <em><small>&mdash; Dispatch</small></em>
            </div>

          </v-card-text>

          <hr class="mb-3">

          <v-card-actions class="pt-0">
            <v-flex>
              <p>BitWave Media &copy; {{ new Date().getFullYear() }}</p>
            </v-flex>
            <v-spacer />
            <v-btn
              color="yellow"
              outline
              nuxt
              to="/login"
            >Login</v-btn>
            <v-btn
              light
              color="yellow"
              nuxt
              to="/login"
            >Register</v-btn>
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
      // process.env.NODE_ENV !== 'production'

      const host =  'https://api.bitwave.tv';
      const { data } = await $axios.get(`${host}/api/sources/list`);

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
