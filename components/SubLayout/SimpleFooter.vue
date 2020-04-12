<template functional>
  <!-- Footer -->
  <v-sheet
    class="pa-2 d-flex justify-space-between align-center flex-wrap"
    color="accentwave"
    tile
  >
    <div class="overline">
      Powered by Bitwave Media
      <span class="grey--text">{{ props.version }}</span>
    </div>
    <div class="d-flex overline">
      <a href="https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=JAN2HKQ9CTYZY&source=url" target="_blank">Donate</a>
      <v-divider vertical class="mx-2" color="white"/>
      <a href="https://twitter.com/BitWaveTV" target="_blank">Twitter</a>
      <v-divider vertical class="mx-2" color="white"/>
      <a href="https://github.com/bitwave-tv/bitwave" target="_blank">Github</a>
      <v-divider vertical class="mx-2" color="white"/>
      <a href="https://bitwave.tv/tos" target="_blank">ToS</a>
    </div>
  </v-sheet>
</template>

<script>
  export default {
    name: 'SimpleFooter',

    props: {
      version: { type: String, },
    },

  };
</script>
