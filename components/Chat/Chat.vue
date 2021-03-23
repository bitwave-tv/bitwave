<template>
  <div
    id="sidechat"
    class="d-flex flex-grow-1 flex-column"
    style="position: relative"
    v-resize.quiet="onResize"
  >

    <!-- Chat Header -->
    <chat-header
      :page="page"
      :is-channel-owner="isChannelOwner"
      @add-channel-tag="addUserTag( page )"
    />

    <!-- TODO: move structure and logic to subcomponent -->
    <add-ons style="position: relative;">

      <!-- Chat Banner -->
      <div
        :style="{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          zIndex: 1,
        }"
      >
        <v-slide-x-reverse-transition>
          <v-sheet
            v-if="connecting"
            color="error"
            elevation="0"
            tile
            class="flex-grow-1"
          >
            <div class="px-3 py-2">connecting...</div>
            <v-progress-linear
              color="error darken-4"
              indeterminate
            />
          </v-sheet>
        </v-slide-x-reverse-transition>
      </div>

    </add-ons>

    <!-- Chat Stat Graph -->
    <v-slide-y-transition mode="out-in">
      <chat-graph
        v-if="showGraph"
        :values="graphValues"
        :period="getStatTickRate"
        :statName="graphStat.stat"
      />
    </v-slide-y-transition>

    <!-- Chat Messages -->
    <chat-messages
      ref="chatmessages"
      :messages="messages"
      :show-timestamps="showTimestamps"
      :global="global"
      :channel="page"
      :is-channel-owner="isChannelOwner"
      @reply="addUserTag"
      @whisper="addWhisper"
      @ignore="ignoreUser"
      @unignore="unignoreUser"
    />

    <!-- Chat Input -->
    <chat-input
      ref="chat-input"
      :username="username"
      :loading="loading"
      @send="sendMessage"
    />

    <chat-ignore-list
      v-model="showIgnoreList"
    />

    <!-- Fireworks overlay -->
    <fireworks
      :absolute="true"
      ref="fireworks"
    />

  </div>
</template>

