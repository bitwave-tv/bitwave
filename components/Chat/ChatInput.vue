<template>
  <!-- Chat Input -->
  <v-sheet
    id="chat-input"
    class="pa-2 mt-1"
    color="grey darken-4"
  >

    <!-- Text Input Field -->

    <!-- :prepend-inner-icon="mobile && 'insert_emoticon'" -->
    <v-text-field
      ref="chatmessageinput"
      :value="getMessage"
      :label="`Chat ${global ? 'globally' : ''} as ${username}...`"
      :loading="loading"
      :disabled="loading"
      class="mb-0"
      color="primary"
      autocomplete="new-chat-message"
      autocorrect="off"
      autocapitalize="off"
      spellcheck="true"
      :counter="300"
      :hide-details="false"
      single-line
      dense
      validate-on-blur
      outlined
      clearable
      :error-messages="setInputRateLimit ? `${(setInputRateLimitMs / 1000).toFixed(0)}s before you can send a chat` : ''"

      @change="value => this.setChatMessage( value )"

      @keyup.delete="updateMessage"
      @keyup.enter.prevent="sendMessage"
      @keyup.prevent="lastMessageHandler"

      @cut="lastMessageHandler"

      @keydown="onDetectAutocomplete"
      @keydown.tab.prevent="onTab"
      @keydown.down="onArrow"
      @keydown.up="onArrow"

      @click:clear="setChatMessage( '' )"
      @drop="onDrop"
    />

    <!-- Bottom Buttons -->
    <div class="d-flex align-center">
      <!-- Chat Settings -->
      <chat-settings/>

      <chat-mod-tools v-if="false"/>

      <!-- WaveCoin™ -->
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
        <v-icon small right>send</v-icon>
      </v-btn>
    </div>

    <!-- Popup -->
      <autocomplete-chat
        v-if="autocomplete && enableAutocomplete"
        :key="autocompleteKey"
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
  import ChatModTools from '@/components/Chat/ChatModTools/index';

  const commands = [
    {
      label: 'Ignore a User',
      value: '/ignore @',
    },
    {
      label: 'ignore a channel',
      value: '/ignorechannel @',
    },
    {
      label: 'unignore a user',
      value: '/unignore @',
    },
    {
      label: 'unignore channel',
      value: '/unignorechannel @',
    },
    {
      label: 'purge channel ignores',
      value: '/purgechannels ',
    },
    {
      label: 'purge user ignores',
      value: '/purgeusers ',
    },
    {
      label: 'whisper',
      value: '/w @',
    },
    {
      label: 'Ignorelist',
      value: '/ignorelist ',
    },
    {
      label: 'Local',
      value: '/local ',
    },
    {
      label: 'Global',
      value: '/global ',
    },
    {
      label: 'TTS Cleanup Crew (clean tts)',
      value: '/cleantts ',
    },
    {
      label: 'Graph a stat',
      value: '/graph ',
    },
    {
      label: 'Toggle username badge (if available)',
      value: '/badge ',
    },
    {
      label: 'Dense chat messages',
      value: '/dense ',
    },
    {
      label: 'Bug Report',
      value: '/bugreport ',
    },
    {
      label: 'I need a safe space',
      value: '/trolls ',
    },
  ];

  export default {
    name: 'ChatInput',

    components: {
      ChatModTools,
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
        mounted: false,

        showChatCoins: false,

        messageBufferIndex: -1,
        showUsernameSuggestions: false,

        autocomplete: null,
        autocompleteKey: null,
        autocompleteData: [],
        autocompleteSelection: 0,
        autocompleteValue: null,
        acSize: 6,

        emoteList: [],
      }
    },

    fetchOnServer: false,
    async fetch() {
      await this.updateEmoteMap();
      this.emoteList = Array.from( this.emoteMap.values() )
    },

    methods: {
      ...mapMutations(Chat.namespace, {
        setMessage: Chat.$mutations.setMessage,
        addToMessageBuffer : Chat.$mutations.addToMessageBuffer,
      }),

      ...mapActions(Chat.namespace, {
        updateEmoteMap: Chat.$actions.updateEmoteMap,
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
          const send = !this.autocompleteValue ||
            this.$utils.normalizedCompare (
              this.autocomplete[0],
              this.autocompleteValue?.value?.trim(),
            );

          // Update field value
          if ( !send ) {
            event.srcElement.value = this.onTab();
            return;
          }
        }

        // Prevent sending empty and messages that are too long
        if ( !this.getMessage
          ||  this.getMessage?.length > 300
          ||  this.getMessage?.length === 0
        ) return;


        // Why would we call this again?
        if ( this.autocomplete ) {
          // TODO: Is it safe to delete this?
          console.log( 'Is this important?' );
          // this.onTab();
        }

        // Test for blank messages
        if (  /^[\s(\\n)]+$/.test( this.getMessage ) ) return;

        // SEND IT
        this.$emit( 'send' );

        // reset our buffer index offset after each message
        this.addToMessageBuffer( this.getMessage );
        this.messageBufferIndex = -1;

        // Clear it
        this.setChatMessage( '' );
      },

      lastMessageHandler ( event ) {
        if ( !event.srcElement.value
          || event.srcElement.value === this.getMessageBuffer[ this.messageBufferIndex ] ) {
          const buf = this.getMessageBuffer;

          // const getFromBuffer = ( location ) => this.getMessageBuffer[ location ];
          // const currentBuffer = () => getFromBuffer( this.messageBufferIndex );

          // Up Arrow (keyCode 38)
          if ( event.key === 'ArrowUp' ) {
            this.messageBufferIndex += ( this.messageBufferIndex < buf.length - 1 ) ? 1 : 0;
            this.setMessage( buf[ this.messageBufferIndex ] );
            event.preventDefault();
          }

          // Down Arrow (keyCode 40)
          else if ( event.key === 'ArrowDown' ) {
            this.messageBufferIndex -= ( this.messageBufferIndex > -1 ) ? 1 : 0;

            // Clear input when we hit the end
            if ( this.messageBufferIndex === -1 ) this.setMessage( '' );
            else this.setMessage( buf[ this.messageBufferIndex ] );
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
          return msg;
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

        const usernameMatch = this.getMessage.match( /@[\w:\-_]*$/g );
        if ( usernameMatch ) {
          // only set data once
          if ( this.autocompleteKey !== 'users' ) {
            this.autocompleteData = JSON.parse( JSON.stringify( this.userlist ) );
          }

          // this.acSize = 7;

          this.autocompleteKey = 'users';
          return usernameMatch;
        }

        const commandMatch = this.getMessage.match( /^\/[\w:\-_]*$/g );
        if ( commandMatch ) {
          this.autocompleteData = commands;
          // this.acSize = 7;
          this.autocompleteKey = 'commands';
          return commandMatch;
        }

        // Remove all existing emotes so we can end early
        const emoteMatch = this.getMessage
          .replace( /:\w+:/gi, '' )
          .match( /:[\w]*$/g );

        if ( emoteMatch ) {
          this.autocompleteData = this.emoteList;
          // this.acSize = 7;
          this.autocompleteKey = 'emotes';
          return emoteMatch;
        }
      },

      async onDrop( event ) {
        const droppedText = event.dataTransfer.getData( "text/plain" );
        const isEmoteLink = droppedText.startsWith( "https://cdn.bitwave.tv/static/emotes/" )
                         || droppedText.startsWith( "https://cdn.bitwave.tv/uploads/" );
        if( isEmoteLink ) {
          const emoteLink = droppedText.replace( /\?[0-9]*$/g, '' );
          const emote = Array.from( this.emoteMap.values() ).find( emote => emote.image.startsWith( emoteLink ) );

          event.preventDefault();

          // In case the emote isn't found, ensure the link is pasted
          if( emote ) { this.appendToChatMessage( emote.value ); }
          else { this.appendToChatMessage( emoteLink ); }
        }
      },
    },

    computed: {
      ...mapGetters({
        getUserList: VStore.$getters.getUserList,
      }),

      ...mapState( Chat.namespace, {
        global              : Chat.$states.global,
        getMessage          : Chat.$states.message,
        enableAutocomplete  : Chat.$states.autocomplete,
        getMessageBuffer    : Chat.$states.messageBuffer,
        emoteMap            : Chat.$states.emoteMap,
        setInputRateLimit   : Chat.$states.inputRateLimit,
        setInputRateLimitMs : Chat.$states.inputRateLimitMs,
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

      mobile () {
        return this.mounted
          ? this.$vuetify.breakpoint.smAndDown
          : !this.$device.isDesktopOrTablet;
      },
    },

    async mounted () {
      this.mounted = true;
    },
  }
</script>

<style lang="scss">
  #chat-input {
    position: relative;
  }
</style>
