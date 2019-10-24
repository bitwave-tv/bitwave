<template>
  <v-flex
    id="inner-chat"
    fill-height
    style="overflow: hidden;"
  >
    <div
      id="chat-scroll"
      ref="scroller"
      style="overflow-y: scroll; will-change: transform;"
    >
      <chat-message
        v-for="item in messages"
        :key="item.timestamp"
        :username="item.username"
        :display-name="item.username"
        :user-styling="{ color: item.userColor ? item.userColor : '#9e9e9e' }"
        :channel="item.channel"
        :timestamp="getTime(item.timestamp)"
        :avatar="item.avatar"
        :color="item.color"
        @reply="addUserTag"
      >
        <div
          class="body-2"
          v-html="item.message"
        ></div>
      </chat-message>
    </div>
  </v-flex>
</template>

<script>
  import moment from 'moment'

  import ChatMessage from '@/components/Chat/ChatMessage'

  export default {
    name: 'ChatMessages',

    components: {
      ChatMessage,
    },

    props: {
      messages: { type: Array },
      showTimestamps: { type: Boolean },
    },

    data() {
      return {
        chatContainer: null,
      }
    },

    methods: {
      addUserTag ( user ) {
        this.$emit('reply', user);
      },

      checkIfBottom () {
        const scrollTop    = this.chatContainer.scrollTop;
        const clientHeight = this.chatContainer.clientHeight; // or offsetHeight
        const scrollHeight = this.chatContainer.scrollHeight;
        return scrollTop + clientHeight >= scrollHeight - document.querySelector("#chat-scroll > div:last-child").clientHeight;
      },

      async scrollToBottom ( force ) {
        // If we are NOT at the bottom && NOT forcing scroll, bail early
        if ( !this.checkIfBottom() && !force ) return;

        // Scroll to last message
        this.chatContainer.scroll({
          top: this.chatContainer.scrollHeight,
          behavior: 'smooth',
        });

        setTimeout( () => {
          this.chatContainer.scroll({
            top: this.chatContainer.scrollHeight,
            behavior: 'smooth',
          });
        }, 500 );
      },

      jumpToBottom () {
        this.chatContainer.scrollTop = this.chatContainer.scrollHeight + 750;
      },

      getTime ( timestamp ) {
        return this.showTimestamps ? `[${moment( timestamp ).format( 'HH:mm' )}]` : '';
      },

      onScroll ( event ) {
        console.log( `At Bottom: ${this.checkIfBottom()}` );
      },
    },

    computed: {},

    watch: {
      /*messages: async function () {
        // await this.scrollToBottom(true);
      },*/
    },

    async mounted () {
      this.chatContainer = this.$refs.scroller;
      // this.chatContainer.addEventListener( 'scroll', e => this.onScroll(e) );
    },
  }
</script>
