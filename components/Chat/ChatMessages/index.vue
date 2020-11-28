<template>
  <v-flex
    id="inner-chat"
    fill-height
  >
    <div
      id="chat-scroll"
      ref="scroller"
    >
      <!-- It is much quicker to simply directly render into chat and re-use by index -->
      <div
        :class="{ dense: highDensity }"
      >
        <!-- Skeleton placeholders (for SSR) -->
        <v-sheet
          v-if="!messages"
          v-for="i in 5"
          :key="i"
          color="grey darken-4"
          class="mx-3 mt-3 mb-3 pa-2"
        >
          <v-skeleton-loader
            ref="skeleton"
            :boilerplate="false"
            :type="`list-item-avatar, ${ i % 2 ? 'paragraph' : 'sentences' }`"
            class="d-flex"
            dark
          ></v-skeleton-loader>
        </v-sheet>

        <!-- Chat Messages -->
        <!-- :data-message-id="msg._id" -->
        <div
          v-if="messages"
          v-for="( msg, index ) in messages"
          :key="index"
          class="pb-1 pl-2 pr-1"
        >

          <!-- Chat Alert -->
          <template
            v-if="msg.type === 'alert'"
          >
            <chat-alert-message
              :amount="msg.amount"
              :color="msg.color"
              :username="msg.username"
              :message="msg.message"
            />
          </template>

          <!-- Chat Message -->
          <template
            v-else
          >
            <!-- Regular chat message -->
            <chat-message
              v-if="msg.username !== ( index && messages[ index - 1 ].username )"
              :message="msg.message"
              :badge="msg.badge"
              :username="msg.username"
              :display-name="msg.username"
              :user-styling="{ color: msg.userColor ? msg.userColor : '#9e9e9e' }"
              :route-prefix="routePrefix"
              :channel="msg.channel"
              :timestamp="getTime( msg.timestamp )"
              :avatar="msg.avatar"
              :show-avatar="showAvatars"
              :color="msg.color"
              :global="getGlobalTag( msg.global )"
              :show-channel="true"
              :label-color="$utils.normalizedCompare( channel, msg.channel ) && global ? 'blue darken-2 white--text' : null"
              @reply="addUserTag"
              @whisper="addWhisper"
              @select="onMessageClick( msg )"
              @goto="onGoto"
            ></chat-message>

            <!-- Append messages -->
            <div
              v-else
              class="msg append content"
              :class="{ 'no-avatar': !showAvatars }"
            >
              <div
                class="body-2 msg"
                v-html="msg.message"
              ></div>
            </div>
          </template>

        </div>
      </div>
    </div>

    <!-- FAB for Scroll Down -->
    <div class="stb-fab d-flex justify-center">
      <v-slide-y-reverse-transition>
        <v-btn
          v-show="showFAB"
          fab
          small
          color="accent"
          @click="scrollToBottom( true )"
          class="white--text mb-4"
        >
          <v-icon>keyboard_arrow_down</v-icon>
        </v-btn>
      </v-slide-y-reverse-transition>
    </div>

    <!-- Chat Message Menu -->
    <div>
      <v-dialog
        v-model="showChatMessageMenu"
        transition="slide-x-transition"
        :max-width="$vuetify.breakpoint.mdAndDown ? '95%' : '40%'"
      >

        <lazy-chat-message-menu
          :key="selectedChatMessage.username"
          :avatar="selectedChatMessage.avatar"
          :username="selectedChatMessage.username"
          :displayName="selectedChatMessage.displayName"
          :user-styling="{ color: selectedChatMessage.userStyling ? selectedChatMessage.userStyling : '#9e9e9e' }"
          :message="selectedChatMessage.message"
          :badge="selectedChatMessage.badge"
          :timestamp="selectedChatMessage.timestamp"
          :channel="selectedChatMessage.channel"
          :global="selectedChatMessage.global"
          :is-channel-owner="isChannelOwner"
          @close="showChatMessageMenu = false"
          @ignore="onIgnore"
          @unignore="onUnignore"
        />

      </v-dialog>
    </div>
  </v-flex>
</template>

