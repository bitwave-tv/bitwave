<template>
  <v-flex
    id="inner-chat"
    fill-height
  >
    <div
      id="chat-scroll"
      ref="scroller"
    >
      <chat-message
        v-for="(item, index) in messages"
        :key="index"
        :kkey="item.timestamp"
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
          class="body-2 msg"
          v-html="item.message"
        ></div>
      </chat-message>
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
    },

    data () {
      return {
        chatContainer: null,
        scrollTimeout: null,
        onScrollTimer: null,
        showFAB: false,
      }
    },

    methods: {
      addUserTag ( user ) {
        this.$emit('reply', user);
      },

      checkIfBottom () {
        if ( this.messages.length === 0 ) return true;
        const scrollTop    = this.chatContainer.scrollTop;
        const clientHeight = this.chatContainer.clientHeight; // or offsetHeight
        const scrollHeight = this.chatContainer.scrollHeight;
        return scrollTop + clientHeight >= scrollHeight - document.querySelector("#chat-scroll > div:last-child").clientHeight;
      },

      async scrollToBottom ( force ) {
        // If we are NOT at the bottom && NOT forcing scroll, bail early
        if ( !this.checkIfBottom() && !force ) {
          return;
        }

        this.showFAB = false;

        // Scroll to last message
        // After it's added to DOM
        this.$nextTick( () => {
          this.chatContainer.scroll({
            top: this.chatContainer.scrollHeight + 500,
            behavior: 'smooth',
          });

          clearTimeout( this.scrollTimeout );

          this.scrollTimeout = setTimeout( () => {
            this.chatContainer.scroll({
              top: this.chatContainer.scrollHeight + 500,
              behavior: 'smooth',
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

      onScroll ( event ) {
        if ( !this.onScrollTimer ) {
          const scrollStart = this.chatContainer.scrollTop;
          this.onScrollTimer = setTimeout( () => {
            const scrollPosition = this.chatContainer.scrollTop;

            // Scrolled up
            if ( scrollStart > scrollPosition ) {
              this.showFAB = true;
            }

            // Scrolled down
            else if ( scrollStart < scrollPosition ) {
              if ( scrollPosition + this.chatContainer.clientHeight > this.chatContainer.scrollHeight - 250 ) {
                this.showFAB = false;
              }
            }

            this.onScrollTimer = null;
          }, 200 );
        }
      },
    },

    async mounted () {
      this.chatContainer = this.$refs.scroller;
      this.chatContainer.addEventListener( 'scroll', this.onScroll, { passive: true } );
      this.$nextTick( () => this.jumpToBottom() );
    },

    beforeDestroy() {
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
    }

    .stb-fab {
      position: absolute;
      right: 0;
      left: 0;
      top: 0;

      /* Old animation for FAB
      transform: translateY(0);
      transition: .5s transform;

      &.hide {
        transform: translateY(-150%);
      }*/
    }
  }

  #chat-scroll {
    overflow-y: scroll;
    will-change: transform;
  }
</style>
