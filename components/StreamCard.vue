<template>
  <div>
    <v-lazy
      :options="{ threshhold: 0.75 }"
      transition="expand-transition"
      min-height="150px"
    >
      <v-card
        :to="to"
      >
        <v-img
          :src="image"
          :aspect-ratio="16/9"
          :class="{ 'blur': (live && nsfw) }"
        ></v-img>
        <v-card-text class="pa-2">
          <div class="body-1 font-weight-bold text-truncate text-no-wrap mb-0 yellow--text">
            {{ title }}
          </div>
          <div class="caption">
            {{ name }}
          </div>
        </v-card-text>
      </v-card>
    </v-lazy>
  </div>
</template>

<script>
  export default {
    name: 'StreamCard',

    props: {
      to    : { type: String },
      live  : { type: Boolean },
      image : { type: String },
      nsfw  : { type: Boolean },
      title : { type: String },
      name  : { type: String },
    },

    data() {
      return {}
    },

    methods: {},

    computed: {},
  }
</script>

<style lang="scss">
  .blur > div.v-image__image {
    filter: blur(15px);
    -webkit-filter: blur(15px);
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
