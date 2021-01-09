<template>
  <v-row class="justify-center">
    <div class="d-flex align-center">
      <div class="title text-center mx-3 d-flex flex-column">
        <span class="font-weight-light white--text">Open Platform Livestreaming</span>
        <div>
          <span class="overline font-weight-black rgb-text">{{ bottomText }}</span>
        </div>
      </div>
<!--      <img crossorigin="" height="52" data-emote-tooltip=":trout:" title=":trout:" alt=":trout:" src="https://cdn.bitwave.tv/static/emotes/trout-52.gif?4">-->
    </div>
  </v-row>
</template>

<script>
  export default {
    name: 'MessageOfTheDay',

    serverCacheKey: () => 'MOTD',

    data () {
      return {
        bottomText: process.env.BITWAVE_ENV === 'development'
          ? 'development build'
          : 'viewer discretion is advised',
      }
    },
  };
</script>
