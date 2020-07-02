<template>
    <div id="chat-graph">
      <div class="graph">
        <div class="chart-val grey--text text-weight-thin overline text-center my-2">
          {{ statName }} per {{ period }} second interval
        </div>
        <v-sparkline
          :value="values"
          :gradient="gradient"
          :smooth="radius || false"
          :padding="padding"
          :line-width="width"
          :type="type"
          stroke-linecap="round"
          gradient-direction="top"
        />
        <div class="chart-val d-flex justify-space-around white--text text-weight-thin caption text-center ma-2">
          <template v-for="( stat, index ) in dataLabels">
            <div>
              <span class="grey--text mr-1">{{ stat.label }}</span>
              <span class="body-2">{{ stat.value }}</span>
            </div>
            <v-divider
              v-if="index !== dataLabels.length - 1"
              color="orange"
              vertical
            />
          </template>
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
      values: { type: Array },
      period: { type: Number },
      statName: { type: String },
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
        total: 0,
      };
    },

    computed: {
      stats () {
        this.total += this.values[this.values.length - 1];
        return {
          value: this.values,
          min: this.values.reduce( (a, b) => Math.min(a, b) ),
          max: this.values.reduce( (a, b) => Math.max(a, b) ),
          average: this.values.reduce( (a, b) => a + b ) / this.values.length,
          current: this.values[this.values.length - 1],
          total: this.total,
        };
      },

      dataLabels () {
        const total = this.stats.total.toFixed( 1 ) > 1000
          ? `${this.stats.total/1000}k`
          : this.stats.total;

        return [
          {
            label: 'current:',
            value: this.stats.current,
          },
          {
            label: 'min:',
            value: this.stats.min,
          },
          {
            label: 'max:',
            value: this.stats.max,
          },
          {
            label: 'avg:',
            value: this.stats.average.toFixed(1),
          },
          {
            label: 'total:',
            value: total,
          },
        ];
      }
    },
  };
</script>

<style lang='scss'>
  #chat-graph {
    position: relative;
    pointer-events: none;
    z-index: 2;

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
