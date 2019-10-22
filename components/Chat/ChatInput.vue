<template>
  <!-- Chat Input -->
  <v-sheet class="px-2 py-2" color="black">
    <div class="d-flex pb-2">
      <v-text-field
        ref="chatmessageinput"
        :value="getMessage"
        :label="`Chat as ${username}...`"
        color="yellow"
        autocomplete="off"
        autocorrect="off"
        autocapitalize="off"
        spellcheck="true"
        single-line
        hide-details
        validate-on-blur
        outlined
        dense
        :rules="[ value => value.length <= 300 || 'Max 300 characters' ]"
        @input="value => this.setMessage( value )"
        @keyup.enter.prevent="sendMessage"
        @keyup.prevent="event => lastMessageHandler(event)"
        @cut="event => lastMessageHandler(event)"
      ></v-text-field>
    </div>

    <div class="d-flex">
      <v-menu
        v-model="showChatSettings"
        :close-on-content-click="false"
        :close-on-click="false"
        transition="slide-x-transition"
        :max-width="320"
        top
        right
        offset-y
      >
        <template #activator="{ on }">
          <v-btn
            v-on="on"
            small
            text
            icon
          >
            <v-icon>settings</v-icon>
          </v-btn>
        </template>
        <chat-settings
          @close="showChatSettings = false"
        ></chat-settings>
      </v-menu>

      <v-spacer/>

      <v-btn
        small
        color="yellow black--text"
        class="px-2"
        @click="sendMessage"
      >
        send
        <v-icon small>send</v-icon>
      </v-btn>
    </div>

  </v-sheet>
</template>

<script>
  import { mapState, mapMutations } from 'vuex'

  import ChatSettings from '@/components/Chat/ChatSettings'

  export default {
    name: 'ChatInput',

    components: {
      ChatSettings,
    },

    props: {
      username: { type: String },
    },

    data() {
      return {
        showChatSettings: false,
        messageBuffer: [],
        messageBufferIndex: 0,
      }
    },

    methods: {
      ...mapMutations( 'chat', {
        setMessage: 'SET_CHAT_MESSAGE',
      }),

      sendMessage() {
        this.$emit( 'send', this.message );
        this.messageBuffer.push(this.getMessage);
        this.messageBuffer = this.messageBuffer.splice(-10);
        this.messageBufferIndex = this.messageBuffer.length;
        this.setMessage( '' );
      },

      lastMessageHandler ( event ) {
        if ( !event.srcElement.value || event.srcElement.value === this.messageBuffer[ this.messageBufferIndex ] ) {
          // Up Arrow (keyCode 38)
          if ( event.key === 'ArrowUp' ) {
            this.messageBufferIndex -= ( this.messageBufferIndex > 0 ) ? 1 : 0;
            this.setMessage( this.messageBuffer[ this.messageBufferIndex ] );
            event.preventDefault();
          }
          // Down Arrow (keyCode 40)
          else if ( event.key === 'ArrowDown' ) {
            this.messageBufferIndex += ( this.messageBufferIndex < this.messageBuffer.length ) ? 1 : 0;
            if ( this.messageBufferIndex === this.messageBuffer.length ) this.setMessage( '' );
            else this.setMessage( this.messageBuffer[ this.messageBufferIndex ] );
            event.preventDefault();
          }
          // Idk why this is needed
          else {
            // this.message = '';
          }
        }

        if ( event.type === 'cut' ) {
          setTimeout( () => {
            if ( !event.srcElement.value ) {
              this.setMessage( '' );
            }
          }, 20 );
        }
      },
    },

    computed: {
      ...mapState( 'chat', {
        getMessage: 'message',
      }),
    },
  }
</script>
