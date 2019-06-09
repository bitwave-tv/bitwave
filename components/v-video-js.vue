<template>
  <div>
    <video
      controls
      playsinline
      ref="videoPlayer"
      class="video-js vjs-custom-skin vjs-fluid"
      :autoplay="false"
      preload="auto"
      data-setup='{ "aspectRatio":"16:9" }'
    ></video>
  </div>
</template>

<script>
  import videojs from 'video.js'
  import 'videojs-contrib-quality-levels'
  import 'videojs-hls-quality-selector'

  export default {
    name: "VideoPlayer",
    props: {
      userOptions: {
        type: Object,
        default() {
          return {};
        }
      }
    },

    data() {
      return {
        player: null,
        options: {
          liveui: true,
          playbackRates: [ 0.25, 0.5, 1, 1.25, 1.5, 1.75, 2 ],
          plugins: { qualityLevels: {} },
          poster: '',
        },
        initialized: false,
      }
    },

    mounted() {
      this.plugins.qualityLevels = {};

      this.player = videojs(this.$refs.videoPlayer, this.options, function onPlayerReady() {
        console.log('onPlayerReady', this);
      });

      // Load all qualities
      this.qualityLevels = this.player.qualityLevels();
      this.player.hlsQualitySelector();

      // Listen to change events for when the player selects a new quality level
      this.qualityLevels.on('change', () => {
        console.log('Quality Level changed:', this.qualityLevels[this.qualityLevels.selectedIndex]);
      });

      // Begin playing when new media is loaded
      this.player.on( 'loadeddata', () => this.player.play() );

      this.initialized = true;
    },

    beforeDestroy() {
      if (this.player) {
        this.player.dispose()
      }
    },
  }
</script>
