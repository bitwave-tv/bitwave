<template>
  <div>
    <v-card
      class="stream-card"
      :to="link"
      no-prefetch
    >
      <div class="replay-thumbnail">
        <!-- Thumbnail -->
        <v-img
          :src="thumbnail"
          :key="id"
          lazy-src="https://cdn.bitwave.tv/static/img/Bitwave_Banner.jpg"
          :aspect-ratio="16/9"
          :class="{ 'blur': nsfw }"
        />

        <!-- View Counter -->
        <div class="view-counter">
          <v-chip
            color="grey darken-4"
            small
            label
          >
            <div v-if="views" class="d-flex align-center">
              <div class="white--text">{{ views <= 1 ? '🌊' : views }}</div>
              <v-icon v-show="viewers > 1" color="red" class="ml-2" small>visibility</v-icon>
            </div>
            <div v-else class="d-flex align-center">
              <div class="grey--text mr-2">REPLAY</div>
              <v-icon small>visibility_off</v-icon>
            </div>
          </v-chip>
        </div>

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

      <!-- Card Data -->
      <div
        class="pa-2"
      >
        <!-- Stream Data -->
        <div
          class="body-1 font-weight-bold text-truncate text-no-wrap yellow--text mb-0"
          :title="title"
        >
          {{ title }}
        </div>
        <div class="caption d-flex align-center">

          <div class="d-block text-truncate">{{ username }}</div>

          <template v-if="nsfw">
            <v-divider vertical class="mx-2"/>
            <div class="d-flex align-center">
              <div class="red--text">NSFW</div>
            </div>
          </template>

          <template v-if="true">
            <v-spacer/>
            <div
              :title="`${commentCount} ${commentCount === 1 ? 'comment' : 'comments'}`"
            >
              {{ commentCount }}
              <v-icon small>message</v-icon>
            </div>
          </template>

        </div>
      </div>
    </v-card>
  </div>
</template>

<script>
  export default {
    name: 'ReplayCard',

    props: {
      id           : { type: String },
      link         : { type: String },
      duration     : { type: String },
      thumbnail    : { type: String, default: 'https://cdn.bitwave.tv/static/img/Bitwave_Banner.jpg' },
      nsfw         : { type: Boolean },
      title        : { type: String },
      username     : { type: String },
      commentCount : { type: Number, default: 0 },
      views        : { type: Number, default: 0 },
      timestamp    : { type: Date },
      timeAgo      : { type: String },
    },

    data () {
      return {}
    },
  }
</script>

<style lang="scss">
  .blur > div.v-image__image {
    filter: blur(15px);
    -webkit-filter: blur(15px);
  }

  .replay-thumbnail {
    position: relative;

    .view-counter {
      position: absolute;
      top: 10px;
      right: 10px;
      opacity: .75;
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

  .v-card--reveal {
    align-items: center;
    bottom: 0;
    justify-content: center;
    opacity: .5;
    position: absolute;
    width: 100%;
  }
</style>
