<template>
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

    <!-- Replay Card Info -->
    <replay-card-info
      :title="title"
      :username="username"
      :nsfw="nsfw"
      :views="views"
      :comment-count="commentCount"
    />
  </v-card>
</template>

<script>
  import ReplayCardThumbnails from '@/components/Replay/ReplayCard/ReplayCardThumbnails';
  import ReplayCardInfo from '@/components/Replay/ReplayCard/ReplayCardInfo';

  export default {
    name: 'ReplayCard',

    components: {
      ReplayCardInfo,
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
