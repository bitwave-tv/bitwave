<template>
  <v-layout style="position: fixed; top:0; bottom: 0; width: 100%; margin-top: 48px;">
    <chat
      dark
      :chat-channel="channel"
      :force-global="global"
      :hydration-data="chatMessages"
    />
  </v-layout>
</template>

<script>
  import Chat from '~/components/Chat/index'
  import { Chat as ChatStore } from '@/store/chat';

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

    async asyncData ( { $axios, params, store } ) {
      const channel = params.room;

      // Timeout to prevent SSR from locking up
      const timeout = process.server ? process.env.SSR_TIMEOUT : 0;

      const getChatHydration = async () => {
        try {
          const global = store.state[ChatStore.namespace][ChatStore.$states.global];
          const { data } = await $axios.getSSR( `https://chat.bitwave.tv/v1/messages${ global ? '' : `/${channel}` }`, { timeout } );
          if ( data.success ) return data.data;
        } catch ( error ) {
          console.log( error );
        }
        return [];
      };

      const chatMessages = await getChatHydration();
      // const chatMessages = null;

      return {
        chatMessages,
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
