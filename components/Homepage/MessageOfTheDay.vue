<template functional>
  <v-row class="justify-center">
    <div class="d-flex align-center">
      <div class="title text-center mx-3 d-flex flex-column">
        <span class="font-weight-light white--text">Freedom of Expression <span class="black--text">#BLM</span></span>
        <span class="overline grey--text">for livestreamers and people of color</span>
      </div>
    </div>
  </v-row>
</template>

<script>
  export default {
    name: 'MessageOfTheDay',
    serverCacheKey: () => 'MOTD',
  };
</script>
