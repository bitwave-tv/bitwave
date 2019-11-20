<template>
  <div>
    <v-lazy
      :options="{ threshhold: 0.75 }"
      transition="fade-transition"
      min-height="150px"
    >
      <v-card
        :to="to"
        style="postion: relative;"
        class="stream-card"
      >
        <v-img
          :src="image"
          :key="image"
          lazy-src="https://cdn.bitwave.tv/static/img/BitWave2.sm.jpg"
          :aspect-ratio="16/9"
          :class="{ 'blur': (live && nsfw) }"
        >
          <!--<div class="fill-height bottom-gradient"></div>-->
        </v-img>

        <!-- View Counter -->
        <div class="view-counter">
          <!--<v-avatar
            :color="'#21212177'"
            :size="32"
          >
            <div>
              <v-progress-circular
                class="ma-3"
                :color="nsfw ? 'yellow' : '#00ff00'"
                :size="32"
                :width="3"
                :value="viewers / totalViewers * 100"
              >
                {{ viewers <= 3 ? '🐜' : viewers }}
              </v-progress-circular>
            </div>
          </v-avatar>-->
          <v-chip
            color="grey darken-4"
            small
            tile
          >
            <div v-if="live" class="d-flex align-center">
              <div class="white--text">{{ viewers < 2 ? '🐜🐜' : viewers }}</div>
              <v-icon v-show="viewers > 1" color="red" class="ml-2" small>visibility</v-icon>
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
            {{ title }}
          </div>
          <div class="caption d-flex align-center">

            <div>{{ name }}</div>

            <template v-if="nsfw">
              <v-divider vertical class="mx-2"></v-divider>
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

    data() {
      return {}
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

  .bottom-gradient {
    background-image: linear-gradient(to top, rgba(0, 0, 0, 0.4) 0%, transparent 72px);
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
