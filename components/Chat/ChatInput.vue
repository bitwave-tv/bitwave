<template>
  <!-- Chat Input -->
  <v-sheet
    id="chat-input"
    class="pa-2"
    color="black"
  >

    <!-- Text Input Field -->
    <div class="d-flex">
      <v-text-field
        ref="chatmessageinput"
        :value="getMessage"
        :label="`Chat ${global ? 'globally' : ''} as ${username}...`"
        :loading="loading"
        :disabled="loading"
        color="primary"
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
        @change="value => this.setChatMessage( value )"
        @keyup.delete="updateMessage"
        @keyup.enter.prevent="sendMessage"
        @keyup.prevent="event => lastMessageHandler( event )"
        @cut="event => lastMessageHandler( event )"
        @keydown="onDetectAutocomplete"
        @click:clear="setChatMessage( '' )"
        @keydown.tab.prevent="event => onTab( event )"
        @keydown.down="event => onArrow( event )"
        @keydown.up="event => onArrow( event )"
        @drop="onDrop"
      />
    </div>

    <!-- Bottom Buttons -->
    <div class="d-flex align-center">
      <!-- Chat Settings -->
      <chat-settings/>

      <!-- Chat Coin -->
      <v-menu
        v-if="true"
        v-model="showChatCoins"
        :close-on-content-click="false"
        transition="slide-y-reverse-transition"
        :max-width="320"
        top
        right
        offset-y
      >
        <template #activator="{ on }">
          <v-btn
            v-on="on"
            class="ml-2"
            small
            icon
          >
            <v-icon>attach_money</v-icon>
          </v-btn>
        </template>

        <chat-coin
          @close="showChatCoins = false"
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

      <v-spacer/>

      <v-btn
        :disabled="loading"
        :light="!loading"
        small
        color="primary black--text"
        class="px-2"
        @click="sendMessage"
      >
        send
        <v-icon small>send</v-icon>
      </v-btn>
    </div>

    <!-- Popup -->
      <autocomplete-chat
        v-if="autocomplete && enableAutocomplete"
        :data="autocompleteData"
        :filter="autocompleteFilter"
        :index="autocompleteSelection"
        :size="acSize"
        @update:index="val => this.autocompleteSelection = val"
        @update:value="val => this.autocompleteValue = val"
        @click="onTab"
      />

  </v-sheet>
</template>

