<template>
  <v-layout
    column
    fill-height
  >
    <div
      id="tlkio"
      :data-channel="channel"
      data-theme="theme--night"
      style="width:100%;height:100%;"
    ></div>
  </v-layout>
</template>

<script>
  import axios from 'axios'

  export default {
    name: 'TlkChat',

    data() {
      return {
        channel: 'default',
      }
    },

    methods: {},

    computed: {},

    async mounted() {
      const host = process.env_production ? 'http://localhost:4000' : 'https://api.bitwave.tv';
      const { data } = await axios.get(`${host}/api/chat/channel`);
      console.log(data);
      this.channel = data.chatroom;
    },

  }
</script>
