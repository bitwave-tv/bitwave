<template>
  <div
    id="sidechat"
    class="d-flex flex-grow-1 flex-column"
    v-resize.quiet="onResize"
  >

    <!-- Chat Header -->
    <v-sheet
      id="chat-header"
      class="d-flex align-center justify-space-between pa-2"
      color="grey darken-4"
    >

      <!-- Viewer List -->
      <ViewerList :page="page" />

      <!-- Chat Label -->
      <h4
        @click="addUserTag(page)"
        class="mx-2 text-truncate"
        style="cursor: pointer;"
      >
        {{ page }}
      </h4>

      <div class="d-flex">

        <!-- Create Poll Button -->
        <div v-if="page === username">
          <v-menu
            v-model="showPoll"
            :close-on-content-click="false"
            bottom
            offset-y
            left
          >
            <template #activator="{ on }">
              <v-btn
                v-on="on"
                small
                class="black--text"
                :disabled="showPollClient"
                color="yellow"
              >POLL</v-btn>
            </template>

            <!-- Create Poll Dialog -->
            <chat-poll
              id="chat-poll"
              @close="showPoll = false"
              @create="createPoll"
            />
          </v-menu>
        </div>

        <!-- Placeholder -->
        <v-btn
          :style="{ 'min-width': '40px' }"
          small
          color="yellow"
          class="ml-2 px-0 black--text"
          disabled
          @click="scrollToBottom(true)"
        >
          <v-icon>verified_user</v-icon>
        </v-btn>

      </div>

    </v-sheet>

    <!-- Show Poll to Users -->
    <v-flex id="user-chat-poll">
      <chat-poll-vote
        v-if="showPollClient"
        :poll-data="pollData"
        :is-owner="pollData.owner === ( user ? user.uid : null )"
        @vote="votePoll"
        @end="endPoll"
        @destroy="destroyPoll"
      />

    </v-flex>

    <!-- Chat Messages -->
    <chat-messages
      ref="chatmessages"
      :messages="messages"
      :show-timestamps="showTimestamps"
      :global="global"
      @reply="addUserTag"
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
  import { auth, db } from '@/plugins/firebase.js'
  import jwt_decode from 'jwt-decode'

  import socketio from 'socket.io-client'

  import ChatInput from '@/components/Chat/ChatInput'
  import ChatMessages from '@/components/Chat/ChatMessages'
  import ChatPoll from '@/components/Chat/ChatPoll'
  import ChatPollVote from '@/components/Chat/ChatPollVote'
  import ViewerList from '@/components/Chat/ViewerList'

  import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'
  import { Chat } from '@/store/chat';
  import { VStore } from '@/store';

  let trollInitialized = false;
  let trollDataError = null;
  let trollDataWaiters = [];
  const trollDataLoaded = () => new Promise(( resolve, reject ) => {
    if ( trollInitialized ) resolve();
    if ( trollDataError ) reject( trollDataError );
    trollDataWaiters.push( { resolve, reject } );
  });

  // Creates server map for switching chat servers
  const chatServers = new Map([
    [ 'DEV',  'localhost:5000'  ],
    [ 'PROD', 'chat.bitwave.tv' ],
  ]);

  export default {
    name: 'Chat',

    props: {
      chatChannel : { type: String },
      forceGlobal : { type: Boolean },
    },

    components: {
      ChatInput,
      ChatMessages,
      ChatPoll,
      ChatPollVote,
      ViewerList,
    },

    data() {
      return {
        chatServer: chatServers.get( 'PROD' ),

        unsubscribeUser: null,
        unsubscribePoll: null,

        loading: true,
        token: null,
        trollId: null,
        socket: null,
        chatLimit: 50,
        userToken: null,

        messages: [
          {
            timestamp : Date.now(),
            username  : 'MarkPugner',
            avatar    : 'https://cdn.bitwave.tv/uploads/avatar/94b06c45-af56-4d49-8d42-62853eac66d8-md',
            message   : `<p>Connecting to chat server... <img src="https://cdn.bitwave.tv/static/emotes/catspin.gif" alt=":catspin:"></p>`,
            channel   : 'litechat',
          },
          {
            timestamp : Date.now(),
            username  : 'Dispatch',
            avatar    : 'https://cdn.bitwave.tv/static/img/glitchwave-100.gif',
            message   : `<img src="https://cdn.bitwave.tv/static/emotes/xmas.gif" alt=":xmas:">`,
            channel   : 'litechat',
          },
        ],

        ignoreList: [],
        ignoreChannelList: [],

        showChatSettings: false,

        voicesListTTS: [],

        showPoll: false,
        showPollClient: false,
        pollData: {
          channel: '',
          display: false,
          endsAt: 0,
          id: '',
          options: [
            { label:'', votes: 0 },
            { label:'', votes: 0 },
          ],
          owner: '',
          title: '',
          voters: 0,
        },

        sound: process.server ? null : new Audio(),

        willBeDestroyed: false,
        hideTrolls: false,
      }
    },

    methods: {
      async onResize () {
        await this.$nextTick( async () => await this.scrollToBottom( false ) );
      },

      async addUserTag ( user ) {
        this.$refs['chat-input'].$refs['chatmessageinput'].focus();
        this.appendChatMessage( `@${user} ` );
      },

      async authenticated ( user ) {
        if ( this.unsubscribeUser ) this.unsubscribeUser();
        if ( user ) {
          await this.subscribeToUser( user.uid );
        } else {
          // if ( !this.token ) await this.getTrollToken();
          await trollDataLoaded();
          const tokenTroll = {
            type  : 'troll',
            token : this.token,
            page  : this.page,
          };
          this.connectChat( tokenTroll );
        }
      },

      async subscribeToUser ( uid ) {
        const userdocRef = db.collection( 'users' ).doc( uid );
        let lastUser = {};
        this.unsubscribeUser = userdocRef.onSnapshot( async doc => {

          // Swap ID token for Chat Token
          const idToken = await auth.currentUser.getIdToken();
          await this.exchangeIdTokenChatToken( idToken );
          const chatToken = this.getChatToken;

          const user = doc.data();
          user.page  = this.page;

          // Save local ignore list to account
          const ignoreList = doc.get( 'ignoreList' );
          if ( ignoreList !== undefined ) {
            this.ignoreList = ignoreList;
            localStorage.setItem( 'ignorelist', JSON.stringify( this.ignoreList ) );
          } else {
            await doc.ref.update( 'ignoreList', this.ignoreList );
          }

          // Save local ignore channel list to account
          const ignoreChannelList = doc.get( 'ignoreChannelList' );
          if ( ignoreChannelList !== undefined ) {
            this.ignoreChannelList = ignoreChannelList;
            localStorage.setItem( 'ignoreChannellist', JSON.stringify( this.ignoreChannelList ) );
          } else {
            await doc.ref.update( 'ignoreChannelList', this.ignoreChannelList );
          }

          // Check if reconnection required
          if ( lastUser.avatar !== user.avatar || lastUser.username !== user.username || lastUser.color !== user.color ) {
            const tokenUser = {
              type  : 'user',
              token : chatToken,
              page  : this.page,
            };
            this.connectChat( tokenUser );
          }
          lastUser = user; // Record user state
        });
      },

      subscribeToPoll ( channel ) {
        channel = channel.toLowerCase();
        const pollDocRef = db.collection( 'polls' ).where( 'channel', '==', channel ).limit( 1 );
        this.unsubscribePoll = pollDocRef.onSnapshot( result => {
          if ( result.empty ) return;

          const doc = result.docs[0];

          this.pollData = doc.data();
          this.pollData.id = doc.id;

          this.showPollClient = this.pollData.display;

          this.onResize(); // Scroll to bottom when showing / hiding polls
        });
      },

      async scrollToBottom ( force ) {
        if ( this.$refs['chatmessages'] )
          this.$refs['chatmessages'].scrollToBottom( force );
        else
          console.warn('Could not find scroll container for chat.');
      },

      async connectChat ( tokenUser ) {
        // Remove event listeners and disconnect
        if ( this.socket ) {
          this.socket.off();
          this.socket.disconnect();
        }

        if ( !tokenUser ) {
          await this.socketError( `Invalid User Token` );
          console.warn( `Failed to connect to chat. No user defined.` );
          return;
        }

        this.userToken = tokenUser;

        if ( this.willBeDestroyed ) return;

        const socketOptions = { transports: [ 'websocket' ] };

        this.socket = socketio( this.chatServer, socketOptions );

        this.socket.on( 'connect',      async ()      => await this.socketConnect() );
        this.socket.on( 'reconnect',    async ()      => await this.socketReconnect() );
        this.socket.on( 'error',        async error   => await this.socketError( `Connection Failed`, error ));
        this.socket.on( 'disconnect',   async data    => await this.socketError( `Connection Lost`, data ));

        this.socket.on( 'update usernames', async data => await this.updateViewerlist( data ) );

        this.socket.on( 'hydrate',     async data => await this.hydrate( data ) );
        this.socket.on( 'bulkmessage', async data => await this.rcvMessageBulk( data ) );

        this.socket.on( 'blocked',   data => this.setMessage( data.message ) );
        this.socket.on( 'pollstate', data => this.updatePoll( data ) );

        if ( process.env.APP_DEBUG ) {
          this.socket.on( 'reconnecting', async attempt => await this.socketError( `Attempting to reconnect... (${ attempt })` ) );
        }
      },

      async socketConnect () {
        // Get RECAPTCHA v3 Token
        this.userToken.recaptcha = await this.getRecaptchaToken( 'connect' );

        // Attempt to connect...
        this.socket.emit( 'new user', this.userToken );
        this.loading = false;

        if ( this.willBeDestroyed ) {
          this.socket.off();
          this.socket.disconnect();
        }
      },

      async socketReconnect () {
        this.$toast.success( 'Success: Chat reconnected!', { icon: 'done', duration: 1000, position: 'top-right' }  );
      },

      async socketError ( error, reason ) {
        this.loading = true;
        this.$toast.error( `${error}${reason ? `: ${reason}` : '' }`, { icon: 'error', duration: 2000, position: 'top-right' } );
      },

      async hydrate ( data ) {
        await this.socket.emit( 'hydratepoll', this.pollData.id );

        if ( !data ) {
          this.$toast.error( 'Error hydrating chat!', { icon: 'error', duration: 2000, position: 'top-right' } );
          console.log( 'Failed to receive hydration data' );
          return;
        }

        const size = data.length;
        if ( !size ) {
          console.log( 'Hydration data was empty' );
          return;
        }

        // Filter by channel
        if ( !this.global && !this.forceGlobal ) {
          data = data.filter( el => ( el.channel.toLowerCase() === this.page.toLowerCase() || el.channel.toLowerCase() === this.username.toLowerCase() ) );
        }

        this.messages = size > 2 * this.chatLimit ? data.splice( -this.chatLimit ) : data;

        // re-highlight username mentions on hydration
        const pattern = new RegExp( `@${this.username}\\b`, 'gi' );
        this.messages.forEach( msg => {
          msg.message = msg.message.replace( pattern, `<span class="highlight">$&</span>` );
        });

        // Scroll after hydration
        await this.$nextTick( async () => {
          if ( this.$refs['chatmessages'] )
            this.$refs['chatmessages'].jumpToBottom();
          else
            console.warn('Failed to find chat container after hydration');
        });
      },

      async rcvMessageBulk ( messages ) {
        // Remove ignored user messages
        if ( this.useIgnore ) {
          messages = messages.filter( el => !this.ignoreList.includes( el.username.toLowerCase() ) );
        }

        if ( this.hideTrolls ) messages = messages.filter( el => !el.username.startsWith( 'troll:' ) );

        // Ignore channel messages
        messages = messages.filter ( el => {
          // Do not ignore a channel we are in
          const list = this.ignoreChannelList.filter( channel => channel.toLowerCase() !== this.page.toLowerCase() );
          return !list.includes( el.channel.toLowerCase() );
        });

        // Filter by channel
        if ( !this.global && !this.forceGlobal ) {
          messages = messages.filter( el => ( el.channel.toLowerCase() === this.page.toLowerCase() || el.channel.toLowerCase() === this.username.toLowerCase() ) );
        }

        const pattern = new RegExp( `@${this.username}\\b`, 'gi' );
        messages.forEach( el => {
          // Notification Sounds
          if ( this.notify ) {
            if ( pattern.test( el.message ) ) {
              this.sound.play().then();
            }
          }

          // Highlight username tags in new messages
          el.message = el.message.replace( pattern, `<span class="highlight">$&</span>` );

          // For Text to Speech
          const currentChat = el.channel.toLowerCase() === this.username.toLowerCase();
          const myChat      = el.channel.toLowerCase() === this.page.toLowerCase();
          if ( currentChat || myChat ) this.speak( el.message, el.username ); // Say Message

          // Add message to list
          this.messages.push( el );
        });

        if ( this.$refs['chatmessages'] ) {
          if ( !this.$refs['chatmessages'].showFAB ) {
            this.messages = this.messages.splice( -this.chatLimit );
          }
        } else {
          console.warn( `Failed to find 'chatmessages' component...` );
        }

        this.scrollToBottom();
      },

      async sendMessage () {
        if ( !this.getMessage || this.getMessage.length > 300 ) return false;

        const msg = {
          message : this.getMessage,
          channel : this.page,
          global  : this.global,
        };

        const pattern = /(?:^\/)(\w+)(?:\s+(\S+))?(?:\s+(.*))?/;
        const params = this.getMessage.match( pattern );

        if ( params ) {
          const command  = params[1].toLowerCase();
          const argument = params[2] ? params[2].toLowerCase() : '';

          switch ( command ) {
            case 'dev':
              this.chatServer = chatServers.get( 'DEV' );
              if ( this.userToken ) await this.connectChat( this.userToken );
              await this.insertMessage( 'Enabled developer mode.\nAttempting to connect to local dev server.' );
              break;
            case 'prod':
            case 'production':
              this.chatServer = chatServers.get( 'PROD' );
              if ( this.userToken ) await this.connectChat( this.userToken );
              await this.insertMessage( 'Disabled developer mode.\nAttempting to connect to production chat server.' );
              break;
            case 'local':
              this.global = false;
              break;
            case 'global':
              this.global = true;
              break;
            case 'ignore':
            case 'i':
              await this.ignoreUser( argument );
              break;
            case 'unignore':
            case 'u':
              await this.unignoreUser( argument );
              break;
            case 'ignorechannel':
            case 'ic':
              await this.ignoreChannel( argument );
              break;
            case 'unignorechannel':
            case 'uic':
            case 'uc':
              await this.unignoreChannel( argument );
              break;
            case 'susi':
            case 'trolls':
              this.hideTrolls = !this.hideTrolls;
              if ( this.hideTrolls ) this.messages = this.messages.filter( el => !el.username.startsWith( 'troll:' ) );
              else if ( this.socket ) await this.socket.emit( 'hydrate' );
              break;
            case 'ignorelist':
              await this.insertMessage( `Ignored Users: ${this.ignoreList.join(', ')}` );
              await this.insertMessage( `Ignored Channels: ${this.ignoreChannelList.join(', ')}` );
              this.$ga.event({
                eventCategory : 'chat',
                eventAction   : 'ignorelist',
              }); // Analytics
              break;
            case 'skip':
            case 's':
              speechSynthesis.cancel(); // Skip TTS
              break;
            case 'w':
            case 'whisper':
              this.socket.emit( 'whisper', msg );
              break;
          }
        } else {
          this.socket.emit( 'message', msg );
        }
      },

      async insertMessage ( message, color ) {
        await this.rcvMessageBulk([
          {
            timestamp: Date.now(),
            username: '[bitwave.tv]',
            userColor: color ? color : '#FFF',
            avatar: 'https://cdn.bitwave.tv/static/img/glitchwave.gif',
            message: message,
            channel: this.page,
          },
        ]);
      },

      async getRecaptchaToken ( action ) {
        try {
          await this.$recaptcha.init();
          return await this.$recaptcha.execute( action );
        } catch ( error ) {
          console.error( error );
          return null;
        }
      },

      async getTrollToken () {
        try {
          const { data } = await this.$axios.get( 'https://api.bitwave.tv/api/troll-token' );
          const trollToken = data.chatToken;                   // Get new troll token and
          localStorage.setItem( 'troll', trollToken );         // Save token to localStorage
          this.setChatToken( trollToken );
          this.token = trollToken;
          this.trollId = jwt_decode( trollToken ).user.name;   // Then parse the token
          trollInitialized = true;
          trollDataWaiters.forEach( v => v.resolve() );        // Finally, Resolve our waiters
        } catch ( error ) {
          console.error( `Failed to get troll token`, error ); // Error getting troll token
          trollDataError = error;
          trollDataWaiters.forEach( v => v.reject(error) );    // Reject our waiters
        }
      },

      async setupTrollData () {
        try {
          const trollToken = localStorage.getItem( 'troll' );  // Check for an existing token
          if ( !trollToken ) await this.getTrollToken();           // No token found, go get one
          if ( trollToken ) {                 // We have a token
            this.setChatToken( trollToken );  // use the token
            this.token = trollToken;
            this.trollId = jwt_decode( trollToken ).user.name;  // Decode the token
            trollInitialized = true;
            trollDataWaiters.forEach( v => v.resolve() );       // Resolve our waiters
          }
        } catch ( error ) {
          console.log( `Failed to access localstorage`, error );
        }
      },

      speak ( message, username ) {
        if ( !this.getUseTts ) return;  // Check that TTS is enabled
        if ( this.ignoreList.find( user => user === username ) ) return; // Don't read ignored users
        if ( !this.getTrollTts && /troll:\w+/.test( username ) ) return;         // disables troll TTS

        const unescapeHtml = unsafe => {
          return unsafe
            .replace( /&amp;/g,  `&` )
            .replace( /&lt;/g,   `<` )
            .replace( /&gt;/g,   `>` )
            .replace( /&quot;/g, `"` )
            .replace( /&#39;/g,  `'` )
        };
        message = unescapeHtml( message ); // Fixes escaped characters
        message = message.replace( /<\/?[^>]*>/g, '' );  // Remove html tags
        message = message.replace( /((https?:\/\/)|(www\.))[^\s]+/gi, '' );  // Remove Links

        const voice = new SpeechSynthesisUtterance();
        const pitch = 1;
        voice.voice = this.voicesListTTS[this.getTtsVoice];
        voice.rate  = this.getTtsRate / 10.0;
        voice.pitch = pitch;
        voice.text  = message;

        voice.onend = e => console.log( `TTS Finished in ${e.elapsedTime} seconds.`, e );

        speechSynthesis.speak(voice);
      },


      // POLL FUNCTIONS -> SOCKET
      //-------------------------
      async createPoll ( poll ) {
        if ( this.pollData.id ) {
          const pollDocRef = db.collection( 'polls' ).doc( this.pollData.id );
          const data = {
            display: true,
            endsAt: new Date( Date.now() + poll.time * 60 * 1000 ),
            trollVotes: poll.allowTrollVotes,
            options: poll.options,
            title: poll.title,
          };
          await pollDocRef.update( data );
        } else {
          const data = {
            channel: this.page.toLowerCase(),
            display: true,
            endsAt: new Date( Date.now() + poll.time * 60 * 1000 ),
            trollVotes: poll.allowTrollVotes,
            options: poll.options,
            owner: this.user.uid,
            title: poll.title,
          };
          this.pollData.id = await db.collection( 'polls' ).add( data );
        }
      },

      // Add user vote to poll with matching poll id
      votePoll ( vote ) {
        // should pass option number & poll id
        this.socket.emit( 'votepoll', { id: this.pollData.id, vote: vote } )
      },

      // Change end time to now to end poll instantly
      async endPoll ( pollId ) {
        // this.socket.emit('endpoll', this.pollData);
        // tell server to update poll and transfer data to client

        const pollDocRef = db.collection( 'polls' ).doc( this.pollData.id );
        await pollDocRef.update( {
          'endsAt':  new Date( Date.now() ),
          options: this.pollData.options,
        });
      },


      // Delete and hide poll
      async destroyPoll ( pollId ) {
        const pollRef = db.collection( 'polls' ).doc( pollId );
        await pollRef.update( { 'display': false, 'options': null } );
      },

      async updatePoll ( data ) {
        this.pollData.options = data.options;
        this.pollData.voters  = data.voters;
      },

      async ignoreUser ( username ) {
        username = username.replace('@', '');
        const exists = this.ignoreList.find( el => el.toLowerCase() === username.toLowerCase() );
        if ( exists ) {
          console.log( `User not found: '${username}'` );
          return;
        }
        this.ignoreList.push( username );
        localStorage.setItem( 'ignorelist', JSON.stringify( this.ignoreList ) );
        // Save ignore list to profile
        if ( this.isAuth ) {
          const userDoc = db.collection( 'users' ).doc( this.user.uid );
          await userDoc.update( 'ignoreList', this.ignoreList );
        }

        // Remove messages
        if ( this.useIgnore )
          this.messages = this.messages.filter( message => username.toLowerCase() !==  message.username.toLowerCase() );

        // Confirmation Message
        await this.insertMessage( `Ignored User: ${username}` );

        // Analytics
        this.$ga.event({
          eventCategory : 'chat',
          eventAction   : 'ignore',
          eventLabel    : username,
        });
      },

      async unignoreUser ( username ) {
        username = username.replace('@', '');
        const location = this.ignoreList.findIndex( el => el.toLowerCase() === username.toLowerCase() );
        if ( location !== -1 ) {
          this.ignoreList.splice( location, 1 );
          localStorage.setItem( 'ignorelist', JSON.stringify( this.ignoreList ) );
          // Save ignore list to profile
          if ( this.isAuth ) {
            const userDoc = db.collection( 'users' ).doc( this.user.uid );
            await userDoc.update( 'ignoreList', this.ignoreList );
          }

          // Confirmation Message
          await this.insertMessage( `Unignored User: ${username}` );

          // Analytics
          this.$ga.event({
            eventCategory : 'chat',
            eventAction   : 'unignore',
            eventLabel    : username,
          });
        } else {
          console.log( `Ignored user not found: '${username}'` );
        }
      },

      async ignoreChannel ( channel ) {
        const exists = this.ignoreChannelList.find( el => el.toLowerCase() === channel.toLowerCase() );
        if ( exists ) {
          console.log ( `Channel already ignored ${channel}` );
          return;
        }
        this.ignoreChannelList.push( channel );
        localStorage.setItem( 'ignoreChannelList', JSON.stringify( this.ignoreChannelList ) );
        // Save ignore list to profile
        if ( this.isAuth ) {
          const userDoc = db.collection( 'users' ).doc( this.user.uid );
          await userDoc.update( 'ignoreChannelList', this.ignoreChannelList );
        }

        // Remove messages
        this.messages = this.messages.filter( message => channel.toLowerCase() !==  message.channel.toLowerCase() );

        // Confirmation Message
        await this.insertMessage( `Ignored Channel: ${channel}` );

        // Analytics
        this.$ga.event({
          eventCategory : 'chat',
          eventAction   : 'ignore-channel',
          eventLabel    : channel,
        });
      },

      async unignoreChannel ( channel ) {
        const location = this.ignoreChannelList.findIndex( el => el.toLowerCase() === channel.toLowerCase() );
        if ( location !== -1 ) {
          this.ignoreChannelList.splice( location, 1 );
          localStorage.setItem( 'ignoreChannelList', JSON.stringify( this.ignoreChannelList ) );
          // Save ignore list to profile
          if ( this.isAuth ) {
            const userDoc = db.collection( 'users' ).doc( this.user.uid );
            await userDoc.update( 'ignoreChannelList', this.ignoreChannelList );
          }

          // Confirmation Message
          await this.insertMessage( `Unignored Channel: ${channel}` );

          // Analytics
          this.$ga.event({
            eventCategory : 'chat',
            eventAction   : 'unignore-channel',
            eventLabel    : channel,
          });
        } else {
          console.log( `Ignored channel not found: '${channel}'` );
        }
      },

      ...mapMutations({
        setChatToken: VStore.$mutations.setChatToken,
      }),

      ...mapMutations (Chat.namespace, {
        setModeGlobal     : Chat.$mutations.setGlobal,
        setModeTimestamps : Chat.$mutations.setTimestamps,
        setUseIgnore      : Chat.$mutations.setUseIgnore,
        setNotify         : Chat.$mutations.setNotify,
        setIgnoreList     : Chat.$mutations.setIgnoreList,
        setMessage        : Chat.$mutations.setMessage,
        appendChatMessage : Chat.$mutations.appendMessage,
      }),

      ...mapActions({
        exchangeIdTokenChatToken: VStore.$actions.exchangeIdTokenChatToken,
      }),

      ...mapActions (Chat.namespace, {
        updateViewerlist: Chat.$actions.updateViewerList,
      }),
    },

    computed: {
      ...mapGetters({
        isAuth       : VStore.$getters.isAuth,
        user         : VStore.$getters.getUser,
        _username    : VStore.$getters.getUsername,
        getChatToken : VStore.$getters.getChatToken,
      }),

      ...mapState (Chat.namespace, {
        getModeGlobal     : Chat.$states.global,
        getModeTimestamps : Chat.$states.timestamps,
        getUseTts         : Chat.$states.useTts,
        getUseIgnore      : Chat.$states.useIgnore,
        getTrollTts       : Chat.$states.trollTts,
        getTtsRate        : Chat.$states.ttsRate,
        getTtsVoice       : Chat.$states.ttsVoice,
        notify            : Chat.$states.notify,
        getIgnoreList     : Chat.$states.ignoreList,
        getMessage        : Chat.$states.message,
      }),

      global: {
        set ( val ) { this.setModeGlobal( val ) },
        get () { return this.getModeGlobal }
      },

      showTimestamps: {
        set ( val ) { this.setModeTimestamps( val ) },
        get () { return this.getModeTimestamps }
      },

      useIgnore: {
        set ( val ) { this.setUseIgnore( val ) },
        get () { return this.getUseIgnore }
      },

      username () {
        return this._username || this.trollId || 'troll';
      },

      page () {
        let channel = this.chatChannel;
        if ( channel ) {
          if ( channel.match( /^[a-zA-Z0-9._-]+$/ ) )
            return channel;
          else
            return '404';
        } else {
          return 'Global';
        }
      },
    },

    watch: {
      global: async function ( val, old ) {
        if ( !val ) {
          // Remove global messages when going into local chat
          this.messages = this.messages.filter( m => ( m.channel.toLowerCase() === this.page.toLowerCase() || m.channel.toLowerCase() === this.username.toLowerCase() ) );
        } else {
          // Reconnect chat to force hydration when going into global chat
          if ( this.socket ) await this.socket.emit( 'hydrate' );
        }
      },
    },

    async mounted () {
      this.unsubAuthChanged = auth.onAuthStateChanged( async user => await this.authenticated( user ) );

      await this.setupTrollData();

      // Add listener for voice changes, then update voices.
      this.voicesListTTS = speechSynthesis.getVoices();
      speechSynthesis.onvoiceschanged = () => this.voicesListTTS = speechSynthesis.getVoices();

      // Ignore users
      try {
        let ignore = localStorage.getItem( 'useignore' );
        if ( !!ignore ) this.useIgnore = JSON.parse( ignore );
      } catch ( error ) {
        console.log( 'No ignore option found.' );
      }

      // Get ignore list
      try {
        let ignores = localStorage.getItem( 'ignorelist' );
        if ( ignores ) this.ignoreList = JSON.parse( ignores );
      } catch ( error ) {
        console.log( 'No ignore list found.' );
      }

      // Get ignore channel list
      try {
        let ignores = localStorage.getItem( 'ignoreChannelList' );
        if ( ignores ) this.ignoreChannelList = JSON.parse( ignores );
      } catch ( error ) {
        console.log( 'No ignore channel list found.' );
      }

      try {
        const showTimestamps = localStorage.getItem( 'showtimestamps' );
        if ( !!showTimestamps ) this.showTimestamps = showTimestamps;
        else this.showTimestamps = true;
      } catch ( error ) {
        console.log( 'No showTimestamps option found.' );
      }

      try {
        const global = localStorage.getItem( 'globalchat' );

        if ( !!global ) this.setModeGlobal( global );
        else this.setModeGlobal( false );

      } catch ( error ) {
        console.log( 'No global chat option found.' );
        this.setModeGlobal( true );
      }

      try {
        const notify = localStorage.getItem( 'notify' );
        if ( !!notify ) this.setNotify( notify );
      } catch ( error ) {
        console.log ( 'No notification sound option found.' );
        this.setNotify ( false );
      }

      // Listen for new polls
      this.subscribeToPoll( this.page );

      // Setup Notification Sound
      this.sound.src = '/sounds/tweet.mp3';
      this.sound.volume = .25;
    },

    beforeDestroy () {
      if ( this.unsubAuthChanged ) this.unsubAuthChanged();
      if ( this.unsubscribeUser )  this.unsubscribeUser();
      if ( this.unsubscribePoll )  this.unsubscribePoll();
      if ( this.socket ) {
        this.socket.off();
        this.socket.disconnect();
      }
      this.willBeDestroyed = true;
    },

    destroyed() {
      if ( this.socket ) {
        this.socket.off();
        this.socket.disconnect();
      }
    }
  }
</script>

<style lang='scss'>
  #sidechat {
    border-top: 3px yellow;
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
  }

  #chat-scroll {
    height: 100%;
    margin-right: 1px;
    overscroll-behavior: auto;

    &::-webkit-scrollbar-track
    {
      -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,0.3);
      border-radius: 0;
      background-color: #0a0a0a;
    }

    &::-webkit-scrollbar
    {
      width: 10px;
      background-color: #0a0a0a;
    }

    &::-webkit-scrollbar-thumb
    {
      border-radius: 0;
      -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,.3);
      background-color: #555;
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
</style>
