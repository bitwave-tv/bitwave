<template>
  <div>
    <div class="gradient-background">
      <!-- Stream Replay Cards-->
      <v-container fluid>

        <!-- Header -->
        <div class="text-center my-2">
          <div class="headline"><v-icon>restore</v-icon> Recent Stream Replays</div>
          <div class="subtitle grey--text">Catch up on recent streams you may have missed!</div>
        </div>

        <!-- Blur Toggle -->
        <div class="d-flex align-end mb-1 mt-2">
          <div class="title"></div>
          <v-spacer />
          <v-switch
            v-model="blurNSFW"
            label="Blur NSFW thumbnails"
            color="primary"
            hide-details
            dense
            inset
          />
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
  import SimpleFooter from '@/components/SubLayout/SimpleFooter';
  import ReplayGrid from '@/components/Replay/ReplayGrid';

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
          { name: 'og:title',       hid: 'og:title',       content: title },
          { name: 'og:description', hid: 'og:description', content: description },
          { name: 'og:image',       hid:'og:image',        content: image },
          { name: 'description',    hid: 'description',    content: description },
          { name: 'twitter:card',        content: 'summary_large_image' },
          { name: 'twitter:site',        content: '@BitwaveTV' },
          { name: 'twitter:title',       content: title },
          { name: 'twitter:description', content: description },
          { name: 'twitter:image',       content: image },
        ],
      }
    },

    components: {
      ReplayGrid,
      SimpleFooter,
    },

    data() {
      return {
        blurNSFW: true,
      };
    },

    methods: {},

    computed: {
      version () {
        return `v${process.env.version}`;
      },
    },
  };
</script>
