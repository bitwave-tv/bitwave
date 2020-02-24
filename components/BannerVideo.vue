<template>
  <v-card
    v-if="live"
    color="black"
    class="d-flex flex-wrap justify-end elevation-8"
  >
    <!-- Stream Player -->
    <div
      class="flex-grow-1 align-self-center"
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
          :src="prerollVideo.source"
          :type="prerollVideo.type"
        >
      </video>
    </div>

    <!-- Chat -->
    <div
      v-if="displayChat"
      class="d-flex flex-shrink-1"
      :style="{ width: mobile ? '100%' : '450px', 'max-height': mobile ? '500px' : '555px' }"
    >
      <chat
        :chat-channel="name"
        :hydration-data="chatMessages"
      />
    </div>

    <!-- Restore chat FAB -->
    <v-fab-transition>
      <v-btn
        v-show="!displayChat"
        color="yellow"
        fixed
        fab
        dark
        bottom
        right
        class="v-btn--example"
        @click="() => setDisplayChat( true )"
      >
        <v-icon color="black">question_answer</v-icon>
      </v-btn>
    </v-fab-transition>

  </v-card>
</template>

<script>
  import videojs from 'video.js';
  import 'videojs-contrib-quality-levels';
  // import 'videojs-contrib-dash';

  import { mapState, mapMutations } from 'vuex';
  import { Chat as ChatStore } from '@/store/chat';

  import Chat from '@/components/Chat';

  const preroll = 'https://cdn.bitwave.tv/static/REWIND.mp4';

  export default {
    name: 'BannerVideo',

    props: {
      src     : { type: String },
      type    : { type: String },
      poster  : { type: String },
      name    : { type: String },
      mobile  : { type: Boolean, default: false },
      offline : { type: Boolean, default: false },
      chatMessages: { type: Array },
    },

    components: {
      Chat,
    },

    data() {
      return {
        live: true,
        initialized: false,
        showPreroll: false,
      };
    },

    methods: {
      ...mapMutations(ChatStore.namespace,{
        setDisplayChat: ChatStore.$mutations.setDisplayChat,
      }),

      playerInitialize () {
        try {
          this.player = videojs( 'solo-player', {
            // liveui: true,
            // playbackRates: [0.5, 1, 1.25, 1.5, 1.75, 2],
            inactivityTimeout: 1000,
            suppressNotSupportedError: true,
            userActions: {
              hotkeys: true,
            },
          });

          this.player.on( 'ended', async () => {
            this.reloadPlayer();
            this.player.play();
          });

          this.initialized = true;
        } catch ( error ) {
          console.error( error );
          this.initialized = false;
        }

      },

      playerDispose () {
        if ( this.player ) this.player.dispose();
      },

      reloadPlayer () {
        if ( !this.initialized ) return;
        this.player.poster = this.poster;
        this.player.src( { src: this.src, type: this.type } );
      },

      updatePlayerSrc () {
        this.player.src({ type: 'video/mp4', src: 'https://cdn.bitwave.tv/static/bumps/Bump33-sm.mp4' });
      },
    },

    computed: {
      ...mapState(ChatStore.namespace, {
        displayChat: ChatStore.$states.displayChat
      }),

      prerollVideo () {
        return {
          // do not show pre-roll if offline
          source: this.offline || !this.showPreroll
            ? this.src
            : preroll,
          type: this.offline || !this.showPreroll
            ? this.type
            : 'video/mp4',
        }
      },
    },

    mounted () {
      this.playerInitialize();
    },

    beforeDestroy () {
      this.playerDispose();
    },
  };
</script>

<style lang='scss'>
  @import "~assets/style/stream-player.scss";
</style>
