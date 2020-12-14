<template>
  <div
    id="overlay-container"
    class="fill-height"
    ref="container"
    :style="cssProps"
  >

    <!-- Loading Spinner -->
    <v-fade-transition>
      <div
        v-if="!loaded"
        class="d-flex align-center justify-center mt-5 fill-height"
      >
        <v-progress-circular
          color="primary"
          class="circular mr-3"
          indeterminate
          :size="50"
          :width="5"
        />
        <div class="display-1">
          Connecting to Chat...
        </div>
      </div>
    </v-fade-transition>

    <!-- Scroll Container -->
    <v-fade-transition>
      <div
        v-if="loaded"
        id="overlay"
        class="py-2"
        ref="overlay"
      >
        <!-- Chat message -->
        <transition-group name="fade-transition">
          <v-sheet
            v-for="( message, index ) in messages"
            :key="message._id"
            class="mx-1 msg"
            color="transparent"
          >

            <!-- Chat Message -->
            <chat-message
              v-if="message.username !== ( index && messages[ index - 1 ].username )"
              :message="message.message"
              :key="message._id"
              :username="message.username"
              :display-name="message.username"
              :user-styling="{ color: message.userColor ? message.userColor : '#9e9e9e' }"
              :channel="message.channel"
              :timestamp="getTime( message.timestamp )"
              :avatar="message.avatar"
              :show-avatar="overlay.showAvatars"
              :color="message.color"
              :global="getGlobalTag( message.global )"
              :show-channel="false"
              @reply=""
              @whisper=""
              @select=""
            ></chat-message>

            <!-- Append messages -->
            <div
              v-else
              class="msg append"
              :class="{ 'no-avatar': !overlay.showAvatars }"
              :key="message._id"
            >
              <div
                class="body-2 msg"
                v-html="message.message"
              ></div>
            </div>

          </v-sheet>
        </transition-group>

        <!-- Debug Info -->
        <div v-if="debug">
          <h1 class="title">[DEBUG] OBS Chat Overlay</h1>
          <div>Overlay ID: {{ overlayId }}</div>
          <div>Debug: {{ debug }}</div>
          <div
            v-for="(value, prop) in overlay"
            :key="prop"
          >
            {{ `${prop}: ${value}` }}
          </div>
        </div>
      </div>
    </v-fade-transition>
  </div>
</template>

