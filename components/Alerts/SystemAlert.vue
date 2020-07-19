<template>
  <v-system-bar
    class="d-flex justify-space-between"
    :color="color || `orange`"
    v-resize="onResize"
    app
  >
    <v-icon color="black" size="24">{{ icon || `warning` }}</v-icon>

    <div class="overline d-flex mx-2 text-truncate">
      <div
        :class="[ { marquee: scroll || needsScroll  }, textColor || 'black--text' ]"
        class="body-1	black--text font--weight-bold"
        ref="marquee"
      >
        <div
          :style="{
            animationDuration: marqueeDuration,
            animationPlayState: alertMounted && scroll || needsScroll,
          }"
          v-html="message || `No alert message data...`"
        />
      </div>
    </div>
    <v-btn
      @click="$emit( 'hide' )"
      icon
      x-small
      dark
    >
      <v-icon color="black">close</v-icon>
    </v-btn>
  </v-system-bar>
</template>

<script>
  export default {
    name: 'SystemAlert',

    props: {
      message: String,
      icon: String,
      color: String,
      textColor: String,
      scroll: Boolean
    },

    data () {
      return {
        alertMounted: false,
        marqueeDuration: '30s',
        needsScroll: false,
        requestResize: false,
      }
    },

    methods: {
      onResize () {
        if ( this.requestResize ) return;
        this.requestResize = true;

        // Throttle to half second updates, on RAF
        setTimeout( () => {
          requestAnimationFrame( () => {
            this.updateProps();
            this.requestResize = false;
          });
        }, 500 );

        /*this.$nextTick( () => {
          this.updateProps();
        });*/
      },

      updateProps () {
        this.marqueeDuration = this.$refs.marquee ? `${ this.$refs.marquee.offsetWidth / 30 }s` : '30s';
        this.needsScroll     = this.$refs.marquee ? this.$refs.marquee.offsetWidth > this.$refs.marquee.parentElement.offsetWidth : false;
      },
    },

    mounted() {
      this.$nextTick( () => {
        this.alertMounted = true;
        this.updateProps();
      });
    },
  }
</script>

<style lang="scss">
  .marquee {
    width: 100%;
    max-width: 1000px;
    white-space: nowrap;
    overflow: hidden;
    box-sizing: border-box;

    a {
      font-weight: 900;
      &:hover {
        text-decoration: underline;
      }
    }

    & > * {
      display: inline-block;
      padding-left: 100%;
      animation: marquee 15s linear infinite;
    }
  }
  @keyframes marquee {
    0%   { transform: translate(0, 0); }
    100% { transform: translate(-100%, 0); }
  }
</style>
