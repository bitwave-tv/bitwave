<template>
  <div
    id="stickers"
    :class="{ active: !!createStickerId }"
    @mousemove="onMouseMove"
    @click="onClick"
  >
    <!-- Adding Sticker -->
    <create-sticker
      v-if="createStickerId"
      :sticker-id="createStickerId"
      :mouse="mouse"
      @done="onDone"
    />


    <!-- Display Stickers -->
    <display-stickers
      :stickers="stickers"
    />

  </div>
</template>

<script>
  import { db } from '@/plugins/firebase.js'
  import DisplayStickers from '@/components/effects/Stickers/DisplayStickers';
  import CreateSticker from '@/components/effects/Stickers/CreateSticker';

  import { mapGetters } from 'vuex';
  import { VStore } from '@/store';

  export default {
    name: 'Stickers',

    components: { CreateSticker, DisplayStickers },

    props: {

    },

    data() {
      return {
        stickerListener: null,
        stickers: [],

        stickerId : null,
        stickerImage : null,
        createStickerId : null,

        mouse: {
          x: 0,
          y: 0,
          rect: null,
        },

        stickerStyle: {
          width: '0px',
          height: '0px',
          transform: '',
        }
      };
    },

    methods: {
      onStickersUpdated ( query ) {
        console.log( query );
        if ( query.empty ) {
          this.stickers = [];
          return;
        }
        console.log( `Stickers updates: `, query.docs );
        this.stickers = query.docs.map( doc => ({ ...doc.data(), id: doc.id }));
      },

      getStickers () {
        const timestamp = new Date(Date.now() - 1000 * 60 * 60 * 3); // Last 3 hours
        return db
          .collection( 'stickers' )
          .where('channel', '==', this.channel.toLowerCase() )
          .where('display', '==', true )
          .orderBy( 'timestamp', 'desc' )
          .endBefore( timestamp )
          .onSnapshot( query => {
            this.onStickersUpdated( query );
          });
      },

      async getStickerData ( id ) {
        const stickerDoc = await db
          .collection( 'virtualStore' )
          .doc( id )
          .get();

        const stickerData = stickerDoc.data();
        return {
          image: stickerData.image,
          size: stickerData.size,
          position: { x: '50%', y: '50%' },
        };
      },

      onMouseMove ( event ) {
        if ( !this.mouse.rect ) this.mouse.rect = event.target.getBoundingClientRect();

        this.mouse.x = event.x;
        this.mouse.y = event.y;
      },

      async onClick () {
        // Calculate fixed position
        const x = ( this.mouse.x - this.mouse.rect.left ) / this.mouse.rect.width * 100;
        const y = ( this.mouse.y - this.mouse.rect.top ) / this.mouse.rect.height * 100;

        console.log( `${x.toFixed(1)} x ${y.toFixed(1)}` );

        // Deactivate CreateSticker Component
        // Optionally we can move this to after the DB write if
        // we wish to keep the sticker visible to the user longer while processing
        this.createStickerId = null;

        // Create sticker
        await this.purchaseSticker( { x, y }, this.stickerImage );
      },


      // Gets sticker data, triggers CreateSticker component to start
      async onCreateSticker ( stickerId ) {
        // WS76UXrV4gWifIGatLsS

        // Get sticker data
        const sticker = await this.getStickerData ( stickerId );

        // Record sticker data
        this.stickerImage = sticker.image;
        this.stickerId = stickerId;

        // Trigger CreateSticker component
        this.createStickerId = stickerId;
      },


      async purchaseSticker ( position, image ) {
        await db
          .collection( 'stickers' )
          .add({
            channel: this.channel,
            creator: this.username,
            display: true,
            image: image,
            owner: this.userId,
            position: {
              left: `${position.x}%`,
              top: `${position.y}%`,
            },
            timestamp: new Date(),
          });
      },

      onDone ( data ) {
        console.log( data );
      },

    },

    computed: {
      ...mapGetters({
        username : VStore.$getters.getUsername,
        userId   : VStore.$getters.getUID,
      }),

      channel () {
        return this.$route.params.watch.toLowerCase();
      }
    },

    async mounted () {
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

    &.active {
      pointer-events: all;

      .sticker {
        pointer-events: none;
      }
    }

    .create-sticker,
    .display-stickers {
      width: 100%;
      height: 100%;
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
    }

    .sticker {
      position: absolute;
      height: 20%;
      width: 20%;
      transform: translate( -50%, -50% );
      overflow: visible;
    }

    .tag {
      opacity: .875;
      line-height: 1;
      position: absolute;
      /*bottom: 0;*/
      left: 50%;
      transform: translate( -50%, 10% );
      white-space: nowrap;
    }
  }
</style>