<script>
  import { db } from '@/plugins/firebase.js';
  import socketio from 'socket.io-client';
  import moment from 'moment';

  import ChatMessage from '@/components/Chat/ChatMessages/ChatMessage'

  export default {
    name: 'chat-overlay',

    components: {
      ChatMessage,
    },

    layout: 'overlay',

    data () {
      return {
        global: false,
        channel: null,
        debug: false,
        unsubscribeOverlay: null,
        scrollInterval: null,
        overlayId: '',
        overlay: null,
        socket: null,
        loaded: false,
        messages: [],
        scrollContainer: null,
      };
    },

    methods: {
      subscribeToOverlay ( id ) {
        const overlayRef = db.collection( 'overlays' ).doc( id );
        this.unsubscribeOverlay = overlayRef.onSnapshot( doc => this.onOverlayChange( doc ) );
      },

      onOverlayChange ( doc ) {
        this.overlay = doc.data();

        this.global  = this.overlay.global;
        this.channel = this.overlay.channel;
        this.showTimestamps = this.overlay.showTimestamps;

        this.overlay.created = this.overlay.created.toDate();
        this.overlay.edited = this.overlay.edited.toDate();

        this.overlay.showAvatars = this.overlay.hasOwnProperty( 'showAvatars' ) ? this.overlay.showAvatars : true;

        console.log ( 'overlay config:', this.overlay );
        this.connectChat();
      },

      connectChat () {
        this.$nextTick( async () => await this.httpHydrate() );

        if ( this.socket ) this.socket.disconnect();
        this.socket = socketio( 'chat.bitwave.tv', { transports: [ 'websocket' ] } );

        const config = {
          id: this.overlayId,
          channel : this.overlay.channel,
          global  : this.overlay.global,
          owner   : this.overlay.owner,
        };

        this.socket.on( 'connect', () => this.socket.emit( 'new overlay', config ) );
        this.socket.on( 'hydrate',     async data => await this.hydrate( data ) );
        this.socket.on( 'bulkmessage', async data => await this.rcvMessageBulk( data ) );
      },

      async httpHydrate () {
        // Timeout to prevent SSR from locking up
        const timeout = process.server ? process.env.SSR_TIMEOUT : 0;

        const getChatHydration = async ( channel, global ) => {
          try {
            if ( global === null ) return null;
            const { data } = await this.$axios.getSSR( `https://chat.bitwave.tv/v1/messages${ global ? '' : `/${channel}` }`, { timeout } );
            if ( data && data.success ) return data.data;
            return [];
          } catch ( error ) {
            console.error( `Chat hydration request failed` );
            console.error( error.message );
          }
          return null;
        };

        try {
          const chatMessages = await getChatHydration( this.channel, this.global );
          if ( chatMessages ) await this.hydrate( chatMessages );
        } catch ( error ) {
          console.log( error );
        }
      },

      hydrate ( data ) {
        if ( !this.overlay ) return;

        // Highlight username tags in new messages
        const pattern = new RegExp( `@${this.overlay._username}\\b`, 'gi' );
        data.forEach( el => {
          el.message = el.message.replace( pattern, `<span class="highlight">$&</span>` );
          this.messages.push( el );
        });

        this.processMessages();

        this.loaded = true;

        console.log( `Loaded: ${this.loaded}` );

        this.$nextTick( () =>
          this.scrollContainer.scroll({
            top: this.scrollContainer.scrollHeight + 500,
            behavior: 'auto',
          })
        );
        this.scrollInterval = setInterval( () => this.onInterval(), 1000 );
      },

      rcvMessageBulk ( data ) {
        // Highlight username tags in new messages
        const pattern = new RegExp( `@${this.overlay._username}\\b`, 'gi' );
        data.forEach( el => {
          el.message = el.message.replace( pattern, `<span class="highlight">$&</span>` );
          this.messages.push( el );
        });

        this.processMessages();
      },

      processMessages () {
        // Global / Local Filter
        if ( !this.overlay.global ) {
          this.messages = this.messages.filter( msg => msg.channel.toLowerCase() === this.overlay.channel.toLowerCase() );
        }

        // Trim history
        this.messages = this.messages.splice( -this.overlay.history );

        // Jump down
        this.scrollContainer.scroll({
          top: this.scrollContainer.scrollHeight,
          behavior: 'auto',
        });
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

      onInterval () {
        this.scrollContainer.scroll({
          top: this.scrollContainer.scrollHeight + 500,
          behavior: 'smooth',
        });
      },
    },

    computed: {
      cssProps() {
        if ( !this.overlay ) return {
          '--bg-color': 'transparent',
        };

        const colors = this.overlay.hasOwnProperty( 'colors' )
          ? this.overlay.colors
          : ({ background: 'transparent' });

        return {
          '--bg-color': colors.background,
        }
      },
    },

    async mounted () {
      this.overlayId = this.$route.params.id;
      this.debug = !!this.$route.query.debug;
      this.scrollContainer = document.querySelector( '#overlay' );
      // this.scrollContainer = this.$refs['overlay']; // container
      this.subscribeToOverlay( this.overlayId );
    },

    beforeDestroy () {
      if ( this.unsubscribeOverlay ) this.unsubscribeOverlay();
      if ( this.scrollInterval ) clearInterval( this.scrollInterval );
    }
  };
</script>

<style lang='scss'>
  #overlay {
    background-color: var(--bg-color);

    overflow-y: hidden;

    .msg {
      word-break: break-word;
      max-height: 15rem;
      overflow: hidden;

      &.append .msg {
        padding-left: 40px;
      }

      &.append.no-avatar .msg {
        padding-left: 0;
      }

      p {
        margin: 0;

        img {
          height: 28px;
          vertical-align: middle;
        }
      }

      kbd {
        background-color: #607D8B99;
        font-size: 10px;
        user-select: none;
        text-overflow: ellipsis;
        white-space: nowrap;
        overflow: hidden;
        max-width: 75px;
      }

      blockquote p {
        font-weight: 500;
        color: #789922;
      }

      .time {
        user-select: none;
        color: #757575;
      }

      .username {
        font-weight: 500;
        color: #9e9e9e;
        font-family: 'IBM Plex Sans', sans-serif;
      }

      .highlight {
        font-weight: bold;
        color: yellow;
      }
    }

    .v-avatar {
      cursor: pointer;
      user-select: none;

      align-items: center;
      border-radius: 50%;
      display: inline-flex;
      justify-content: center;
      line-height: normal;
      position: relative;
      text-align: center;
      vertical-align: middle;

      height: 32px;
      min-width: 32px;
      width: 32px;
    }

    .fade-transition-enter-active,
    .fade-transition-leave-active {
      transition-duration: 1.5s;
    }
  }
</style>
