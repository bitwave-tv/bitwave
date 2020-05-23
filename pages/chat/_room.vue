<template>
  <v-layout style="position: fixed; top:0; bottom: 0; width: 100%; margin-top: 48px;">
    <chat
      dark
      :chat-channel="channel"
      :force-global="global"
    />
  </v-layout>
</template>

<script>
  import Chat from '~/components/Chat/Chat'

  export default {
    name: 'chat-room',

    layout: 'barebones',

    components: {
      Chat,
    },

    data() {
      return {
        chatMessages: null,
      }
    },

    validate ( { params } ) {
      // Verify username is valid
      const user = params.room;
      const validator = /^[a-zA-Z0-9._-]+$/;
      return validator.test( user );
    },

    computed: {
      channel () {
        return this.$route.params.room;
      },

      global () {
        return !!this.$route.query.global;
      },
    },

    mounted() {
      console.debug( 'mounted chatroom.' );
    }
  }
</script>
