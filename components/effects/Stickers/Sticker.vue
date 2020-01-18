<template functional>
  <div
    class="sticker"
    :style="props.stickerStyle"
    :key="props.id"
  >
    <v-img
      contain
      :src="props.image"
    />
    <v-sheet
      class="tag white--text body-2 pa-1"
      color="black"
    >
      {{ props.label }}
    </v-sheet>
  </div>
</template>

<script>
  export default {
    name: 'Sticker',
  };
</script>

<style lang='scss'>

</style>
