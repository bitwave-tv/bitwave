<template functional>
  <div>
    <v-lazy
      :options="{ threshhold: 0.75 }"
      transition="fade-transition"
      min-height="150px"
    >
      <v-card
        :to="props.to"
        class="stream-card"
      >
        <!-- Thumbnail -->
        <v-img
          :src="props.image"
          :key="props.image"
          lazy-src="https://cdn.bitwave.tv/static/img/BitWave2.sm.jpg"
          :aspect-ratio="16/9"
          :class="{ 'blur': props.live && props.nsfw }"
        >
          <!--<div class="fill-height bottom-gradient"></div>-->
        </v-img>

        <!-- View Counter -->
        <div class="view-counter">
          <v-chip
            color="grey darken-4"
            small
            tile
          >
            <div v-if="props.live" class="d-flex align-center">
              <div class="white--text">{{ props.viewers < 2 ? '🐜🐜' : props.viewers }}</div>
              <v-icon v-show="props.viewers > 1" color="red" class="ml-2" small>visibility</v-icon>
            </div>
            <div v-else class="d-flex align-center">
              <div class="grey--text mr-2">OFFLINE</div>
              <v-icon small>visibility_off</v-icon>
            </div>
          </v-chip>
        </div>

        <!-- Card Data -->
        <div class="pa-2">
          <!-- Stream Data -->
          <div class="body-1 font-weight-bold text-truncate text-no-wrap yellow--text mb-0">
            {{ props.title }}
          </div>
          <div class="caption d-flex align-center">

            <div>{{ props.name }}</div>

            <template v-if="props.nsfw">
              <v-divider vertical class="mx-2"/>
              <div class="d-flex align-center">
                <div class="red--text">NSFW</div>
              </div>
            </template>

          </div>
        </div>
      </v-card>
    </v-lazy>
  </div>
</template>

<script>
  export default {
    name: 'StreamCard',

    props: {
      to      : { type: String },
      live    : { type: Boolean },
      image   : { type: String },
      nsfw    : { type: Boolean },
      title   : { type: String },
      name    : { type: String },
      viewers : { type: Number },
    },
  }
</script>

<style lang="scss">
  .blur > div.v-image__image {
    filter: blur(15px);
    -webkit-filter: blur(15px);
  }

  .stream-card {

    .view-counter {
      position: absolute;
      top: 10px;
      right: 10px;
      opacity: .75;
      transition: .3s;
    }

    &:hover {
      .view-counter {
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
