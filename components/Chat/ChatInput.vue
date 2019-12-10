<template>
  <!-- Chat Input -->
  <v-sheet class="px-2 py-2" color="black">
    <div class="d-flex">
      <v-text-field
        ref="chatmessageinput"
        :value="getMessage"
        :label="`Chat as ${username}...`"
        :loading="loading"
        color="yellow"
        autocomplete="new-chat-message"
        autocorrect="off"
        autocapitalize="off"
        spellcheck="true"
        single-line
        validate-on-blur
        outlined
        dense
        clearable
        counter="300"
        @change="value => this.setMessage( value )"
        @keyup.delete="updateMessage"
        @keyup.enter.prevent="sendMessage"
        @keyup.prevent="event => lastMessageHandler(event)"
        @cut="event => lastMessageHandler(event)"
      />
    </div>

    <div class="d-flex">
      <v-menu
        v-model="showChatSettings"
        :close-on-content-click="false"
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
        />
      </v-menu>

      <v-spacer/>

      <v-btn
        :disabled="loading"
        :light="!loading"
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
  import { Chat } from '@/store/chat';

  const ChatSettings = () => import( '@/components/Chat/ChatSettings' );

  export default {
    name: 'ChatInput',

    components: {
      ChatSettings,
    },

    props: {
      username: { type: String },
      loading: { type: Boolean },
    },

    data() {
      return {
        showChatSettings: false,
        messageBuffer: [],
        messageBufferIndex: 0,
      }
    },

    methods: {
      ...mapMutations(Chat.namespace, {
        setMessage: Chat.$mutations.setMessage,
      }),

      updateMessage ( event ) {
        this.setMessage( event.srcElement.value );
      },

      sendMessage() {
        if ( this.getMessage.length > 300 ) return;
        this.$emit( 'send' );
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
      ...mapState(Chat.namespace, {
        getMessage: Chat.$states.message,
      }),
    },
  }
</script>
