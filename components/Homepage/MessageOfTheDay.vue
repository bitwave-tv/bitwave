<template functional>
  <v-row class="justify-center">
    <div class="d-flex align-center">
      <div class="title text-center mx-3 d-flex flex-column">
        <span class="font-weight-light white--text">Open Platform Livescreaming</span>
        <div>
          <span class="overline font-weight-black grey--text rgb-text">viewer discretion is advised</span>
        </div>
      </div>
      <img crossorigin="" height="52" data-emote-tooltip=":trout:" title=":trout:" alt=":trout:" src="https://cdn.bitwave.tv/static/emotes/trout-52.gif?4">
    </div>
  </v-row>
</template>

<script>
  export default {
    name: 'MessageOfTheDay',
    serverCacheKey: () => 'MOTD',
  };
</script>
