<template>
  <div
    v-if="!closed"
    :style="{
      width: '100%',
      height: '100%',
      position: 'absolute',
      top: 0,
      left: 0,
    }"
  >
    <div :style="{position: 'absolute', left: '50%', zIndex: 1010}">
      <v-btn
        :style="{
          position: 'relative',
          left: '-50%',
        }"
        class="mt-2"
        color="accent"
        elevation="18"
        fab
        x-small
        @click="close"
      >
        <v-icon small>close</v-icon>
      </v-btn>
    </div>

    <div :style="{ position: 'absolute', bottom: 0, right: 0 }" class="mb-4 mr-4">
      <v-tooltip left color="blue-grey darken-4">
        <template #activator="{ on: tooltip }">
          <v-btn v-on="{ ...tooltip }" class="ml-1" x-small icon>
            <v-icon color="blue-grey">help</v-icon>
          </v-btn>
        </template>
        <span class="text-justify">Click anywhere on screen<br> to send your click to the streamer.<br> Once done, exit by clicking the <b>X</b></span>
      </v-tooltip>
    </div>

    <div
      ref="clickOverlay"
      v-ripple
      @click="clickOverlayHandle"
      :style="{ width: '100%', height: '100%', zIndex: 1000, }"
    />
  </div>
</template>

<script>
  export default {
    name: "ClickOverlay",
    data() {
      return {
        temp: [],
        closed: false,
      }
    },
    methods: {
      clickOverlayHandle( e ) {
        const x = e.layerX * 1 / this.$refs.clickOverlay.offsetWidth,
              y = e.layerY * 1 / this.$refs.clickOverlay.offsetHeight;
        const d = this.temp.find( e => e.x === x && e.y === y );
        if( d ) d.value++;
        else this.temp.push({x:x,y:y,value:1});
        console.log( JSON.parse(JSON.stringify(this.temp)) );
        //e.preventDefault();
        //return e;
      },

      close( e ) {
        this.closed = true;
        this.$emit('closed');
        e.preventDefault();
        return e;
      }
    },
  }
</script>

<style scoped>

</style>
