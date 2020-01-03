<template>
  <v-flex
    id="inner-chat"
    fill-height
  >
    <div
      id="chat-scroll"
      ref="scroller"
    >
      <template v-for="(msg, index) in messages">
        <chat-message
          v-if="msg.username !== ( index && messages[ index - 1 ].username )"
          :key="index"
          :kkey="msg.timestamp"
          :username="msg.username"
          :display-name="msg.username"
          :user-styling="{ color: msg.userColor ? msg.userColor : '#9e9e9e' }"
          :channel="msg.channel"
          :timestamp="getTime( msg.timestamp )"
          :avatar="msg.avatar"
          :color="msg.color"
          :global="getGlobalTag( msg.global )"
          @reply="addUserTag"
        >
          <div
            class="body-2 msg"
            v-html="msg.message"
          ></div>
        </chat-message>

        <!-- Append messages -->
        <div
          v-else
          class="msg append pt-1 ml-3 mr-1"
        >
          <div
            class="body-2 msg"
            v-html="msg.message"
          ></div>
        </div>
      </template>
    </div>

    <!-- FAB for Scroll Down -->
    <div class="stb-fab d-flex justify-center">
      <v-slide-y-transition>
        <v-btn
          v-show="showFAB"
          fab
          small
          color="yellow"
          @click="scrollToBottom( true )"
          class="black--text mt-3"
        >
          <v-icon>keyboard_arrow_down</v-icon>
        </v-btn>
      </v-slide-y-transition>
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
      global: { type: Boolean },
    },

    data () {
      return {
        chatContainer: null,
        scrollTimeout: null,
        onScrollTimer: null,
        showFAB: false,
        scrolling: false,
      }
    },

    methods: {
      addUserTag ( user ) {
        this.$emit( 'reply', user );
      },

      checkIfBottom () {
        if ( this.messages.length === 0 ) return true;
        const scrollTop    = this.chatContainer.scrollTop;
        const clientHeight = this.chatContainer.clientHeight; // or offsetHeight
        const scrollHeight = this.chatContainer.scrollHeight;
        const lastMessageHeight = this.chatContainer.lastElementChild.clientHeight;
        // const lastMessageHeight = document.querySelector("#chat-scroll > div:last-child").clientHeight;
        return scrollTop + clientHeight >= scrollHeight - lastMessageHeight;
      },

      async scrollToBottom ( force ) {
        // If we are NOT at the bottom && NOT forcing scroll, bail early
        if ( !this.checkIfBottom() && !force ) {
          return;
        }

        this.showFAB = false;
        this.scrolling = true;

        // Scroll to last message
        // After it's added to DOM
        this.$nextTick( () => {
          this.chatContainer.scroll({
            top: this.chatContainer.scrollHeight + 500,
            behavior: 'smooth',
          });

          clearTimeout( this.scrollTimeout );

          this.scrollTimeout = setTimeout( () => {
            this.$nextTick( () => {
              /*this.chatContainer.scroll({
                top: this.chatContainer.scrollHeight + 500,
                behavior: 'smooth',
              });*/
              this.jumpToBottom();
              this.scrolling = false;
            });
          }, 500 );
        });
      },

      jumpToBottom () {
        this.chatContainer.scrollTop = this.chatContainer.scrollHeight + 750;
      },

      getTime ( timestamp ) {
        return this.showTimestamps ? `[${moment( timestamp ).format( 'HH:mm' )}]` : '';
      },

      getGlobalTag ( global ) {
        return this.global ? `[${global ? 'G' : global === false ? 'L' : 'U'}]` : '';
      },

      onScrollUp ( scrollPosition ) {
        if ( !this.scrolling ) {
          this.showFAB = true;
        } else {
          // console.log( `Scroll up detected but ignored because we are currently scrolling.` );
        }
      },

      onScrollDown ( scrollPosition ) {
        if ( scrollPosition + this.chatContainer.clientHeight > this.chatContainer.scrollHeight - 250 ) {
          this.showFAB = false;
        }
      },

      onScroll ( event ) {
        if ( !this.onScrollTimer ) {
          const scrollStart  = this.chatContainer.scrollTop;
          const scrollHStart = this.chatContainer.scrollHeight;
          this.onScrollTimer = setTimeout( () => {
            let scrollPosition  = this.chatContainer.scrollTop;
            const scrollHPosition = this.chatContainer.scrollHeight;

            const scrollHDiff = scrollHPosition - scrollHStart;

            // console.log( `${scrollHStart}|${scrollHPosition} Diff: ${scrollHDiff}` );

            // Account for changes in scroll height
            scrollPosition -= scrollHDiff;

            // Scrolled up
            if ( scrollStart > scrollPosition ) {
              // console.log( `UP: ${scrollStart} - ${scrollPosition} Diff: ${scrollPosition - scrollStart}` );
              this.onScrollUp();
            }

            // Scrolled down
            else if ( scrollStart <= scrollPosition ) {
              // console.log( `DOWN: ${scrollStart} - ${scrollPosition} Diff: ${scrollPosition - scrollStart}` );
              this.onScrollDown( scrollPosition );
            }

            this.onScrollTimer = null;
          }, 250 );
        }
      },
    },

    async mounted () {
      this.chatContainer = this.$refs.scroller;
      this.chatContainer.addEventListener( 'scroll', this.onScroll, { passive: true } );
      this.$nextTick( () => this.jumpToBottom() );
    },

    beforeDestroy () {
      this.chatContainer.removeEventListener( 'scroll', this.onScroll );
    }
  }
</script>

<style lang="scss">
  #inner-chat {
    position: relative;
    overflow: hidden;

    .msg {
      line-height: 1.5;

      &.append {
        padding-left: 40px;
      }
    }

    .stb-fab {
      position: absolute;
      right: 0;
      left: 0;
      top: 0;
      z-index: 3;
    }
  }

  #chat-scroll {
    overflow-y: scroll;
    will-change: transform;
  }
</style>
