<template>
  <transition-group
    name="fade-transition"
    class="display-stickers"
    tag="div"
  >
    <sticker
      v-for="s in stickers"
      v-if="s.display"
      :key="s.id"
      :id="s.id"
      :stickerStyle="createStyle( s.position )"
      :image="s.image"
      :label="createLabel( s.creator )"
    />
  </transition-group>
</template>

<script>
  import Sticker from '@/components/effects/Stickers/Sticker';

  export default {
    name: 'DisplayStickers',

    components: { Sticker },

    props: {
      stickers: {
        type: Array,
        default: []
      },
    },

    data() {
      return {

      };
    },

    methods: {
      createLabel ( creator ) {
        return `@${creator}`;
      },

      createStyle ( position ) {
        // return [ { transform: `translate( calc(${position.left} + 50%), calc(${position.top} - 100%) )` } ];
        return [ { left: position.left, top: position.top } ];
      },
    },

  };
</script>

<style lang='scss'>

</style>
