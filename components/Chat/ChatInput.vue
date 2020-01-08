<template>
  <!-- Chat Input -->
  <v-sheet
    class="px-2 py-2"
    color="black"
    :style="{ position: 'relative', }"
  >

    <!-- Text Input Field -->
    <div class="d-flex">
      <v-text-field
        ref="chatmessageinput"
        :value="getMessage"
        :label="`Chat as ${username}...`"
        :loading="loading"
        :disabled="loading"
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
        @keydown.tab.prevent="event => onTab(event)"
        @keydown.down="event => onArrow(event)"
        @keydown.up="event => onArrow(event)"
      />
    </div>

    <!-- Bottom Buttons -->
    <div class="d-flex align-center">
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
            icon
          >
            <v-icon>settings</v-icon>
          </v-btn>
        </template>
        <chat-settings
          @close="showChatSettings = false"
        />
      </v-menu>

      <v-btn
        v-if="false"
        class="ml-1"
        small
        icon
      >
        <v-icon>monetization_on</v-icon>
      </v-btn>

      <v-spacer />

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

    <!-- Popup -->
    <autocomplete-username
      v-if="autocomplete"
      :filter="autocompleteFilter"
      :index="autocompleteSelection"
      @update:index="val => this.autocompleteSelection = val"
      @update:value="val => this.autocompleteValue = val"
      @click="onTab"
    />

  </v-sheet>
</template>

<script>
  import { mapState, mapMutations } from 'vuex'
  import { Chat } from '@/store/chat';

  const ChatSettings = () => import( '@/components/Chat/ChatSettings' );
  import AutocompleteUsername from '@/components/Chat/AutocompleteUsername';

  export default {
    name: 'ChatInput',

    components: {
      ChatSettings,
      AutocompleteUsername,
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
        showUsernameSuggestions: false,

        autocompleteSelection: 0,
        autocompleteValue: null,
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
        if ( this.autocomplete ) this.onTab();
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


        // Detect keystrokes that trigger autocomplete
        if ( event.key === '@' || this.autocomplete ) {
          if ( event.key === '@' ) this.autocompleteSelection = 0;
          this.setMessage( event.srcElement.value );
        }

        if ( event.type === 'cut' ) {
          setTimeout( () => {
            if ( !event.srcElement.value ) {
              this.setMessage( '' );
            }
          }, 20 );
        }
      },

      onArrow ( event ) {
        if ( !this.autocomplete ) return;

        event.preventDefault();

        if ( event.key === 'ArrowUp' )   this.autocompleteSelection -= 1;
        if ( event.key === 'ArrowDown' ) this.autocompleteSelection += 1;
      },

      onTab ( event ) {
        if ( !this.autocomplete || !this.autocompleteValue ) return;
        if ( event ) {
          const msg = event.srcElement.value.replace( this.autocomplete[0], `@${ this.autocompleteValue.data.username } ` );
          this.setMessage( msg );
        } else {
          const msg = this.getMessage.replace( this.autocomplete[0], `@${ this.autocompleteValue.data.username } ` );
          this.setMessage( msg );
        }
      },
    },

    computed: {
      ...mapState(Chat.namespace, {
        getMessage: Chat.$states.message,
      }),

      autocomplete () {
        return this.getMessage && this.getMessage.match( /@[\w:]*$/g );
      },

      autocompleteFilter () {
        return this.autocomplete
          ? this.autocomplete[0].substr(1)
          : '';
      },
    },
  }
</script>
