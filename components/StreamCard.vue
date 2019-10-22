<template>
    <div>
      <v-card
        :to="to"
      >
        <v-img :src="image" :aspect-ratio="16/9" :class="{ 'blur': (live && nsfw) }"/>
        <v-card-text class="pa-2">
          <div class="body-1 font-weight-bold text-truncate text-no-wrap mb-0 yellow--text" style="color: #ffeb3b;">
            {{ title }}
          </div>
          <div class="caption">
            {{ name }}
          </div>
        </v-card-text>
      </v-card>
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
