<template>
    <div id="chat-rate">
      <div class="graph">
        <v-sparkline
          :value="chatStats.value"
          :gradient="gradient"
          :smooth="radius || false"
          :padding="padding"
          :line-width="width"
          :stroke-linecap="lineCap"
          :gradient-direction="gradientDirection"
          :fill="fill"
          :type="type"
          :auto-line-width="autoLineWidth"
          :auto-draw="autoDraw"
        />
        <div class="chart-val white--text text-weight-thin body-1 text-center my-2">
          {{ this.stats }}
        </div>
        <!--<v-sheet tile class="mt-1" color="grey darken-4">
          <div class="chart-val white&#45;&#45;text text-weight-thin body-1 text-center">
            {{ this.stats }}
          </div>
        </v-sheet>-->
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
    ['#f72047', '#ffd200', 'blue'],
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
        radius: 10,
        padding: 0,
        lineCap: 'round',
        gradient: gradients[5],
        value: [],
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

    .graph {
      background: rgba(0,0,0,.85);
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      z-index: 3;
    }

    .chart-val {
      /*position: absolute;
      top: 0;
      left: 0;
      right: 0;*/
      z-index: 4;
    }
  }
</style>
