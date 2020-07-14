<template>
  <div
    id="sidechat"
    class="d-flex flex-grow-1 flex-column"
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
      <v-slide-x-reverse-transition>
        <v-sheet
          v-if="connecting && !loading"
          color="error"
          elevation="0"
          tile
          class="flex-grow-1"
        >
          <div class="px-3 py-2">connecting...</div>
          <v-progress-linear
            color="error darken-3"
            indeterminate
          />
        </v-sheet>
      </v-slide-x-reverse-transition>

    </add-ons>

    <!-- Chat Stat Graph -->
    <v-slide-y-transition mode="out-in">
      <chat-graph
        v-if="showGraph"
        :values="graphValues"
        :period="tickPeriod"
        :statName="graphStat.stat"
      />
    </v-slide-y-transition>

    <!-- Chat Messages -->
    <chat-messages
      ref="chatmessages"
      :messages="messages"
      :show-timestamps="showTimestamps"
      :global="global"
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
        chatLimit: 50,
        userToken: null,

        // [ Message -> Maybe Message ]
        messageFilters: [
          m => { if ( !this.useIgnore || !this.ignoreList.includes( m.username.toLowerCase() ) ) return m; },
          m => {
            // Do not ignore a channel we are in
            const ignoreChannellist = this.ignoreChannelList.slice();
            const index = ignoreChannellist.indexOf( this.page.toLowerCase() );
            if (index > -1) {
              ignoreChannellist.splice(index, 1);
            }

            // Remove ignored channel messages
            if ( !ignoreChannellist.includes( m.channel.toLowerCase() ) ) return m;
          },
          m => { if ( !this.hideTrolls || !m.username.startsWith( 'troll:' ) ) return m; },
          m => {
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

        tickPeriod: 3,
        userStats: new UserStats( this.tickPeriod ),

        hydrated: false,
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
        if ( a.forceFilter ) this.messages.filter( a.forceFilter );
        if ( a.changeStatOnGraph ) this.changeStatOnGraph( ...a.changeStatOnGraph );
        if ( a.chatServer ) {
          this.chatServer = chatServers.get( a.chatServer );
          await this.disconnectChat();
          await this.connectToChat();
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
        if ( process.env.APP_DEBUG && false ) { // For testing...
          this.userToken.recaptcha = null;
        } else { // Get RECAPTCHA v3 Token
          this.userToken.recaptcha = await this.getRecaptchaToken( 'connect' );
        }

        bitwaveChat.rcvMessageBulk = this.rcvMessageBulk;
        bitwaveChat.updateUsernames = this.updateViewers;
        bitwaveChat.alert = this.addAlert;

        bitwaveChat.socketReconnect = () => { this.connecting = false; this.loading = false; };
        bitwaveChat.socketError = () => { this.connecting = false; this.loading = true; };

        bitwaveChat.global = this.global;
        bitwaveChat.init( this.page, this.userToken, this.chatServer );

        this.loading = false;
      },

      disconnectChat() {
        bitwaveChat.disconnect();
      },

      async onResize () {
        await this.$nextTick( async () => await this.scrollToBottom( false ) );
      },

      async scrollToBottom ( force ) {
        if ( this.$refs['chatmessages'] )
          this.$refs['chatmessages'].scrollToBottom( force );
        else
          console.warn('Could not find scroll container for chat.');
      },

      async ignoreUser ( user ) {
        const actions = await this.$chatCommandParser.ignoreUser( user );
        actions?.forEach( a => this.executeAction( a ) );
      },

      async unignoreUser ( user ) {
        const actions = await this.$chatCommandParser.unignoreUser( user );
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
            await this.connectChat();
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
            this.ignoreList = ignoreList;
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
                await this.connectChat( tokenUser ); // Connect to chat server
              }
            };
            await getNewToken();
          }
          lastUser = user; // Record user state
        });
      },

      async getRecaptchaToken ( action ) {
        // TODO: replace with hcpatcha
        return null;
        try {
          await this.$recaptcha.init();
          return await this.$recaptcha.execute( action );
        } catch ( error ) {
          console.error( error );
          return null;
        }
      },

      async hydrate () {
        this.messages = [];

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

      async rcvMessageBulk ( messages ) {
        messages.forEach( m => {
          // Filter messages
          if ( this.filterMessage( m ) ) return;

          const pattern = new RegExp( `@${this.username}\\b`, 'gi' );

          // Add username highlighting
          m.message = m.message.replace( pattern, `<span class="highlight">$&</span>` );

          // Notification Sounds
          if ( this.notify && this.hydrated ) if ( pattern.test( m.message ) ) this.sound.play().then();

          // For Text to Speech
          if ( this.getUseTts && this.hydrated ) {
            // TODO: m.lowercase might be unnecessary
            // TODO: this code is identical to one of the filters
            const currentChat = this.$utils.normalizedCompare( m.channel, this.username );
            const myChat      = this.$utils.normalizedCompare( m.channel, this.page );
            // Say Message
            if ( currentChat || myChat ) this.speak( m.message, m.username );
          }

          m.type = 'message';

          // Add message to list
          this.messages.push( Object.freeze( m ) );

          // Track message count
          if ( this.statInterval && this.hydrated ) this.newMessageCount++;
        });

        if ( !this.$refs['chatmessages'].showFAB && this.hydrated ) {
          if ( this.messages.length > 2 * this.chatLimit ) this.messages.splice( 0, this.messages.length - this.chatLimit );
          // this.scrollToBottom();
          this.$nextTick( () => this.scrollToBottom() );
        }
      },

      addAlert ( data ) {
        const m = {
          _id: data._id,
          type: 'alert',
          message: data.message,
          color: data.color || 'primary',
          channel: data.channel,
        };

        console.log( `New alert:`, m );

        // TODO: factor out these checks
        if ( m.channel
          && this.$utils.normalizedCompare( m.channel, this.page ) ) {
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
        //    allFilters = foldl (>=>) id this.messageFilters
        const allFilters = this.messageFilters.reduce( maybeCompose, a => a );
        return !allFilters( message );
      },

      changeStatOnGraph( stat, user ) {
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
        // TODO: remove from speak function. Speak should JUST do TTS, no filter logic
        if ( this.ignoreList.find( user => user === username ) ) return; // Don't read ignored users
        if ( !this.getTrollTts && /troll:\w+/.test( username ) ) return; // disables troll TTS

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

        voice.onend = e => {
          if ( this.ttsTimeout ) clearTimeout( this.ttsTimeout );
          console.log( `TTS Finished in ${(e.elapsedTime / 1000).toFixed(1)} seconds.`, e );
        };

        speechSynthesis.speak( voice );
        if ( this.getTtsTimeout > 0 ) {
          this.ttsTimeout = setTimeout( () => speechSynthesis.cancel(), this.getTtsTimeout * 1000 );
        }
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

      ...mapState ( Chat.namespace, {
        global            : Chat.$states.global,
        showTimestamps    : Chat.$states.timestamps,
        getUseTts         : Chat.$states.useTts,
        getUseTtsAlerts   : Chat.$states.useTtsAlerts,
        useIgnore         : Chat.$states.useIgnore,
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

        getTrackMetrics          : Chat.$states.trackMetrics,
        getTrackMetricsPerUser   : Chat.$states.trackMetricsPerUser,

        getChatToken      : Chat.$states.chatToken,
        displayName       : Chat.$states.displayName,

        chatBadge         : Chat.$states.showBadge,
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
    },

    watch: {
      async global ( val, old ) {
        bitwaveChat.global = val;
        await this.hydrate();
      },
    },

    /*fetchOnServer: false,
    async fetch () {
      // Timeout to prevent SSR from locking up
      const timeout = process.server ? process.env.SSR_TIMEOUT : 0;

      // TODO: timeout

      // await this.hydrate();
      this.$nextTick( async () => await this.hydrate() );
    },*/

    async mounted () {
      await this.connectToChat();
      await this.hydrate();
      this.hydrated = true;

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

      // Add listener for voice changes, then update voices.
      try {
        this.voicesListTTS = speechSynthesis.getVoices();
        speechSynthesis.onvoiceschanged = () => this.voicesListTTS = speechSynthesis.getVoices();
      } catch ( error ) {
        console.error( error );
      }

      // Load settings from localstorage
      await this.loadSettings();

      // Stat tracking interval
      this.statInterval = setInterval( () => this.onChatStatTick(), this.tickPeriod * 1000 );

      // Setup Notification Sound
      this.sound.src = '/sounds/tweet.mp3';
      this.sound.volume = .25;

      // Get channel chat configuration
      // this.loadChatConfig( this.page );
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
    overscroll-behavior: auto;

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
