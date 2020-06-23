<template>
  <div>
    <v-card
      class="stream-card"
      :to="link"
      no-prefetch
      color="accentwave"
    >
      <!-- Replay Card Thumbnails -->
      <replay-card-thumbnails
        :thumbnails="thumbnails || [ thumbnail ] "
        :duration="duration"
        :time-ago="timeAgo"
        :timestamp="timestamp"
        :blur="blur"
      />

      <!-- Replay Data -->
      <div
        class="pa-2"
      >
        <!-- Replay Title -->
        <div class="d-flex align-center">
          <div
            class="body-1 font-weight-bold text-truncate text-no-wrap primary---text mb-0"
            :title="title"
          >{{ title }}</div>

          <template v-if="views">
            <v-spacer/>
            <div
              class="d-flex align-center caption ml-2"
              :title="`${views} ${views === 1 ? 'view' : 'views'}`"
            >
              <div class="grey--text">{{ views < 1 ? '🌊' : views }}</div>
              <v-icon color="grey" small class="ml-1">visibility</v-icon>
            </div>
          </template>
        </div>

        <!-- Replay Bottom Text -->
        <div class="caption d-flex align-center">

          <!-- Streamer Username -->
          <div class="d-block text-truncate grey--text">{{ username }}</div>

          <!-- NSFW Indicator -->
          <template v-if="nsfw">
            <v-divider vertical class="mx-2"/>
            <div class="d-flex align-center">
              <div class="red--text font-weight-bold">NSFW</div>
            </div>
          </template>

          <!-- Comment Count -->
          <template>
            <v-spacer/>
            <div
              class="grey--text"
              :title="`${commentCount} ${commentCount === 1 ? 'comment' : 'comments'}`"
            >
              {{ commentCount }}
              <v-icon small color="grey">message</v-icon>
            </div>
          </template>

        </div>
      </div>
    </v-card>
  </div>
</template>

<script>
  import ReplayCardThumbnails from '@/components/Replay/ReplayCard/ReplayCardThumbnails';

  export default {
    name: 'ReplayCard',

    components: {
      ReplayCardThumbnails,
    },

    props: {
      id           : { type: String },
      link         : { type: String },
      duration     : { type: String },
      thumbnail    : { type: String },
      thumbnails   : { type: Array },
      nsfw         : { type: Boolean },
      title        : { type: String },
      username     : { type: String },
      commentCount : { type: Number, default: 0 },
      views        : { type: Number, default: 0 },
      timestamp    : { type: Date },
      timeAgo      : { type: String },
      blur         : { type: Boolean, default: true },
    },

    data () {
      return {

      }
    },

    computed: {},

    methods: {

    },
  }
</script>

<style lang="scss">
  .v-card--reveal {
    align-items: center;
    bottom: 0;
    justify-content: center;
    opacity: .5;
    position: absolute;
    width: 100%;
  }
</style>
