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
        channel: 'bitwave',
      }
    },

    methods: {},

    computed: {
      username () {
        const id = [...Array(4)].map(() => (~~(Math.random()*36)).toString(36)).join('');
        if (!this.user || !this.user.displayName) return `TROLL:${id}`;
        return this.user.displayName;
      },
    },

    async mounted() {
      try {
        // const host = process.env_production ? 'http://localhost:4000' : 'https://api.bitwave.tv';
        const host = 'https://api.bitwave.tv';
        const { data } = await axios.get(`${host}/api/chat/channel`);
        console.log(data);
        this.channel = data.chatroom;
      } catch (error) {
        console.error('ERROR: Failed to retrieve chat location.');
        console.error(error);
      }
    },

    created() {
      //auth.onAuthStateChanged( async user => await this.authenticated(user) );
    },

    beforeDestroy() {
      //if (this.unsubscribeUser) this.unsubscribeUser();
    },

  }
</script>
