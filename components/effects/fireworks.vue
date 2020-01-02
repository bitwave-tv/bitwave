<template>
    <div
      id="fireworks"
      :class="{
        darken: darken,
      }"
    >
      <canvas
        id="canvas"
        :class="{
          show: showCanvas
        }"
      >
        Your browser does not support the 'canvas' element. :(
      </canvas>
      <div
        class="hero"
        :class="{
          show: showHero
        }"
      >
        <div class="display-2 mb-5">dlive is the future</div>
        <div class="display-1 font-weight-thin">[bitwave.tv]</div>
      </div>
    </div>
</template>

<script>
  import { Fireworks } from '@/assets/js/effects/Fireworks';

  let fireworks = null;

  export default {
    name: 'fireworks',

    data() {
      return {
        darken: false,
        showCanvas: false,
        showHero: false,
        heroDelay: 2.5,
        duration: 10,
        transitionDuration: 0.5,
      };
    },

    methods: {
      start () {
        fireworks = new Fireworks();

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
  };
</script>

<style lang='scss'>
  #fireworks {
    pointer-events: none;

    z-index: 100;

    position: fixed;;
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

    .hero {
      position: fixed;
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
