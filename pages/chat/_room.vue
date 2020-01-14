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
      return {}
    },

    async asyncData ( { $axios, params, store } ) {
      const channel = params.room;
      const getChatHydration = async () => {
        try {
          const global = store.state[ChatStore.namespace][ChatStore.$states.global];
          const { data } = await $axios.get( `https://chat.bitwave.tv/v1/messages${ global ? '' : `/${channel}` }` );
          if ( data.success ) return data.data;
        } catch ( error ) {
          console.log( error );
        }
        return [];
      };

      const chatMessages = await getChatHydration();

      return {
        chatMessages,
      }
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
