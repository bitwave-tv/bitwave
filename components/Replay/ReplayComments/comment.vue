<template>
  <div>
    <div class="d-flex align-end">
      <div class="font-weight-medium">{{ username }}</div>
      <div class="grey--text ml-2 caption" :title="timestamp">{{ humanTimestamp }}</div>
    </div>
    <div class="d-flex">{{ text }}</div>
  </div>
</template>

<script>
  import { timeAgo } from '@/assets/js/time-ago';

  export default {
    name: 'comment',

    props: {
      username: { type: String },
      timestamp: { type: Date },
      text: { type: String },
    },

    data() {
      return {

      };
    },

    methods: {

    },

    computed: {
      humanTimestamp () {
        return timeAgo( this.timestamp );
      }
    },

    mounted () {

    },
  };
</script>

<style lang='scss'>

</style>
