<template functional>
  <v-row class="justify-center">
    <div class="d-flex align-center">
      <div class="title text-center mx-3 d-flex flex-column">
        <span class="font-weight-light white--text">Freedom of Expression</span>
        <span class="overline grey--text">for livestreamers and coofers</span>
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
