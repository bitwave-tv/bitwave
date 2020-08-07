<template>
  <div>
    <div class="gradient-background">
      <!-- Stream Replay Cards-->
      <v-container fluid>

        <!-- Blur Toggle -->
        <div class="d-flex align-end">
          <div class="title"></div>
          <v-spacer />
          <v-switch
            v-model="blurNSFW"
            label="Blur NSFW thumbnails"
            color="primary"
            hide-details
            dense
            inset
            class="mt-0"
          />
        </div>

        <!-- Header -->
        <div class="text-center mb-1">
          <div class="headline"><v-icon>restore</v-icon> Trending Replays</div>
          <div class="subtitle grey--text">This algorithm probably sucks.</div>
        </div>

        <!-- Display a grid of replays -->
        <trending-replays
          :limit="8"
          :blur-nsfw="blurNSFW"
          :cols="12"
          :sm="6"
          :md="4"
          :lg="3"
          :xl="2"
        />

        <!-- Header -->
        <div class="text-center mb-1 mt-5">
          <div class="headline"><v-icon>restore</v-icon> Recent Stream Replays</div>
          <!--<div class="subtitle grey&#45;&#45;text">Catch up on recent streams you may have missed!</div>-->
        </div>

        <!-- Display a grid of replays -->
        <replay-grid
          :limit="12"
          :blur-nsfw="blurNSFW"
          :cols="12"
          :sm="6"
          :md="4"
          :lg="3"
          :xl="2"
        />

      </v-container>

      <!-- Footer -->
      <simple-footer :version="version" />
    </div>
  </div>
</template>

<script>
  import ReplayGrid from '@/components/Replay/ReplayGrid';
  import TrendingReplays from '@/components/Replay/TrendingReplays';

  import { mapState, mapMutations, mapActions } from 'vuex';
  import { VStore } from "@/store";

  const title = `Stream Replays - [bitwave.tv]`;
  const description = `Browse the most recent stream replays available.`;
  const image = `https://cdn.bitwave.tv/static/img/Bitwave_Banner.jpg`;

  export default {
    name: 'replays',

    scrollToTop: true,

    head () {
      return {
        title: title,
        link: [
          { rel: 'canonical', href: `https://bitwave.tv/replays` },
        ],
        meta: [
          { property: 'og:title',            hid: 'og:title',       content: title },
          { property: 'og:url',              hid: 'og:url',         content: `https://bitwave.tv/replays` },
          { property: 'og:description',      hid: 'og:description', content: description },
          { property: 'og:image',            hid:'og:image',        content: image },
          { property: 'description',         hid: 'description',    content: description },
          { property: 'twitter:card',        content: 'summary_large_image' },
          { property: 'twitter:site',        content: '@BitwaveTV' },
          { property: 'twitter:title',       content: title },
          { property: 'twitter:description', content: description },
          { property: 'twitter:image',       content: image },
        ],
      }
    },

    components: {
      TrendingReplays,
      ReplayGrid,
    },

    methods: {
      ...mapMutations ({
        setBlurNsfw : VStore.$mutations.setBlurNsfw,
      }),

      ...mapActions ({
        loadSettings : VStore.$actions.loadSettings,
      }),
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

      version () {
        return `v${process.env.version}`;
      },
    },

    mounted() {
      this.loadSettings();
    }
  };
</script>
