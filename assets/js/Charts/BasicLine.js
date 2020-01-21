// Created by xander on 1/21/2020

import { Line, mixins } from 'vue-chartjs';
const { reactiveProp } = mixins;

export default {
  extends: Line,

  mixins: [
    reactiveProp,
  ],

  props: {
    options: { type: Object },
    datasets: { type: Array },
  },

  methods: {
    create () {
      if ( !this.$data._chart ) this.renderChart( this.chartData, this.options );
    },

    update () {
      this.$data._chart.data.datasets = [...this.datasets];
      this.$data._chart.update();
    },
  },

  watch: {
    datasets ( newVal ) {
      // this.update();
    },
  },

  mounted () {
    // this.chartData is created in the mixin.
    // If you want to pass options please create a local options object
    this.create();
  },
}