<script>
  import moment from 'moment';

  import ChatMessage from '@/components/Chat/ChatMessages/ChatMessage'

  import { mapState } from 'vuex';
  import { Chat } from '@/store/chat';

  export default {
    name: 'ChatMessages',

    components: {
      ChatMessage,
    },

    props: {
      messages: {
        type: Array
      },
      global: {
        type: Boolean
      },
      showTimestamps: {
        type: Boolean
      },
      showAvatars: {
        type: Boolean,
        default: true,
      },
      channel: {
        type: String,
      },
      isChannelOwner: {
        type: Boolean,
        default: false,
      },
    },

    data () {
      return {
        showChatMessageMenu: false,
        selectedChatMessage: {},

        chatContainer: null,
        scrollTimeout: null,
        onScrollTimer: null,
        showFAB: false,
        scrolling: false,
        atBottom: true,

        scrollInterval: null,

        routePrefix: '',
      }
    },

    methods: {
      addUserTag ( user ) {
        this.$emit( 'reply', user );
      },

      addWhisper ( user ) {
        this.$emit( 'whisper', user );
      },

      checkIfBottom () {
        if ( !this.messages || this.messages.length === 0 || this.atBottom ) {
          return true;
        } else {
          const scrollTop    = this.chatContainer.scrollTop;
          const clientHeight = this.chatContainer.clientHeight; // or offsetHeight
          const scrollHeight = this.chatContainer.scrollHeight;
          const lastMessageHeight = this.chatContainer.lastElementChild.clientHeight;
          // const lastMessageHeight = document.querySelector("#chat-scroll > div:last-child").clientHeight;
          return scrollTop + clientHeight >= scrollHeight - lastMessageHeight;
        }
      },

      async scrollToBottom ( force ) {
        // If we are NOT at the bottom && NOT forcing scroll, bail early
        if ( !this.checkIfBottom() && !force ) return;

        // if ( this.scrolling ) return;

        this.showFAB = false;
        this.scrolling = true;

        const scrollHeight = this.chatContainer.scrollHeight + 750;

        // Scroll to last message
        // After it's added to DOM
        // requestAnimationFrame( () => {
        // this.$nextTick( () => {

        this.chatContainer.scroll({
          top: scrollHeight,
          behavior: 'smooth',
        });

        // this.scrolling = false;
        // this.atBottom = true;

        clearTimeout( this.scrollTimeout );

        this.scrollTimeout = setTimeout( () => {
            this.jumpToBottom( scrollHeight );
            this.scrolling = false;
            this.atBottom = true;
        }, 120 );
      },

      jumpToBottom ( scrollGoal ) {
        this.chatContainer.scrollTop = scrollGoal ? scrollGoal : this.chatContainer.scrollHeight + 750;
        this.atBottom = true;
      },

      getTime ( timestamp ) {
        if ( !this.showTimestamps ) return { short: null, long: null };
        return {
          short: `[${moment( timestamp ).format( 'HH:mm' )}]`,
          long: `sent: ${moment( timestamp ).format( 'YYYY.MM.DD HH:mm:ss' )}`,
        }
      },

      getGlobalTag ( global ) {
        if ( typeof global !== 'boolean' ) return null;
        // use this.global to hide for local chatters
        return `[${global ? 'G' : 'L' }]`;
      },

      onScrollUp ( scrollPosition ) {
        if ( !this.scrolling ) {
          this.showFAB  = true;
          this.atBottom = false;
        }
      },

      onScrollDown ( scrollPosition ) {
        if ( scrollPosition + this.chatContainer.clientHeight > this.chatContainer.scrollHeight - 250 ) {
          this.showFAB = false;
        }
      },

      onScroll ( event ) {
        if ( this.scrolling ) return;

        if ( !this.onScrollTimer ) {
          const scrollStart  = this.chatContainer.scrollTop;
          const scrollHStart = this.chatContainer.scrollHeight;

          this.onScrollTimer = setTimeout( () => {
            let scrollPosition    = this.chatContainer.scrollTop;
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
          }, 50 );
        }
      },

      onScrollInterval () {
        if ( !this.showFAB /*&& this.atBottom*/ ) {
          const scrollHeight = this.chatContainer.scrollHeight + 750;
          this.chatContainer.scroll({
            top: scrollHeight,
            behavior: 'smooth',
          });
        }
      },

      onMessageClick ( msg ) {
        this.showChatMessageMenu = true;
        this.selectedChatMessage = msg;
        console.log( `Selected:`, msg );
      },

      onIgnore ( username ) {
        this.$emit( 'ignore', username );
      },

      onUnignore ( username ) {
        this.$emit( 'unignore', username );
      },

      onGoto ( location ) {
        this.$router.push( location );
      },
    },

    async mounted () {
      this.chatContainer = this.$refs.scroller;
      // this.$nextTick( () => this.jumpToBottom() );
      this.chatContainer.addEventListener( 'scroll', this.onScroll, { passive: true } );

      // Properly route users
      if ( this.$route.path.startsWith( '/chat' ) ) {
        this.routePrefix =
          this.$route.path === '/chat'
            ? '/chat/'
            : '';
      } else {
        this.routePrefix = '/';
      }
    },

    computed: {
      ...mapState (Chat.namespace, {
        highDensity : Chat.$states.highDensity,
      }),
    },

    beforeDestroy () {
      this.chatContainer.removeEventListener( 'scroll', this.onScroll );
      // clearInterval( this.scrollInterval );
    }
  }
</script>

<style lang="scss">
  #inner-chat {
    position: relative;
    overflow: hidden;

    .msg {
      line-height: 1.15;

      /* Hover Chat Message */
      /*&:hover {
        background: #212121;
        !*color: #9e9e9e;*!
      }*/

      &.append .msg {
        padding-left: 40px;
      }

      &.append.no-avatar .msg {
        padding-left: 0;
      }
    }

    .stb-fab {
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      z-index: 3;
    }

    .dense .content .msg {
      h1, h2, h3 {
        font-size: .95rem;
      }

      img {
        height: 28px;
        vertical-align: middle;
      }
    }
  }

  #chat-scroll {
    overflow-y: scroll;
    /*will-change: transform;*/
  }
</style>
