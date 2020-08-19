<template>
  <div
    class="replay-thumbnail"
    @mouseenter="onMouseEnter"
    @mouseleave="onMouseLeave"
  >
    <!-- Thumbnail -->
    <v-img
      :src="thumbnailImage"
      :key="thumbnailIndex"
      :lazy-src="lazySource"
      :aspect-ratio="16/9"
      :class="{ 'blur': blur }"
      @load="onThumbnailLoaded"
      @error="onThumbnailError"
    />

    <!-- Duration Timecode -->
    <div class="replay-timecode">
      <v-chip
        color="grey darken-4"
        small
        label
      >
        <div
          v-if="duration"
          class="d-flex align-center"
        >
          <div class="white--text">{{ duration }}</div>
        </div>
      </v-chip>
    </div>

    <!-- Time Ago -->
    <div
      class="replay-timeago"
      :title="timestamp"
    >
      <v-chip
        color="grey darken-4"
        small
        label
      >
        <div
          v-if="timeAgo"
          class="d-flex align-center"
        >
          <div class="white--text">{{ timeAgo }}</div>
        </div>
      </v-chip>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'ReplayCardThumbnails',

    props: {
      thumbnails : { type: Array },
      duration   : { type: String },
      timeAgo    : { type: String },
      timestamp  : { type: Date },
      blur       : { type: Boolean, default: true },
    },

    data() {
      return {
        thumbnailIndex: 0,
        changeThumbnailInterval: null,
        thumbnailLoaded: false,
        lazySource: 'https://cdn.bitwave.tv/static/img/Bitwave_Banner.jpg',
        blurOverride: false,
      };
    },

    methods: {
      onMouseEnter () {
        if ( this.changeThumbnailInterval ) return;
        // Rotate through thumbnails on mouse over
        this.changeThumbnailInterval = setInterval( () => {
          if ( !this.thumbnailLoaded ) return console.log( `Previous thumbnail has not loaded yet!` );
          this.lazySource = this.thumbnailImage;
          this.thumbnailLoaded = false;
          if ( this.thumbnailIndex >= this.thumbnails.length ) {
            this.thumbnailIndex = 0;
          } else {
            this.thumbnailIndex++;
          }
        }, 1500);

        setTimeout( () => {
          this.onResetThumbnail();
        }, 15 * 1000 );
      },

      onMouseLeave () {
        // Remove interval on mouse out
        this.onResetThumbnail();
      },

      onThumbnailLoaded () {
        this.thumbnailLoaded = true;
      },

      onThumbnailError () {
        this.onMouseLeave();
        this.thumbnailIndex = 0;
      },

      onResetThumbnail () {
        this.lazySource = this.thumbnailImage;
        this.thumbnailIndex = 0;
        clearInterval( this.changeThumbnailInterval );
        this.changeThumbnailInterval = null;
      },

      /*getRandomThumbnail () {
        if ( !this.thumbnails || !this.thumbnails.length ) this.thumbnailIndex = 0;
        const newIndex = Math.floor( Math.random() * this.thumbnails.length );
        if ( newIndex === this.thumbnailIndex ) this.getRandomThumbnail();
        else this.thumbnailIndex = Math.floor( Math.random() * this.thumbnails.length ) - 1;
      },*/

    },

    computed: {
      thumbnailImage () {
        if ( !this.thumbnails || !this.thumbnails.length ) return 'hhttps://cdn.bitwave.tv/static/img/Bitwave_Banner-256.jpg';
        return this.thumbnails[ this.thumbnailIndex ];
      },
    },

    mounted() {

    },
  };
</script>

<style lang='scss'>
  .blur > div.v-image__image {
    filter: blur(15px);
    -webkit-filter: blur(15px);
  }

  .replay-thumbnail {
    position: relative;
    background-color: black;

    .view-counter {
      position: absolute;
      top: 10px;
      right: 10px;
      opacity: .85;
      transition: .3s;
    }

    .replay-timecode {
      position: absolute;
      bottom: 0;
      left: 0;
      opacity: .75;
      transition: .3s;
    }

    .replay-timeago {
      position: absolute;
      bottom: 0;
      right: 0;
      opacity: .75;
      transition: .3s;
    }

    &:hover {
      .view-counter,
      .replay-timecode,
      .replay-timeago, {
        opacity: 1;
      }
    }
  }
</style>
