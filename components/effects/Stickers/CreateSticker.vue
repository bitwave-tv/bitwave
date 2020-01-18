<template>
  <div
    class="create-sticker"
  >
    <sticker
      :id="sticker.id"
      :stickerStyle="stickerStyle"
      :image="sticker.image"
      label="Position Sticker"
    />
  </div>
</template>

<script>
  import Sticker from '@/components/effects/Stickers/Sticker';
  import { db } from '@/plugins/firebase';

  export default {
    name: 'CreateSticker',

    components: { Sticker },

    props: {
      stickerId: { type: String },
      mouse: { type: Object },
    },

    data() {
      return {
        sticker: {
          id: '',
          image: '',
        },

        stickerStyle: {
          width: null,
          height: null,
          transform: null,
        },

        pos: { x: 0, y: 0 },

        stop: false,
      };
    },

    methods: {

      async createSticker ( id ) {
        const stickerDoc = await db
          .collection( 'virtualStore' )
          .doc( id )
          .get();

        const stickerData = stickerDoc.data();
        this.sticker = {
          image: stickerData.image,
          size: stickerData.size,
          position: { x: '50%', y: '50%' },
        };
        // this.stickerStyle.width = this.sticker.size.width;
        // this.stickerStyle.height = this.sticker.size.height;
        this.update();
      },

      update () {
        console.log(`update`);
        if ( this.stop ) return;

        if ( this.mouse.rect ) {
          this.pos.x += ((this.mouse.x - this.mouse.rect.left) - this.pos.x) * .75; // / rect.width;
          this.pos.y += ((this.mouse.y - this.mouse.rect.top) - this.pos.y) * .75; // / rect.height;

          this.stickerStyle.transform = `translate( calc(${this.pos.x.toFixed(1)}px - 50%), calc(${this.pos.y.toFixed(1)}px - 100%) )`;
        } else {
          this.stickerStyle.transform = `translate( calc(0px - 50%), calc(0px - 100%) )`;
        }

        requestAnimationFrame( () => {
          if ( this.stop ) return;
          if ( this.stickerId ) this.$nextTick( () => this.update() );
        });
      },

    },

    computed: {

    },

    watch: {
      async stickerId ( newVal ) {
        await this.createSticker( newVal );
      },
    },

    async mounted () {
      if ( this.stickerId ) await this.createSticker( this.stickerId );
    },

    beforeDestroy() {
      this.$emit('done', { position: this.pos, image: this.sticker.image } );
      this.stop = true;
    }

  };
</script>

<style lang='scss'>

</style>
