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
      <h4 @click="addUserTag(page)">{{ page }}</h4>

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
        :is-owner="pollData.owner === (user ? user.uid : null)"
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
        unsubscribeUser: null,
        unsubscribePoll: null,

        loading: true,
        token: null,
        recaptcha: null,
        trollId: null,
        socket: null,
        chatLimit: 50,

        messages: [
          {
            timestamp : Date.now(),
            username  : 'Dispatch',
            avatar    : 'https://cdn.bitwave.tv/static/img/glitchwave.gif',
            message   : `<p>Connecting to chat server... <img src="https://cdn.bitwave.tv/static/emotes/catspin.gif" alt=":catspin:"></p>`,
            channel   : 'bitwave',
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
      }
    },

    methods: {
      async playSound () {
        await this.sound.play();
      },

      async onResize () {
        await this.$nextTick( async () => await this.scrollToBottom( false ) );
      },

      async addUserTag ( user ) {
        this.$refs['chat-input'].$refs['chatmessageinput'].focus();
        this.appendChatMessage( `@${user} ` );
      },

      async authenticated ( user ) {
        if ( user ) {
          await this.subscribeToUser( user.uid );
        } else {
          if ( this.unsubscribeUser ) this.unsubscribeUser();
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
          // console.log( `ID Token Generated in chat:`, idToken );
          const { data } = await this.$axios.post( `https://api.bitwave.tv/api/token`, { token: idToken } );
          const chatToken = data.chatToken;
          // console.log( 'Chat Token Exchanged:', chatToken );

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

          // Scroll to bottom when showing / hiding polls
          this.onResize();
        });
      },

      async scrollToBottom ( force ) {
        if ( this.$refs['chatmessages'] )
          this.$refs['chatmessages'].scrollToBottom( force );
        else
          console.warn('Could not find scroll container for chat.');
      },

      async connectChat ( tokenUser ) {
        if ( this.socket) {
          this.socket.disconnect();
        }

        if ( !tokenUser ) {
          await this.socketError( `Invalid User Token` );
          console.warn( `Failed to connect to chat. No user defined.` );
          return;
        }

        const socketOptions = { transports: [ 'websocket' ] };

        this.socket = socketio( 'chat.bitwave.tv', socketOptions );
        // this.socket = socketio( 'localhost:5000', socketOptions );

        this.socket.on( 'error', async error => await this.socketError( `Connection Failed!`, error ));
        this.socket.on( 'reconnecting', async attempt => await this.socketError( `Attempting to reconnect... (${attempt})` ));
        this.socket.on( 'disconnect', async data => await this.socketError( `Connection Lost!`, data ));

        // this.socket.on( 'connect', () => this.socket.emit( 'new user', tokenUser ) );
        this.socket.on( 'connect', async () => {
          // Ensure we've loaded reCAPTCHA...
          await this.$recaptchaLoaded();

          // If we need a new token...
          if ( !this.recaptcha ) {
            await this.insertMessage( `Verifying user...`, '#ffeb3b' );
            tokenUser.recaptcha = await this.$recaptcha( 'connect' );
          }

          // Attempt to connect...
          this.socket.emit( 'new user', tokenUser );
          this.recaptcha = null;
          this.loading = false;
        });

        this.socket.on( 'update usernames', async data => await this.updateViewerlist( data ) );

        this.socket.on( 'hydrate',     async data => await this.hydrate( data ) );
        this.socket.on( 'bulkmessage', async data => await this.rcvMessageBulk( data ) );

        this.socket.on( 'blocked',   data => this.setMessage( data.message ) );
        this.socket.on( 'pollstate', data => this.updatePoll( data ) );
      },

      async socketError ( error, reason ) {
        const errorWrapper = content => `<p><img src="https://cdn.bitwave.tv/static/emotes/SadBlobby.png" alt=":("> ${content}</p>`;
        const styledReason = msg => msg ? `<br>Reason: <span style="color: #F44336; font-weight: bold;">${msg}</span>` : '';
        const message = errorWrapper( `${error}${styledReason( reason )}` );
        await this.insertMessage( message );
      },

      async hydrate ( data ) {
        await this.socket.emit( 'hydratepoll', this.pollData.id );

        if ( !data ) {
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
            if ( pattern.test(el.message) ) this.playSound();
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

        // Trim chat history
        /*if ( this.messages.length > 1.25 * this.chatLimit ) {
          this.messages = this.messages.splice( -this.chatLimit );
          console.log('Trimmed History');
        }*/

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

        const match = /^\/(\w+)\s?(\w+)?/g.exec( this.getMessage );
        const parts = this.getMessage.split( ' ' );

        if ( match ) {
          const command  = match[1].toLowerCase();
          const argument = parts[1]; //match[2];

          switch ( command ) {
            case 'ignore':
            case 'i':
              await this.ignoreUser( argument.toLowerCase() );
              break;
            case 'unignore':
            case 'u':
              await this.unignoreUser( argument.toLowerCase() );
              break;
            case 'ignorechannel':
            case 'ic':
              await this.ignoreChannel( argument.toLowerCase() );
              break;
            case 'unignorechannel':
            case 'uic':
            case 'uc':
              await this.unignoreChannel( argument.toLowerCase() );
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
              speechSynthesis.cancel();
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

      async setupRECAPTCHA () {
        if ( process.server ) return;
        await this.$recaptchaLoaded();
        this.recaptcha = await this.$recaptcha( 'connect' );
      },

      async setupTrollData () {
        let trollToken = localStorage.getItem( 'troll' );

        // Get new troll token
        if ( !trollToken ) {
          const { data } = await this.$axios.get('https://api.bitwave.tv/api/troll-token');
          trollToken = data.chatToken;
          localStorage.setItem( 'troll', trollToken );
          const tokenTroll = {
            type  : 'troll',
            token : trollToken,
            page  : this.page,
          };
          this.connectChat( tokenTroll );
        }

        this.token = trollToken;
        this.trollId = jwt_decode( trollToken ).user.name;
      },

      speak ( message, username ) {
        if ( !this.getUseTts ) return;
        if ( this.ignoreList.find( user => user === username ) ) return;
        if ( !this.getTrollTts && /troll:\w+/.test( username ) ) return; // disables troll TTS

        function unescapeHtml(unsafe) {
          return unsafe
            .replace( /&amp;/g,  `&` )
            .replace( /&lt;/g,   `<` )
            .replace( /&gt;/g,   `>` )
            .replace( /&quot;/g, `"` )
            .replace( /&#39;/g,  `'` )
        }

        message = unescapeHtml( message ); // Fixes escaped characters

        // Remove html tags
        message = message.replace( /<\/?[^>]*>/g, '' );

        // Remove Links
        message = message.replace( /((https?:\/\/)|(www\.))[^\s]+/gi, '' );

        const voice = new SpeechSynthesisUtterance();
        const pitch = 1;
        voice.voice = this.voicesListTTS[this.getTtsVoice];
        voice.rate  = this.getTtsRate / 10.0;
        voice.pitch = pitch;
        voice.text  = message;

        voice.onend = function(e) {
          console.log( `Finished in ${e.elapsedTime} seconds.`, e );
        };

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
            options: poll.options,
            title: poll.title,
          };
          await pollDocRef.update(data);
        } else {
          const data = {
            channel: this.page.toLowerCase(),
            display: true,
            endsAt: new Date( Date.now() + poll.time * 60 * 1000 ),
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
        // this.socket.emit('endpoll', pollId)

        const pollDocRef = db.collection( 'polls' ).doc( this.pollData.id );
        await pollDocRef.update( 'endsAt', new Date( Date.now() ) );
      },

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
        if ( !exists ) {
          this.ignoreList.push( username );
          localStorage.setItem( 'ignorelist', JSON.stringify( this.ignoreList ) );
          // Save ignore list to profile
          if ( this.isAuth ) {
            const userDoc = db.collection( 'users' ).doc( this.user.uid );
            await userDoc.update( 'ignoreList', this.ignoreList );
          }

          // Confirmation Message
          await this.insertMessage( `Ignored User: ${username}` );

          // Analytics
          this.$ga.event({
            eventCategory : 'chat',
            eventAction   : 'ignore',
            eventLabel    : username,
          });
        } else {
          console.log( `User not found: '${username}'` );
        }
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
        if ( !exists ) {
          this.ignoreChannelList.push( channel );
          localStorage.setItem( 'ignoreChannelList', JSON.stringify( this.ignoreChannelList ) );
          // Save ignore list to profile
          if ( this.isAuth ) {
            const userDoc = db.collection( 'users' ).doc( this.user.uid );
            await userDoc.update( 'ignoreChannelList', this.ignoreChannelList );
          }

          // Confirmation Message
          await this.insertMessage( `Ignored Channel: ${channel}` );

          // Analytics
          this.$ga.event({
            eventCategory : 'chat',
            eventAction   : 'ignore-channel',
            eventLabel    : channel,
          });
        } else {
          console.log ( `Channel already ignored ${channel}` );
        }
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

      ...mapMutations ('chat', {
        setModeGlobal: 'SET_MODE_GLOBAL',
        setModeTimestamps: 'SET_TIMESTAMPS',
        setIgnoreList: 'SET_IGNORE_LIST',
        setMessage: 'SET_CHAT_MESSAGE',
        appendChatMessage: 'APPEND_CHAT_MESSAGE',
        setNotify: 'SET_NOTIFY',
        setUseIgnore: 'SET_USE_IGNORE',
      }),

      ...mapActions ('chat', {
        updateViewerlist: 'UPDATE_VIEWERLIST',
      }),
    },

    computed: {
      ...mapGetters({
        isAuth: 'isAuth',
        user: 'user',
        _username: 'username',
      }),

      ...mapState ('chat', {
        getModeGlobal: 'global',
        getModeTimestamps: 'timestamps',
        getIgnoreList: 'ignoreList',
        getUseTts: 'useTts',
        getUseIgnore: 'useIgnore',
        getTrollTts: 'trollTts',
        getTtsRate: 'ttsRate',
        getTtsVoice: 'ttsVoice',
        getMessage: 'message',
        notify: 'notify',
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
        return this._username || this.trollId;
      },

      page () {
        let channel = this.chatChannel;
        if (channel) {
          if ( channel.match( /^[a-zA-Z0-9._-]+$/ ) )
            return channel;
          else
            return '404';
        } else {
          return 'Global';
        }
      },
    },

    created () {
      // this.unsubAuthChanged = auth.onAuthStateChanged( async user => await this.authenticated( user ) );
    },

    async mounted () {
      this.unsubAuthChanged = auth.onAuthStateChanged( async user => await this.authenticated( user ) );

      await this.setupRECAPTCHA();
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
      if ( this.socket ) this.socket.disconnect();
    },
  }
</script>

<style lang='scss'>
  #sidechat {
    border-top: 3px yellow;
    background-color: #000;

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
</style>
