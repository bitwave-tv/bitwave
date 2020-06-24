<template>
  <div
    class="pa-2"
  >
    <div class="d-flex align-center">
      <!-- Replay Title -->
      <div
        class="body-1 font-weight-bold text-truncate text-no-wrap primary---text mb-0"
        :title="title"
      >{{ title }}</div>

      <v-spacer/>

      <!-- Viewer Count -->
      <div
        class="d-flex align-center caption ml-2 grey--text"
        :title="`${views} ${views === 1 ? 'view' : 'views'}`"
      >
        {{ views }}
        <v-icon color="grey" small class="ml-1">visibility</v-icon>
      </div>
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
</template>

<script>
  export default {
    name: 'ReplayCardInfo',

    props: {
      title        : { type: String },
      username     : { type: String },
      nsfw         : { type: Boolean },
      views        : { type: Number, default: 0 },
      commentCount : { type: Number, default: 0 },
    },
  };
</script>
