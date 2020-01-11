<template>
  <div
    id="stickers"
  >
    <transition-group name="fade-transition">
      <v-img
        v-for="sticker in stickers"
        v-if="sticker.display"
        :key="sticker.id"
        class="sticker"
        :style="sticker.position"
        contain
        :src="sticker.image"
      >
        <v-sheet
          class="tag black--text overline py-1 px-2"
          color="white"
        >
          @{{ sticker.creator }}
        </v-sheet>
      </v-img>
    </transition-group>
  </div>
</template>

<script>
  import { db } from '@/plugins/firebase.js'

  export default {
    name: 'Stickers',

    props: {
      channel: { type: String },
    },

    data() {
      return {
        stickerListener: null,
        stickers: [],
      };
    },

    methods: {
      onStickersUpdated ( query ) {
        if ( query.empty ) {
          this.stickers = [];
          return;
        }

        const data = query.docs.map( doc => {
          return { ...doc.data(), id: doc.id }
        });

        console.log( `Stickers updated:`, data );
        this.stickers = data;
      },

      getStickers () {
        const timestamp = new Date();
        return db
          .collection( 'stickers' )
          .where('channel', '==', this.channel.toLowerCase() )
          .orderBy( 'timestamp', 'desc' )
          .endBefore( timestamp )
          .onSnapshot( query => {
            this.onStickersUpdated( query );
          });
      },
    },

    computed: {},

    mounted () {
      this.stickerListener = this.getStickers();
    },

    beforeDestroy() {
      if ( this.stickerListener ) this.stickerListener();
    },
  };
</script>

<style lang='scss'>
  #stickers {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    pointer-events: none;

    .sticker {
      position: absolute;
      height: 25%;
      width: 25%;
      transform: translate( -50%, -50% );
      overflow: visible;
    }

    .tag {
      opacity: .6;
      line-height: 1;
      position: absolute;
      bottom: 0;
      transform: translate( 50%, 100% );
    }
  }
</style>