<script>
  import { mapState, mapGetters, mapMutations, mapActions } from 'vuex';
  import { VStore } from '@/store';
  import { Chat } from '@/store/chat';

  const ChatSettings = async () => await import( '@/components/Chat/ChatSettings' );
  const ChatCoin     = async () => await import ( '@/components/Payment/ChatCoin' );

  import AutocompleteChat from '@/components/Chat/AutocompleteChat';

  const commands = [
    {
      label: 'ignore',
      value: '/ignore @',
    },
    {
      label: 'ignore channel',
      value: '/ignorechannel ',
    },
    {
      label: 'unignore',
      value: '/unignore @',
    },
    {
      label: 'unignore channel',
      value: '/unignorechannel ',
    },
    {
      label: 'whisper',
      value: '/w @',
    },
    {
      label: 'ignorelist',
      value: '/ignorelist ',
    },
    {
      label: 'local',
      value: '/local ',
    },
    {
      label: 'global',
      value: '/global ',
    },
    {
      label: 'cleantts',
      value: '/cleantts ',
    },
    {
      label: 'Viewer Stats',
      value: '/views ',
    },
    {
      label: 'Message Stats',
      value: '/stats ',
    },
    {
      label: 'Toggle User Badge (if available)',
      value: '/badge ',
    },
    {
      label: 'Bug Report',
      value: '/bugreport ',
    },
  ];

  export default {
    name: 'ChatInput',

    components: {
      ChatCoin,
      ChatSettings,
      AutocompleteChat,
    },

    props: {
      username: { type: String },
      loading: { type: Boolean },
    },

    data() {
      return {
        showChatCoins: false,

        messageBufferIndex: 0,
        showUsernameSuggestions: false,

        autocomplete: null,
        autocompleteData: [],
        autocompleteSelection: 0,
        autocompleteValue: null,
        acSize: 5,
      }
    },

    fetchOnServer: false,
    async fetch() {
      await this.updateEmoteListInStore();
    },

    methods: {
      ...mapMutations(Chat.namespace, {
        setMessage: Chat.$mutations.setMessage,
        addToMessageBuffer : Chat.$mutations.addToMessageBuffer,
      }),

      ...mapActions(Chat.namespace, {
        updateEmoteListInStore: Chat.$actions.updateEmoteList,
      }),

      updateMessage ( event ) {
        this.setChatMessage( event.srcElement.value );
      },

      sendMessage ( event ) {
        // Insert new line when shift-enter is pressed
        if ( event.shiftKey ) {
          // Insert at cursor selection
          const msg =
            this.getMessage.substring( 0, event.target.selectionStart )
            + '\\n'
            + this.getMessage.substring( event.target.selectionEnd, this.getMessage.length );

          const position = event.target.selectionStart + 2;

          this.setChatMessage( msg );

          // Reset cursor position after insertion
          this.$nextTick( () => event.target.setSelectionRange( position, position ) );

          return;
        }

        // Don't send a message if auto completing
        if ( this.autocomplete ) {
          // Add exception for instances where we have no match or an exact match.
          const send = !this.autocompleteValue || this.autocomplete[0].toLowerCase() === this.autocompleteValue.value.trim().toLowerCase();
          if ( !send ) return this.onTab();
        }

        if ( this.getMessage.length > 300 ) return;
        if ( this.autocomplete ) this.onTab();

        this.$emit( 'send' );

        this.addToMessageBuffer( this.getMessage );
        this.messageBufferIndex = this.getMessageBuffer.length;

        this.setChatMessage( '' );
      },

      lastMessageHandler ( event ) {
        if ( !event.srcElement.value || event.srcElement.value === this.getMessageBuffer[ this.messageBufferIndex ] ) {
          // Up Arrow (keyCode 38)
          if ( event.key === 'ArrowUp' ) {
            this.messageBufferIndex -= ( this.messageBufferIndex > 0 ) ? 1 : 0;
            this.setMessage( this.getMessageBuffer[ this.messageBufferIndex ] );
            event.preventDefault();
          }
          // Down Arrow (keyCode 40)
          else if ( event.key === 'ArrowDown' ) {
            this.messageBufferIndex += ( this.messageBufferIndex < this.getMessageBuffer.length ) ? 1 : 0;
            if ( this.messageBufferIndex === this.getMessageBuffer.length ) this.setMessage( '' );
            else this.setMessage( this.getMessageBuffer[ this.messageBufferIndex ] );
            event.preventDefault();
          }
        }

        if ( event.type === 'cut' ) {
          setTimeout( () => {
            if ( !event.srcElement.value ) {
              this.setChatMessage( '' );
            }
          }, 20 );
        }

        // Detect keystrokes that trigger autocomplete
        if ( this.autocomplete ) this.setChatMessage( event.srcElement.value );
      },

      onArrow ( event ) {
        if ( !this.autocomplete ) return;

        event.preventDefault();

        if ( event.key === 'ArrowUp' )   this.autocompleteSelection -= 1;
        if ( event.key === 'ArrowDown' ) this.autocompleteSelection += 1;
      },

      onDetectAutocomplete ( event ) {
        // Detect keystrokes that trigger autocomplete
        if ( event.key === '@' || event.key === '/' || event.key === ':' ) {
          // ['@','/',':'].includes( event.key )
          this.autocompleteSelection = 0;
          this.autocomplete = event.key;
        }
      },

      onTab ( event ) {
        if ( !this.autocomplete || !this.autocompleteValue ) return;
        if ( event ) {
          const msg = event.srcElement.value.replace( new RegExp( this.autocomplete[0] + '$' ), this.autocompleteValue.value );
          this.setChatMessage( msg );
        } else {
          const msg = this.getMessage.replace( new RegExp( this.autocomplete[0] + '$' ), this.autocompleteValue.value );
          this.setChatMessage( msg );
        }
      },

      setChatMessage ( msg ) {
        this.setMessage( msg );
        this.autocomplete = this.enableAutocomplete && this.detectAutocomplete();
      },

      appendToChatMessage ( msg ) {
        const currentMessage = this.getMessage;
        this.setChatMessage( currentMessage + (currentMessage === '' ? '' : ' ') + msg );
      },

      detectAutocomplete () {
        if ( !this.getMessage ) return;

        const usernameMatch = this.getMessage.match( /@[\w:-_]*$/g );
        if ( usernameMatch ) {
          this.autocompleteData = this.userlist;
          this.acSize = 5;
          return usernameMatch;
        }

        const commandMatch = this.getMessage.match( /^\/[\w:-_]*$/g );
        if ( commandMatch ) {
          this.autocompleteData = commands;
          this.acSize = 5;
          return commandMatch;
        }

        // Remove all existing emotes so we can end early
        const emoteMatch = this.getMessage
          .replace( /:\w+:/gi, '' )
          .match( /:[\w]*$/g );

        if ( emoteMatch ) {
          this.autocompleteData = this.emoteList;
          this.acSize = 5;
          return emoteMatch;
        }
      },

      updateEmoteList() {
        this.updateEmoteListInStore();

        if( this.emoteList && this.emoteLinkMap && this.emoteLinkMap.size === this.emoteList.length ) {
          console.log( 'Skipping emoteList update.' );
          return;
        }

        if( !this.emoteLinkMap ) {
          this.emoteLinkMap = new Map();
        }

        for( const emote of this.emoteList ) {
          this.emoteLinkMap.set( emote.image, emote.value );
        }
      },

      async onDrop( event ) {
        if( !this.emoteLinkMap || this.emoteLinkMap.size < 1 ) {
          await this.updateEmoteList();
        }

        const droppedText = event.dataTransfer.getData( "text/plain" );
        const isEmoteLink = droppedText.startsWith( "https://cdn.bitwave.tv/static/emotes/" )
                         || droppedText.startsWith( "https://cdn.bitwave.tv/uploads/" );
        if( isEmoteLink ) {
          const emoteLink = droppedText.replace( /\?[0-9]*$/g, '' );
          const emote = this.emoteLinkMap.get( emoteLink );

          event.preventDefault();

          // In case the emote isn't found, ensure the link is pasted
          if( emote ) { this.appendToMessage( emote ); }
          else { this.appendToMessage( emoteLink ); }
        }
      },
    },

    computed: {
      ...mapGetters({
        getUserList: VStore.$getters.getUserList,
      }),

      ...mapState( Chat.namespace, {
        global             : Chat.$states.global,
        getMessage         : Chat.$states.message,
        enableAutocomplete : Chat.$states.autocomplete,
        getMessageBuffer   : Chat.$states.messageBuffer,
        emoteList          : Chat.$states.emoteList,
      }),

      userlist () {
        if ( !this.getUserList ) return [];
        return this.getUserList
          .map( user => {
            return {
              image: user.data.avatar,
              color: user.data.color,
              label: user.data.username,
              value: `@${user.data.username} `,
            }
          })
          .reverse();
      },

      autocompleteFilter () {
        return this.autocomplete
          ? this.autocomplete[0].substr(1)
          : '';
      },
    },
  }
</script>

<style lang="scss">
  #chat-input {
    position: relative;
  }
</style>
