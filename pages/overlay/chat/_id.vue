<template>
  <div
    id="overlay-container"
    class="fill-height"
    ref="container"
  >

    <!-- Loading Spinner -->
    <v-fade-transition>
      <div
        v-if="!loaded"
        class="d-flex align-center justify-center mt-5 fill-height"
      >
        <v-progress-circular
          color="yellow"
          class="circular mr-3"
          indeterminate
          :size="50"
          :width="5"
        ></v-progress-circular>
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
        ref="overlay"
      >
        <!-- Chat message -->
        <transition-group name="fade-transition">
          <v-sheet
            v-for="message in messages"
            :key="message.timestamp"
            class="my-1 pa-1 msg"
            color="transparent"
          >
            <div class="d-flex">
              <!-- Chat Avatar -->
              <div class="v-avatar mr-2 mt-2">
                <img v-if="!!message.avatar" :src="message.avatar" :alt="message.username">
                <div v-else class="v-icon notranslate material-icons" :style="{ background: message.color }">person</div>
              </div>
              <div class="flex-grow-1">
                <!-- Message Header -->
                <div class="d-flex align-center">
                  <!-- Timestamp & Username -->
                  <div class="flex-grow-1 subtitle-2">
                    <span class="time">{{ getTime(message.timestamp) }}</span>
                    <span class="username" :style="{ color: message.userColor ? message.userColor : '#9e9e9e' }" v-html="message.username"></span>
                  </div>
                  <!-- Room Label -->
                  <div class="flex-shrink-1">
                    <nuxt-link :to="message.channel">
                      <kbd>{{ message.channel }}</kbd>
                    </nuxt-link>
                  </div>
                </div>
                <div v-html="message.message"></div>
              </div>
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

  export default {
    name: 'chat-overlay',

    layout: 'overlay',

    data () {
      return {
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
        this.overlay.created = this.overlay.created.toDate();
        this.overlay.edited = this.overlay.edited.toDate();
        console.log ( 'overlay config', this.overlay );
        this.connectChat();
      },

      connectChat () {
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

      hydrate ( data ) {
        // Highlight username tags in new messages
        const pattern = new RegExp( `@${this.overlay._username}\\b`, 'gi' );
        data.forEach( el => {
          el.message = el.message.replace( pattern, `<span class="highlight">$&</span>` );
          this.messages.push( el );
        });

        this.processMessages();
        this.loaded = true;
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
        return this.overlay.showTimestamps ? `[${moment( timestamp ).format( 'HH:mm' )}]` : '';
      },

      onInterval () {
        this.scrollContainer.scroll({
          top: this.scrollContainer.scrollHeight + 500,
          behavior: 'smooth',
        });
      },
    },

    computed: {

    },

    mounted () {
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
    overflow-y: hidden;

    .msg {
      word-break: break-word;
      max-height: 20rem;
      overflow: hidden;

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
