// Created by xander on 1/21/2020

import { Line, mixins } from 'vue-chartjs';
const { reactiveProp } = mixins;

export default {
  extends: Line,

  mixins: [
    // reactiveProp,
  ],

  props: {
    options: { type: Object },
    points: { type: Array },
  },

  methods: {
    create () {
      this.renderChart( this.chartData, this.options );
    },

    update () {
      this.$data._chart.data.datasets[ 0 ].data = this.points;
      this.$data._chart.data.labels = new Array(this.points.length).fill(0).map( (v, i ) => i);
      this.$data._chart.update();
    },
  },

  watch: {
    points ( newVal ) {
      this.update();
    },
  },

  mounted () {
    // this.chartData is created in the mixin.
    // If you want to pass options please create a local options object

    this.chartData = {
      labels: new Array(120).fill(0).map( (v, i ) => i),

      datasets: [
        {
          label: 'Data Set Name',
          borderColor: 'blue',
          // pointRadius: 0,
          pointBorderWidth: 0,
          pointStyle: 'line',
          cubicInterpolationMode: 'monotone',
          data: [ 0 ],
        },
      ],
    };

    this.create();

  },
}
