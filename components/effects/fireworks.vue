<template>
    <div
      ref="fireworks"
      class="fireworks"
      :class="{
        darken: darken,
      }"
      :style="{
        position: position,
      }"
    >
      <canvas
        ref="canvas"
        class="canvas"
        :class="{
          show: showCanvas
        }"
      >
        Your browser does not support the 'canvas' element. :(
      </canvas>
      <div
        class="overlay-hero"
        :class="{
          show: showHero
        }"
      >
        <div class="display-2 mb-5">{{ message }}</div>
        <div class="display-1 font-weight-thin">{{ subtext }}</div>
      </div>
    </div>
</template>

<script>
  import { Fireworks } from '@/assets/js/effects/Fireworks';

  let fireworks = null;

  export default {
    name: 'fireworks',

    props: {
      absolute : { type: Boolean, default: false, },
      fixed    : { type: Boolean, default: false, },
    },

    data() {
      return {
        darken: false,
        showCanvas: false,
        showHero: false,
        heroDelay: 2.5,
        duration: 10,
        transitionDuration: 0.5,
        message: 'Open Platform Livestreaming',
        subtext: '[bitwave.tv]',
      };
    },

    methods: {
      start ( msg, subtxt ) {
        this.message = msg || 'dlive is the future';
        this.subtext = subtxt || '[bitwave.tv]';

        fireworks = new Fireworks( this.$refs[ 'canvas' ] );

        console.log( 'Starting Fireworks', fireworks );

        this.$nextTick( () => {
          this.beginLoop();
        });
      },

      async beginLoop () {
        setTimeout( () => this.fadeIn(), this.transitionDuration * 1000 );
        setTimeout( () => this.showMessage(), this.heroDelay * 1000 );
        setTimeout( () => this.fadeOut(), ( this.duration - this.transitionDuration ) * 1000 );
        await fireworks.start( this.duration * 1000 );
        this.onEnd();
      },

      fadeIn () {
        this.darken = true;
        this.showCanvas = true;
      },

      showMessage () {
        this.showHero = true;
      },

      fadeOut () {
        this.showCanvas = false;
      },

      onEnd () {
        console.log( 'Ending Fireworks' );
        this.darken   = false;
        this.showHero = false;
        this.showCanvas = false;
      },
    },

    computed: {
      position () {
        if ( this.absolute ) return 'absolute';
        if ( this.fixed ) return 'fixed';
        else return 'relative';
      },
    },

  };
</script>

<style lang='scss'>
  .fireworks {
    pointer-events: none;

    z-index: 100;

    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;

    background: rgba( 0, 0, 0, 0.75 );
    opacity: 0;
    transition: 0.5s;

    &.darken {
      opacity: 1;
    }

    canvas {
      width: 100%;
      height: 100%;
      transition: 2.5s;
      opacity: 0;

      &.show {
        opacity: 1;
      }
    }

    .overlay-hero {
      position: absolute;
      top: 25%;
      color: white;
      text-align: center;
      width: 100%;
      opacity: 0;
      transition: 0.5s;
      text-shadow: 0 2px 7px rgba( 0, 0, 0, 0.75 );

      &.show {
        opacity: 1;
      }
    }
  }
</style>