<script>
  import { auth, db } from '@/plugins/firebase.js';

  import * as _bitwaveChat from '@bitwave/chat-client';
  const bitwaveChat = _bitwaveChat.default;

  import AddOns from '@/components/Chat/AddOns';
  import ChatHeader from '@/components/Chat/ChatHeader';
  import ChatMessages from '@/components/Chat/ChatMessages';
  import ChatInput from '@/components/Chat/ChatInput';

  const ChatGraph = async () => await import ( '@/components/Analytics/ChatGraph' );

  import { mapState, mapGetters, mapMutations, mapActions } from 'vuex';
  import { Chat } from '@/store/chat';
  import { VStore } from '@/store';

  import {
    compareTokens,
    sanitize,
    stripHTML,
    spamDetection,
  } from '@/assets/js/ChatHelpers';

  import { UserStats } from '@/assets/js/Stats/UserStats';

  import { ChatConfig } from '@/store/channel/chat-config';
  import * as storeUtils from '@/plugins/store-utils.js'
  import ChatIgnoreList from '@/components/Chat/ChatIgnoreList/index';

  // Creates server map for switching chat servers
  const chatServers = new Map([
    [ 'DEV',  'localhost:5000'  ],
    [ 'PROD', 'https://chat.bitwave.tv' ],
  ]);

  export default {
    name: 'Chat',

    props: {
      chatChannel : { type: String },
      forceGlobal : { type: Boolean },
    },

    components: {
      ChatIgnoreList,
      AddOns,
      ChatHeader,
      ChatInput,
      ChatMessages,
      ChatGraph,
    },

    data() {
      return {
        chatServer: chatServers.get( 'PROD' ),

        unsubscribeUser: null,

        loading: true,
        connecting: true,
        chatLimit: 150,
        userToken: null,

        // [ Message -> Maybe Message ]
        messageFilters: [
          m => {
            // Remove ignored users
            if ( this.useIgnore && this.ignoreList.includes( m.username.toLowerCase() ) )
              return null;
            else
              return m;
          },
          m => {
            // Do not ignore a channel we are in
            const ignoreChannellist = this.ignoreChannelList.slice();
            const index = ignoreChannellist.indexOf( this.page.toLowerCase() );
            if (index > -1) {
              ignoreChannellist.splice( index, 1 );
            }

            // Remove ignored channel messages
            if ( !ignoreChannellist.includes( m.channel.toLowerCase() ) ) return m;
          },
          m => {
            // Remove trolls
            if ( this.hideTrolls && m.username.startsWith( 'troll:' ) )
              return null;
            else
              return m;
          },
          m => {
            if ( m.type === 'whisper' ) {
              return m;
            }
            const isLocal = !this.global && !this.forceGlobal;
            if( isLocal ) {
              // Include mentions
              // If enabled, allow cross-channel username tagging in local
              const pattern = new RegExp( `@${this.username}\\b`, 'gi' );
              if ( this.getReceiveMentionsInLocal && m.message.match( pattern ) ) return m;

              // Check if message is in our local channel or in our own channel
              const currChannel = this.$utils.normalizedCompare( m.channel, this.username );
              const myChannel   = this.$utils.normalizedCompare( m.channel, this.page );

              // if the message is NOT in the current channel AND NOT in our channel
              // then it should be filtered
              if ( !currChannel && !myChannel ) return null;
            }
            return m;
          },
          m => {
            if( this.useIgnore && this.getRecursiveIgnore ) {
              // TODO: This should be reversed.
              // That is, we should get the @'s in a mention
              // Then check if the @'d user is in the ignore list
              // if they are, return null early.
              for( const i of this.ignoreList )
                if( new RegExp(`@${i}(\\s|\\b|$)`, 'gi').test( m.message ) ) return null;
            }
            return m;
          }
        ],

        messages: null,

        voicesListTTS: [],

        sound: process.server ? null : new Audio(),

        ttsTimeout: null,

        statInterval: null,

        newMessageCount: 0,
        showGraph: false,
        graphStat: { stat: 'messageCount', user: 'all' },
        graphValues: [ 0 ],

        viewCount: 0,
        showViewStats: false,
        viewValues: [ 0 ],

        userStats: new UserStats( this.getStatTickRate ),

        requestResize: false,

        showIgnoreList: false,
      }
    },

    methods: {
      saveToDb ( collection, field, value ) {
        if( this.isAuth ) {
          storeUtils.saveToDb( db, this.user.uid, collection, field, value );
        }
      },

      async executeAction ( a ) {
        if ( a.insertMessage ) await this.insertMessage( a.insertMessage );
        if ( a.saveToDb ) this.saveToDb( ...a.saveToDb );
        if ( a.forceFilter ) {
          if ( this.useIgnore )
            this.messages = this.messages.filter( a.forceFilter );
          else
            await this.insertMessage( 'NOTE: You have ignore users turned off' );
        }
        if ( a.changeStatOnGraph ) this.changeStatOnGraph( ...a.changeStatOnGraph );
        if ( a.chatServer ) {
          this.chatServer = chatServers.get( a.chatServer );
          await this.disconnectChat();
          await this.connectToChat();
        }
        if ( a.showDialog ) {
          if ( a.showDialog === 'ignorelist' ) this.showIgnoreList = true;
        }
      },

      async connectToChat () {

        // TODO: collapse if
        await this.initChat();

        if ( !this.getChatToken ) {
          console.error( `Failed to initialize with a chat token!` );
          return;
        }

        this.userToken = {
          type  : 'unknown', //TODO: try removing
          token : this.getChatToken,
          page  : this.page,
        };

        this.connecting = false;

        this.userToken.recaptcha = null;

        bitwaveChat.onHydrate = this.onHydration;
        bitwaveChat.rcvMessageBulk = this.rcvMessageBulk;
        bitwaveChat.updateUsernames = this.updateViewers;
        bitwaveChat.alert = this.addAlert;

        bitwaveChat.socketReconnect = () => { this.connecting = false; this.loading = false; };
        bitwaveChat.socketError = () => { this.connecting = false; this.loading = true; };

        bitwaveChat.blocked = ( data ) => {
          console.log( `Socket Blocked: `, data );

          const msLeft = data?.errData?.msBeforeNext || 1000;

          this.setInputRateLimit( true );
          this.setInputRateLimitMs( msLeft );

          setTimeout( () => {
            this.setInputRateLimit( false );
            this.setInputRateLimitMs( 0 );
          }, msLeft );

          this.appendChatMessage( data.message );
        }

        bitwaveChat.global = this.global;

        await bitwaveChat.init( this.page, this.userToken, this.chatServer );

        this.loading = false;
      },

      disconnectChat() {
        bitwaveChat.disconnect();
      },

      async onResize () {
        if ( this.requestResize ) return;
        this.requestResize = true;

        // Throttle to half second updates, on RAF
        setTimeout( () => {
          requestAnimationFrame( async() => {
            await this.scrollToBottom( false );
            this.requestResize = false;
          });
        }, 500 );

        // await this.$nextTick( async () => await this.scrollToBottom( false ) );
      },

      async scrollToBottom ( force ) {
        if ( this.$refs['chatmessages'] )
          await this.$refs['chatmessages'].scrollToBottom( force );
        else
          console.warn('Could not find scroll container for chat.');
      },

      async ignoreUser ( user ) {
        const actions = await this.$chatCommandParser.ignoreUser( user.toLowerCase() );
        actions?.forEach( a => this.executeAction( a ) );
      },

      async unignoreUser ( user ) {
        const actions = await this.$chatCommandParser.unignoreUser( user.toLowerCase() );
        actions?.forEach( a => this.executeAction( a ) );
      },

      async addUserTag ( user ) {
        this.$refs['chat-input'].$refs['chatmessageinput'].focus();
        this.appendChatMessage( `@${user} ` );
      },

      async addWhisper ( user ) {
        this.$refs['chat-input'].$refs['chatmessageinput'].focus();
        this.setMessage( `/w @${user} ` );
      },

      async authenticated ( user ) {
        if ( this.unsubscribeUser ) this.unsubscribeUser();
        if ( user ) {
          await this.subscribeToUser( user.uid );
        } else {
          await this.logoutChat();

          // Prevents edge case where troll users get connected twice
          // This occurs during page loads for trolls only.
          const tokenUpdated = !this.userToken || this.userToken.token !== this.getChatToken;
          if ( tokenUpdated ) {

            const tokenTroll = {
              type: 'troll',
              token: this.getChatToken,
              page: this.page,
            };

            await this.disconnectChat();
            this.userToken = tokenTroll;
            await this.connectToChat();
          }
        }
      },

      // TODO: why are these here?
      async subscribeToUser ( uid ) {
        const userdocRef = db
          .collection( 'users' )
          .doc( uid );

        let lastUser = {};
        this.unsubscribeUser = userdocRef.onSnapshot( async doc => {
          // Detect when we are offline
          if ( !doc.exists ) {
            console.log( `No user snapshot, are we offline?` );
            return;
          }

          const user = { ...doc.data(), page: this.page };

          // Save local ignore list to account
          const ignoreList = doc.get( 'ignoreList' );
          if ( ignoreList !== undefined ) {

            // TODO: This should be persisted in localstorage, probably?
            // This benefit this has, is that you can login and have your settings
            // Then log out without having your ignore list stay with you
            // The downside is that the ignore list cannot be applied during hydration
            // as it does not yet exist. This means ignored user messages will briefly
            // appear in chat until the user's profile data has loaded
            // Another way to handle this would be to mirror to localstorage,
            // but then to remove the ignore list upon logging out.

            // Sets active ignore list to list loaded from user data
            this.ignoreList = ignoreList;

            // Applies the current user's ignore list to chat (needed to filter hydration data
            this.applyChatFilters();
          } else {
            // Update account ignore list
            await doc.ref.update( 'ignoreList', this.ignoreList );
          }

          // Save local ignore channel list to account
          const ignoreChannelList = doc.get( 'ignoreChannelList' );
          if ( ignoreChannelList !== undefined ) {
            this.ignoreChannelList = ignoreChannelList;
          } else {
            // Update account ignore channel list
            await doc.ref.update( 'ignoreChannelList', this.ignoreChannelList );
          }

          // Check if reconnection required
          if ( lastUser.avatar !== user.avatar
            || lastUser.username !== user.username
            || lastUser.color !== user.color
            || lastUser.badge !== user.badge
          ) {
            const oldToken = this.getChatToken;

            // Swap ID token for Chat Token
            const getNewToken = async () => {
              const idToken = await auth.currentUser.getIdToken();
              await this.exchangeIdTokenChatToken( idToken );
              const chatToken = this.getChatToken;

              const tokenUpdated = !compareTokens( oldToken, this.getChatToken );

              if ( process.env.APP_DEBUG ) console.log( `Has our chat token updated? ${tokenUpdated ? 'Yes' : 'No'}` );

              if ( tokenUpdated ) {
                // Create user payload
                const tokenUser = {
                  type  : 'user',
                  token : chatToken,
                  page  : this.page,
                };
                // Reconnect to chat
                // prevents duplicating connection
                await this.disconnectChat();
                await this.connectToChat( tokenUser ); // Connect to chat server
              }
            };
            await getNewToken();
          }
          lastUser = user; // Record user state
        });
      },

      async hydrate () {
        // This can be removed if we put it in onHydration()
        // but placing it here forces chat to clear when toggling
        // Local vs. Global which looks nicer than having
        // Global and Local animated and mix when leaving local
        // this.messages = [];
        if ( !this.messages ) this.messages = [];

        const success = await bitwaveChat.hydrate();
        if( !success ) {
          this.$toast.error(
            'Error hydrating chat!',
            {
              icon: 'error',
              duration: 2000,
              position: 'top-right'
            }
          );
          return;
        }

        // Scroll immediately after hydration
        if ( process.client ) {
          this.$nextTick( () => {
            if ( this.$refs['chatmessages'] ) this.$refs['chatmessages'].jumpToBottom();
            else console.warn( 'Failed to find chat container after hydration' );
          });
        }
      },

      async onHydration ( messages ) {
        this.messages = [];

        // Return early if we are missing data
        if ( !messages ) return;

        messages.forEach( m => {
          // Filter messages
          if ( this.filterMessage( m ) ) return;

          const pattern = new RegExp( `@${this.username}\\b`, 'gi' );

          // Add username highlighting
          m.message = m.message.replace( pattern, `<span class="highlight">$&</span>` );

          m.type = 'message';

          // Add message to list
          this.messages.push( Object.freeze( m ) );
        });
      },

      async rcvMessageBulk ( messages ) {
        // Return early if we are missing data
        if ( !messages ) return;

        let needsScroll = false;

        messages.forEach( m => {
          // fireworks event
          if ( m.type === 'fireworks') {
            if ( !this.$utils.normalizedCompare( m.channel, this.page ) ) return;

            console.debug( `Fireworks: ${m.topText}, ${m.bottomText}` );
            this.showChatFireworks( m.topText, m.bottomText );
            return;
          }

          // delete event
          if ( m.type === 'delete') {
            console.debug( `delete: ${m.ids}` );
            this.messages = this.messages?.filter( message => !m.ids.includes( message._id) ) ;
            return;
          }

          // Filter messages
          if ( this.filterMessage( m ) ) return;

          const pattern = new RegExp( `@${this.username}\\b`, 'gi' );

          // Add username highlighting
          m.message = m.message.replace( pattern, `<span class="highlight">$&</span>` );

          // Notification Sounds
          if ( this.notify ) if ( pattern.test( m.message ) ) this.sound.play().then();

          // For Text to Speech
          if ( this.getUseTts ) {
            // TODO: m.lowercase might be unnecessary
            // TODO: this code is identical to one of the filters
            // Dispatch TODO: Is it actually identical to one of the filters? I'm not sure that's true
            const currentChat = this.$utils.normalizedCompare( m.channel, this.username );
            const myChat      = this.$utils.normalizedCompare( m.channel, this.page );

            // Say Message
            if ( currentChat || myChat ) {
              const useTts = ( username ) => {
                if ( this.ignoreList.find( user => user.toLowerCase() === m.username.toLowerCase() ) ) return false; // Don't read ignored users
                if ( !this.getTrollTts && /troll:\w+/.test( username ) ) return false; // disables troll TTS
                return true;
              }
              if ( useTts( m.username ) ) {
                console.log( 'tts' );
                this.speak( m.message, m.username );
              }
            }
          }

          m.type = 'message';

          // Add message to list
          this.messages.push( Object.freeze( m ) );

          // Trigger scroll request
          needsScroll = true;

          // Track message count
          if ( this.statInterval ) this.newMessageCount++;
        });

        if ( !this.$refs['chatmessages'].showFAB ) {
          // Only trim message message history if auto scrolling
          // if ( this.messages.length > 2 * this.chatLimit ) this.messages.splice( 0, this.messages.length - this.chatLimit );
          if ( this.messages.length > this.chatLimit ) this.messages.splice( 0, this.messages.length - this.chatLimit );

          // Only trigger scroll if a message was added
          // this.$nextTick( async () => await this.scrollToBottom() );
          if ( needsScroll ) await this.scrollToBottom();
        }
      },

      // Applies all active filters on messages
      applyChatFilters () {
        this.messages = this.messages?.filter( message => !this.filterMessage( message ) ) ;
      },

      addAlert ( data ) {
        const m = {
          type: 'alert',
          _id: data._id,
          amount: data.amount || 0,
          color: data.color || 'primary',
          message: data.message || '',
          channel: data.channel,
          username: data.username || 'TROLL',
        };

        console.log( `New alert:`, m );

        // TODO: factor out these checks

        // Only show local alerts
        if ( m.channel && !this.$utils.normalizedCompare( m.channel, this.page ) ) {
          return;
        }

        // If alert is to us, make sound and read it
        if ( this.$utils.normalizedCompare( m.channel, this.username ) ) {
          // Play ping
          this.sound.play().then();

          // Say Message
          if ( this.getUseTtsAlerts ) this.speak( m.message, m.username );
        }

        this.messages.push( Object.freeze( m ) );

        if ( !this.$refs['chatmessages'].showFAB ) {
          this.$nextTick( () => this.scrollToBottom() );
        }
      },

      filterMessage ( message ) {
        const maybeCompose = ( f, g ) => {
          return x => {
            if( !f || !g ) return undefined;

            const y = g( x );
            if( !y ) return undefined;
            else return f( x );
          };
        };
        //    allFilters = foldl (>=>) return this.messageFilters
        const allFilters = this.messageFilters.reduce( maybeCompose, a => a );
        return !allFilters( message );
      },

      changeStatOnGraph( stat, _user ) {
        const user = _user ?? "all";
        const data = this.userStats.stat.get( user, stat );
        if( data && data.values && data.values.length ) {
          this.graphStat = { user: user, stat: stat };
          this.showGraph = !this.showGraph;
        } else {
          this.insertMessage( 'Invalid stat name (did you enable stat-tracking?)' );
        }
      },

      async onChatStatTick() {
        // TODO: once chatsettings option is gone, maybe pass this as a prop instead?
        if( !this.getTrackMetrics ) { this.newMessageCount = 0; return; }

        this.userStats.calculate.viewerCount.total();

        const newMessages = this.messages.slice( this.messages.length - this.newMessageCount, this.messages.length );

        await this.userStats.calculate.messageRate.total( newMessages );
        this.userStats.calculate.messageRateDerivative.total();
        this.userStats.calculate.hIndex.total( newMessages );
        this.userStats.calculate.spamminess.total( newMessages );
        this.userStats.calculate.niceness.user( "all", 1 );

        if( this.getTrackMetricsPerUser ) {
          this.userStats.calculate.spamminess.everybody( newMessages );
          await this.userStats.calculate.messageRate.everybody( newMessages );
          this.userStats.calculate.messageRateDerivative.everybody();
        }

        this.userStats.userStats.forEach( ( stats, username ) => {
          console.log(username,
            JSON.stringify(Array.from(stats.entries())));
        });

        const data = this.userStats.stat.get( this.graphStat.user, this.graphStat.stat );
        if( data && data.values && data.values.length ) {
          this.graphValues = data.values.slice().reverse();
        } else {
          this.graphValues = [0];
        }

        //this.userStats.garbageCollect();

        this.newMessageCount = 0;
      },

      async sendMessage () {
        if ( !this.getMessage || this.getMessage.length > 300 ) return false;

        const msg = {
          message   : this.getMessage,
          channel   : this.page,
          global    : this.global,
          showBadge : this.chatBadge,
        };

        const actions = await this.$chatCommandParser.parseOne( msg.message );
        actions?.forEach( a => this.executeAction( a ) );

        if( !actions ) bitwaveChat.sendMessage( msg );
      },

      async insertMessage ( message, color ) {
        await this.rcvMessageBulk( Object.freeze([
          {
            _id: Date.now(),
            timestamp: Date.now(),
            username: '[bitwave.tv]',
            userColor: color ? color : '#FFF',
            avatar: 'https://cdn.bitwave.tv/static/img/glitchwave.gif',
            message: message,
            channel: this.page,
          },
        ]));
      },

      speak ( message, username ) {
        // Remove HTML related strings & links
        message = stripHTML( message );

        if ( this.cleanTts ) {
          if ( spamDetection( message ) ) {
            console.log( 'Spam detected, skipping TTS.' );
            return;
          }
          message = sanitize( message );
        }

        const voice  = new SpeechSynthesisUtterance();
        const pitch  = 1;
        voice.voice  = this.voicesListTTS[this.getTtsVoice];
        voice.rate   = this.getTtsRate / 10.0;
        voice.volume = this.getTtsVolume / 10.0;
        voice.pitch  = pitch;
        voice.text   = message;

        if( this.getTtsReadUsername ) {

          // Since 'username says' will be prepended to the read message, we have to ensure
          // that the message isn't blank; skip only if there isn't readable text.
          const pattern = new RegExp( /\S/, 'gi' );
          if( !message.match( pattern ) ) {
            console.log( 'Empty message, skipping TTS.' );
            return;
          }

          voice.text = `${username} says: ` + voice.text;
        }

        voice.onend = ( evt ) => {
          if ( this.ttsTimeout ) clearTimeout( this.ttsTimeout );
          console.log( `TTS Finished in ${(evt.elapsedTime / 1000).toFixed(1)} seconds.`, evt );
        };

        speechSynthesis.speak( voice );
        if ( this.getTtsTimeout > 0 ) {
          this.ttsTimeout = setTimeout( () => speechSynthesis.cancel(), this.getTtsTimeout * 1000 );
        }
      },

      showChatFireworks ( text, bottomText ) {
        this.$refs[ 'fireworks' ]
          .start( text, bottomText );
      },

      ...mapMutations ({
        setChatToken: VStore.$mutations.setChatToken,
      }),

      ...mapMutations ( Chat.namespace, {
        setRoom           : Chat.$mutations.setRoom,
        setGlobal         : Chat.$mutations.setGlobal,
        setIgnoreList     : Chat.$mutations.setIgnoreList,
        addIgnoreList     : Chat.$mutations.addIgnoreList,
        removeIgnoreList  : Chat.$mutations.removeIgnoreList,
        setMessage        : Chat.$mutations.setMessage,
        setHideTrolls     : Chat.$mutations.setHideTrolls,
        setCleanTts       : Chat.$mutations.setCleanTts,
        appendChatMessage : Chat.$mutations.appendMessage,
        setPinnedMessage  : Chat.$mutations.setPinnedMessage,
        setChatBadge      : Chat.$mutations.setShowBadge,
        setIgnoreChannelList     : Chat.$mutations.setIgnoreChannelList,
        addIgnoreChannelList     : Chat.$mutations.addIgnoreChannelList,
        removeIgnoreChannelList  : Chat.$mutations.removeIgnoreChannelList,
        setInputRateLimit        : Chat.$mutations.setInputRateLimit,
        setInputRateLimitMs      : Chat.$mutations.setInputRateLimitMs,
      }),

      ...mapActions ({
        updateViewers : VStore.$actions.updateViewers,
      }),

      ...mapActions ( Chat.namespace, {
        loadSettings             : Chat.$actions.loadSettings,
        initChat                 : Chat.$actions.init,
        logoutChat               : Chat.$actions.logout,
        updateChatToken          : Chat.$actions.updateChatToken,
        exchangeIdTokenChatToken : Chat.$actions.exchangeIdTokenChatToken,
      }),

      ...mapActions ( ChatConfig.namespace, {
        loadChatConfig      : ChatConfig.$actions.loadConfig,
        createPinnedMessage : ChatConfig.$actions.createPinnedMessage,
      }),

    },

    computed: {
      ...mapGetters({
        isAuth          : VStore.$getters.isAuth,
        user            : VStore.$getters.getUser,
        _username       : VStore.$getters.getUsername,
        getChannelViews : VStore.$getters.getChannelViews,
      }),

      ...mapState({
        channelsViewers : VStore.$states.channelsViewers,
      }),

      ...mapState ( Chat.namespace, {
        global            : Chat.$states.global,
        showTimestamps    : Chat.$states.timestamps,
        getUseTts         : Chat.$states.useTts,
        getUseTtsAlerts   : Chat.$states.useTtsAlerts,
        useIgnore         : Chat.$states.useIgnore,
        getRecursiveIgnore: Chat.$states.recursiveIgnore,
        getHideTrolls     : Chat.$states.hideTrolls,
        getTrollTts       : Chat.$states.trollTts,
        getCleanTts       : Chat.$states.cleanTts,
        getTtsRate        : Chat.$states.ttsRate,
        getTtsReadUsername: Chat.$states.ttsReadUsername,
        getTtsTimeout     : Chat.$states.ttsTimeout,
        getTtsVolume      : Chat.$states.ttsVolume,
        getTtsVoice       : Chat.$states.ttsVoice,
        notify            : Chat.$states.notify,
        getMessage        : Chat.$states.message,
        getIgnoreList             : Chat.$states.ignoreList,
        getIgnoreChannelList      : Chat.$states.ignoreChannelList,
        getReceiveMentionsInLocal : Chat.$states.receiveMentionsInLocal,

        getStatTickRate      : Chat.$states.statTickRate,
        getStatHistogramSize : Chat.$states.statHistogramSize,

        getTrackMetrics          : Chat.$states.trackMetrics,
        getTrackMetricsPerUser   : Chat.$states.trackMetricsPerUser,

        getChatToken      : Chat.$states.chatToken,
        displayName       : Chat.$states.displayName,

        chatBadge         : Chat.$states.showBadge,
        inputRateLimit    : Chat.$states.inputRateLimit,
      }),

      username () {
        return this.displayName || this._username || 'user';
      },

      isChannelOwner () {
        return this.$utils.normalizedCompare( this.page, this.username );
      },

      page () {
        let channel = this.chatChannel;
        if ( channel ) {
          return channel.match( /^[a-zA-Z0-9._-]+$/ )
            ? channel
            : '404';
        } else {
          return 'Global';
        }
      },

      ignoreList: {
        set ( val ) {
          this.setIgnoreList( val );
        },
        get () { return this.getIgnoreList; }
      },

      ignoreChannelList: {
        set ( val ) {
          this.setIgnoreChannelList( val );
        },
        get () { return this.getIgnoreChannelList; }
      },

      hideTrolls: {
        set ( val ) {
          this.setHideTrolls( val );
        },
        get () { return this.getHideTrolls; }
      },

      cleanTts: {
        set ( val ) {
          this.setCleanTts( val );
        },
        get () { return this.getCleanTts; }
      },

      async liveStreamers () {
        try {
          const { data } = await this.$axios.get( 'https://api.bitwave.tv/v1/channels/live' );
          if ( data && data.success ) {
            return data.streamers;
          } else {
            console.log( `API Error:`, data );
          }
        } catch ( error ) {
          console.error( `Failed to get live channels from API server: ${error.message}` );
          return [];
        }
        console.log( `Failed to get live channels from API server` );
        return [];
      }
    },

    watch: {
      async global ( val, old ) {
        bitwaveChat.global = val;

        // Forces chat to fully clear when toggling
        // this.messages = [];

        await this.hydrate();
      },

      // hydrate when turning trolls back on
      async getHideTrolls ( val ) {
        if ( !val ) await this.hydrate();
      },

      // hydrate when turning ignore off
      async useIgnore ( val ) {
        // It would probably be better to keep a "master" copy of messages
        // so that we can avoid a hydration call and just re-filter from master
        if ( !val ) await this.hydrate();
        else this.applyChatFilters();
      },

      async getStatTickRate ( val ) {
        if ( this.statInterval ) clearInterval( this.statInterval );
        this.statInterval = window.setInterval( () => this.onChatStatTick(), val * 1000 )
      },

      async getStatHistogramSize ( val ) {
        this.userStats.defaultHistogramSettings = { create: true, size: val };
      },
    },

    async mounted () {
      // Reset UI
      this.setInputRateLimit( false );
      this.setInputRateLimitMs( 0 );

      /*setInterval( () => {
        const timeLeft = this.inputRateLimitMs - 1000;
        if ( timeLeft > 1000 ) {
          this.setInputRateLimitMs( timeLeft );
        } else {
          this.setInputRateLimit( false );
          this.setInputRateLimitMs( 0 );
        }
      }, 1000 );*/

      // Load settings from localstorage
      await this.loadSettings();

      await this.connectToChat();
      await this.hydrate();

      this.setRoom( this.page );

      this.unsubAuthChanged = auth.onAuthStateChanged( async user => await this.authenticated( user ) );
      // TODO: trigger token exchange in store from plugin listener,
      // TODO: store login will exchange and update our store token
      // TODO: watch store token value locally,
      // TODO: create user token and reconnect on change


      this.userStats.calculate.viewerCount = {
        total: () => {
          const me = this.userStats;
          const key = "viewerCount";
          me.stat.value.set( me.ALL_USER, key, this.getChannelViews( this.page ) );
        }
      };

      this.userStats.calculate.hIndex = {
        total: async () => {
          const streamers = await this.liveStreamers;
          const channels = streamers.map( l => this.getChannelViews( l.name ) ).filter( c => c !== 0 );
          if( !channels ) {
            this.userStats.stat.value.set( this.userStats.ALL_USER, "hIndex", 0 );
            return;
          }

          let h = 0;
          for( const viewCount of channels ) {
            let g = 0,  // i + r
                i = 1,  // i := # of larger streams +1
                r = -1; // r := # of other equally-sized streams

            for( const viewCompare of channels ) {
              if( viewCount < viewCompare ) i++;
              else if( viewCount === viewCompare ) r++;
            }

            g = i + r;
            // Maximises h; g is the new candidate for h
            if( g > h ) {
              if( g > viewCount ) {
                if ( i <= viewCount ) {
                  h = viewCount;
                }
              } else {
                h = g
              }
            }
          }
          this.userStats.stat.value.set( this.userStats.ALL_USER, "hIndex", h );
        }
      }

      // Add listener for voice changes, then update voices.
      try {
        this.voicesListTTS = speechSynthesis.getVoices();
        speechSynthesis.onvoiceschanged = () => this.voicesListTTS = speechSynthesis.getVoices();
      } catch ( error ) {
        console.error( error );
      }

      // Stat tracking interval
      this.userStats.defaultHistogramSettings = { create: true, size: this.getStatHistogramSize };
      this.statInterval = setInterval( () => this.onChatStatTick(), this.getStatTickRate * 1000 );

      // Setup Notification Sound
      this.sound.src = '/sounds/tweet.mp3';
      this.sound.volume = .25;
    },

    beforeDestroy () {
      if ( this.unsubAuthChanged ) this.unsubAuthChanged();
      if ( this.unsubscribeUser )  this.unsubscribeUser();
      if ( this.statInterval ) clearInterval( this.statInterval );
      bitwaveChat.disconnect();
    },

    destroyed() {
      // TODO: might need a bitwaveChat.disconnect() here
      bitwaveChat.disconnect();
    }
  }
