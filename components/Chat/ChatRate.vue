<template>
    <div id="chat-rate">
      <div class="graph">
        <div class="chart-val grey--text text-weight-thin overline text-center my-2">
          messages per 10 second interval
        </div>
        <v-sparkline
          :value="chatStats.value"
          :gradient="gradient"
          :smooth="radius || false"
          :padding="padding"
          :line-width="width"
          :stroke-linecap="lineCap"
          :gradient-direction="gradientDirection"
          :type="type"
          :auto-line-width="autoLineWidth"
          :auto-draw="autoDraw"
        />
        <div class="chart-val white--text text-weight-thin body-1 text-center my-2">
          {{ this.stats }}
        </div>
      </div>
    </div>
</template>

<script>
  const gradients = [
    ['#222'],
    ['#42b3f4'],
    ['red', 'orange', 'yellow'],
    ['purple', 'violet'],
    ['#00c6ff', '#F0F', '#FF0'],
    ['#f72047', 'orange', '#ffd200', '#03a9f4', 'blue'],
  ];

  export default {
    name: 'ChatRate',

    props: {
      messageCount: { type: Number },
      chatStats: { type: Object },
    },

    data() {
      return {
        width: 2,
        radius: 5,
        padding: 5,
        lineCap: 'round',
        gradient: gradients[5],
        gradientDirection: 'top',
        gradients,
        fill: false,
        type: 'trend',
        autoLineWidth: false,
        autoDraw: false,
      };
    },

    methods: {},

    computed: {
      stats () {
        const total = this.chatStats.total > 1000
          ? `${this.chatStats.total/1000}k`
          : this.chatStats.total;

        return `Current: ${this.chatStats.current} / Min: ${this.chatStats.min} / Max: ${this.chatStats.max} / Avg: ${this.chatStats.average.toFixed(1)} / Total: ${total}`;
      }
    },

  };
</script>

<style lang='scss'>
  #chat-rate {
    position: relative;
    pointer-events: none;

    .graph {
      background: rgba(0,0,0,.85);
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      z-index: 2;
    }

    .chart-val {
      z-index: 2;
    }
  }
</style>
