<template>
  <div id="overlay-container">
    <div id="overlay">
      <!-- Chat message -->
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
  </div>
</template>

<script>
  import { db } from '@/plugins/firebase.js';
  import socketio from 'socket.io-client';
  import moment from 'moment';

  export default {
    name: 'chat-overlay',

    layout: 'overlay',

    data() {
      return {
        debug: false,
        unsubscribeOverlay: null,
        overlayId: '',
        overlay: null,
        socket: null,
        loaded: false,
        messages: [],
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
          channel: this.overlay.channel,
          global: this.overlay.global,
          owner: this.overlay.owner,
        };

        this.loaded = true;

        this.socket.on( 'connect', () => this.socket.emit( 'new overlay', config ) );
        this.socket.on( 'hydrate',     async data => await this.hydrate( data ) );
        this.socket.on( 'bulkmessage', async data => await this.rcvMessageBulk( data ) );
      },

      hydrate ( data ) {
        this.messages = data;
        this.processMessages();
      },

      rcvMessageBulk ( data ) {
        console.log( 'messages', data );
        this.messages.push( ...data );
        this.processMessages();
      },

      processMessages () {
        if ( !this.overlay.global )
          this.messages = this.messages.filter( msg => msg.channel.toLowerCase() === this.overlay.channel.toLowerCase() );
        this.messages = this.messages.splice( -this.overlay.history );
      },

      getTime ( timestamp ) {
        return this.overlay.showTimestamps ? `[${moment( timestamp ).format( 'HH:mm' )}]` : '';
      },

      onInterval () {
        const scrollContainer = document.querySelector( '#overlay' );
        scrollContainer.scroll({
          top: scrollContainer.scrollHeight + 500,
          behavior: 'smooth',
        });
      },
    },

    computed: {

    },

    mounted () {
      this.overlayId = this.$route.params.id;
      this.subscribeToOverlay( this.overlayId );
      this.debug = !!this.$route.query.debug;
      setInterval( () => this.onInterval(), 1000 );
    },

    beforeDestroy () {
      if ( this.unsubscribeOverlay ) this.unsubscribeOverlay();
    }
  };
</script>

<style lang='scss'>
  html {
    background: black;
  }

  #overlay {
    height: 100%;
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
  }
</style>