</script>

<style lang='scss'>
  #sidechat {
    border-top: 3px $bw-blue;
    background-color: #000;
    max-width: 100%;

    p {
      margin-bottom: 0;
    }

    a {
      text-decoration: none;
      font-weight: bold;
      color: #2196f3;
    }

    .highlight {
      font-weight: bold;
      color: yellow;
    }

    code .highlight {
      background-color: yellow;
      padding: 0 4px;
      color: inherit;
    }
  }

  #chat-scroll {
    height: 100%;
    margin-right: 1px;
    overscroll-behavior: contain;

    &::-webkit-scrollbar-track
    {
      box-shadow: inset 0 0 4px rgba(0,0,0,0.25);
      border-radius: 0;
      background-color: #0a0a0a;
    }

    &::-webkit-scrollbar
    {
      width: 6px;
      background-color: #0a0a0a;
    }

    &::-webkit-scrollbar-thumb
    {
      border-radius: 0;
      box-shadow: inset 0 0 4px rgba(0,0,0,.25);
      background-color: #333;
    }
  }

  .systemAlert .chat-desktop {
    $offset: 24px + 48px;
    top: $offset;
    height: calc(100vh - #{$offset});
  }

  .chat-desktop {
    position : fixed;
    top      : 48px;
    right    : 0;
    height   : calc(100vh - 48px);
    width    : 450px;
  }

  .v-skeleton-loader__avatar {
    margin-right: 16px;
  }
</style>
