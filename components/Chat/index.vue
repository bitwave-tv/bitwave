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
      color="accentwave"
    >

      <!-- Viewer List -->
      <div style="height: 32px;">
        <ViewerList :page="page" />
      </div>

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
        <div v-if="isChannelOwner">
          <v-menu
            v-model="showPoll"
            :close-on-content-click="false"
            :close-on-click="false"
            bottom
            offset-y
            left
          >
            <template #activator="{ on }">
              <v-btn
                v-on="on"
                small
                :disabled="showPollClient"
                color="primary black--text"
                class="mr-2"
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

        <!-- Admin Menu -->
        <v-menu
          v-if="isAdmin"
          v-model="adminActionsMenu"
          :close-on-content-click="false"
          bottom
          left
          offset-y
          transition="slide-y-transition"
        >
          <template #activator="{ on }">
            <v-btn
              v-on="on"
              small
              icon
              class="px-0"
              :disabled="!isAdmin"
              @click="scrollToBottom(true)"
            >
              <v-icon>verified_user</v-icon>
            </v-btn>
          </template>
          <chat-admin-menu @close="adminActionsMenu = false" />
        </v-menu>

        <!-- Overflow menu -->
        <v-menu
          v-model="overflowMenu"
          :close-on-content-click="true"
          bottom
          left
          offset-y
          transition="slide-y-transition"
        >
          <template #activator="{ on }">
            <v-btn
              v-on="on"
              class="px-0"
              small
              icon
            >
              <v-icon>more_vert</v-icon>
            </v-btn>
          </template>
          <chat-overflow-menu :channel="page"/>
        </v-menu>

      </div>

    </v-sheet>


    <!-- TODO: move structure and logic to subcomponent -->
    <add-ons style="position: relative;">

      <!-- Show Poll to Users -->
      <v-slide-x-reverse-transition>
        <chat-poll-vote
          v-if="showPollClient"
          :poll-data="pollData"
          :is-owner="pollData.owner === ( user ? user.uid : null )"
          @vote="votePoll"
          @end="endPoll"
          @destroy="destroyPoll"
        />
      </v-slide-x-reverse-transition>

    </add-ons>


    <v-slide-y-transition mode="out-in">
      <chat-rate
        v-if="showChatStats"
        :stats="chatStats"
      />
    </v-slide-y-transition>

    <v-slide-y-transition mode="out-in">
      <view-rate
        v-if="showViewStats"
        :stats="viewStats"
      />
    </v-slide-y-transition>


    <!-- Chat Messages -->
    <chat-messages
      ref="chatmessages"
      :messages="messages"
      :show-timestamps="showTimestamps"
      :global="global"
      @reply="addUserTag"
      @whisper="addWhisper"
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
  import jwt_decode from 'jwt-decode';

  import socketio from 'socket.io-client';

  import AddOns from '@/components/Chat/AddOns';
  import ChatMessages from '@/components/Chat/ChatMessages';
  import ChatInput from '@/components/Chat/ChatInput';
  import ChatPoll from '@/components/Chat/ChatPoll';
  import ViewerList from '@/components/Chat/ViewerList';

  const ChatPollVote = async () => await import ( '@/components/Chat/ChatPollVote' );
  const ChatRate = async () => await import ( '@/components/Analytics/ChatRate' );
  const ViewRate = async () => await import ( '@/components/Analytics/ViewRate' );
  const ChatAdminMenu = async () => await import ( '@/components/Admin/ChatAdminMenu' );
  const ChatOverflowMenu = async () => await import ( '@/components/Chat/ChatOverflowMenu' );

  import { mapState, mapGetters, mapMutations, mapActions } from 'vuex';
  import { Chat } from '@/store/chat';
  import { VStore } from '@/store';

  import { spamDetection } from '@/assets/js/ChatHelpers';

  import {
    sanitize,
    stripHTML
  } from '@/assets/js/ChatHelpers';
  import { ChatConfig } from '@/store/channel/chat-config';

  // Creates server map for switching chat servers
  const chatServers = new Map([
    [ 'DEV',  'localhost:5000'  ],
    [ 'PROD', 'https://chat.bitwave.tv' ],
  ]);

  const compareTokens = ( t1, t2 ) => {
    const dt1 = jwt_decode( t1 );
    const dt2 = jwt_decode( t2 );
    return dt1.user.avi === dt2.user.avi
      && dt1.user.badge === dt2.user.badge
      && dt1.user.name === dt2.user.name
      && dt1.user.color === dt2.user.color
      && dt1.user.userColor === dt2.user.userColor;
  };

  export default {
    name: 'Chat',

    props: {
      chatChannel   : { type: String },
      forceGlobal   : { type: Boolean },
      hydrationData : { type: Array },
    },

    components: {
      AddOns,
      ChatInput,
      ChatMessages,
      ChatPoll,
      ViewerList,
      ChatOverflowMenu,
      ChatPollVote,
      ChatRate,
      ViewRate,
      ChatAdminMenu,
    },

    data() {
      return {
        chatServer: chatServers.get( 'PROD' ),

        unsubscribeUser: null,
        unsubscribePoll: null,

        loading: true,
        socket: null,
        chatLimit: 50,
        userToken: null,

        messages: null,

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
          id: null,
          options: [
            { label:'', votes: 0 },
            { label:'', votes: 0 },
          ],
          owner: '',
          title: '',
          voteCount: 0,
        },

        sound: process.server ? null : new Audio(),

        willBeDestroyed: false,
        hideTrolls: false,
        cleanTTS: false,

        statInterval: null,
        longStatRate: 10,
        statTickCount: 0,

        newMessageCount: 0,
        showChatStats: false,
        chatStats: {
          display: false,
          value: [ 0 ],
          current: 0,
          min: 0,
          max: 0,
          average: 0,
          total: 0,
        },

        viewCount: 0,
        showViewStats: false,
        viewStats: {
          value: [ 0 ],
          current: 0,
          min: 0,
          max: 0,
          average: 0,
          total: 0,
        },

        adminActionsMenu: false,
        overflowMenu: false,
      }
    },

    methods: {
      async connectToChat () {

        await this.initChat();

        const tokenUser = {
          type  : 'unknown',
          token : this.getChatToken,
          page  : this.page,
        };

        this.connectChat( tokenUser );
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
            this.connectChat( tokenTroll );
          }
        }
      },

      async subscribeToUser ( uid ) {
        const userdocRef = db.collection( 'users' ).doc( uid );
        let lastUser = {};
        this.unsubscribeUser = userdocRef.onSnapshot( async doc => {

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
          if ( lastUser.avatar !== user.avatar || lastUser.username !== user.username || lastUser.color !== user.color || lastUser.badge !== user.badge ) {
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
                this.connectChat( tokenUser ); // Connect to chat server
              }
            };

            /*if ( !oldToken ) {
              await getNewToken();
            } else {
              setTimeout( () => getNewToken(), 5000 );
            }*/

            await getNewToken();
          }
          lastUser = user; // Record user state
        });
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

        this.socket.on( 'connect',    async ()    => await this.socketConnect() );
        this.socket.on( 'reconnect',  async ()    => await this.socketReconnect() );
        this.socket.on( 'error',      async error => await this.socketError( `Connection Failed`, error ) );
        this.socket.on( 'disconnect', async data  => await this.socketError( `Connection Lost`, data ) );

        this.socket.on( 'update usernames', async () => await this.updateViewers() );

        this.socket.on( 'bulkmessage', async data => await this.rcvMessageBulk( data ) );

        this.socket.on( 'blocked',   data => this.setMessage( data.message ) );
        this.socket.on( 'pollstate', data => this.updatePoll( data ) );

        if ( process.env.APP_DEBUG )
          this.socket.on( 'reconnecting', async attempt => await this.socketError( `Attempting to reconnect... (${ attempt })` ) );
      },

      async socketConnect () {
        if ( process.env.APP_DEBUG && false ) { // For testing...
          this.userToken.recaptcha = null;
        } else { // Get RECAPTCHA v3 Token
          this.userToken.recaptcha = await this.getRecaptchaToken( 'connect' );
        }

        // Attempt to connect...
        this.socket.emit( 'new user', this.userToken );
        this.loading = false;

        // Request poll hydration
        if ( this.showPollClient ) await this.socket.emit( 'hydratepoll', this.pollData.id );

        if ( this.willBeDestroyed ) {
          this.socket.off();
          this.socket.disconnect();
        }
      },

      async socketReconnect () {
        this.$toast.success( 'Chat reconnected!', { icon: 'done', duration: 1000, position: 'top-right' }  );
        console.log( 'Chat reconnected, requesting re-hydration' );
        await this.httpHydrate();
      },

      async socketError ( error, reason ) {
        this.loading = true;
        if ( process.env.APP_DEBUG && process.env.APP_DEBUG === 'true' )
          this.$toast.error( `${error}${reason ? `: ${reason}` : '' }`, { icon: 'error', duration: 2000, position: 'top-right' } );
      },

      async httpHydrate () {
        try {
          const { data } = await this.$axios.get( `https://chat.bitwave.tv/v1/messages${ this.global ? '' : `/${this.page}` }`, { progress: false } );
          await this.hydrate( data.data );
        } catch ( error ) {
          console.log( error );
        }
      },

      async hydrate ( data, isSSR ) {
        if ( !data && !isSSR ) {
          this.$toast.error( 'Error hydrating chat!', { icon: 'error', duration: 2000, position: 'top-right' } );
          console.log( 'Failed to receive hydration data' );
          return;
        }

        // Request poll hydration
        if ( this.pollData.id ) await this.socket.emit( 'hydratepoll', this.pollData.id );

        const size = data.length;
        if ( !size ) {
          this.messages = [];
          return console.log( 'Hydration data was empty' );
        }

        this.messages = data
          .filter( message => !this.filterMessage( message ) )
          .map( message => Object.freeze( message ) );

        // Scroll after hydration
        if ( process.client ) {
          this.$nextTick( async () => {
            if ( this.$refs['chatmessages'] ) this.$refs['chatmessages'].jumpToBottom();
            else console.warn( 'Failed to find chat container after hydration' );
          } );
        }
      },

      async rcvMessageBulk ( messages ) {
        const pattern = new RegExp( `@${this.username}\\b`, 'gi' );
        messages.forEach( el => {
          // Filter messages
          if ( this.filterMessage( el ) ) return;

          // Notification Sounds
          if ( this.notify ) if ( pattern.test( el.message ) ) this.sound.play().then();

          // For Text to Speech
          const currentChat = el.channel.toLowerCase() === this.username.toLowerCase();
          const myChat      = el.channel.toLowerCase() === this.page.toLowerCase();
          if ( currentChat || myChat ) this.speak( el.message, el.username ); // Say Message

          // Add message to list
          this.messages.push( Object.freeze( el ) );

          // Track message count
          if ( this.statInterval ) this.newMessageCount++;
        });

        /*if ( this.$refs['chatmessages'] ) {
          if ( !this.$refs['chatmessages'].showFAB ) {
            this.messages = this.messages.splice( -this.chatLimit );
          }
        } else {
          console.warn( `Failed to find 'chatmessages' component...` );
        }*/

        /*if ( !this.$refs['chatmessages'].showFAB ) {
          this.messages = this.messages.splice( -this.chatLimit );
        }*/

        if ( !this.$refs['chatmessages'].showFAB ) {
          if ( this.messages.length > 2 * this.chatLimit ) this.messages.splice( 0, this.messages.length - this.chatLimit );
          // this.scrollToBottom();
          this.$nextTick( () => this.scrollToBottom() );
        }
      },

      filterMessage ( message ) {

        // Remove ignored user messages
        if ( this.useIgnore && this.ignoreList.includes( message.username.toLowerCase() ) ) return true;

        // Do not ignore a channel we are in
        const ignoreChannellist = this.ignoreChannelList.filter( channel => channel.toLowerCase() !== this.page.toLowerCase() );

        // Remove ignored channel messages
        if ( ignoreChannellist.includes( message.channel.toLowerCase() ) ) return true;

        // Remove trolls
        if ( this.hideTrolls && message.username.startsWith( 'troll:' ) ) return true;

        // Local / Global filter
        if ( !this.global && !this.forceGlobal ) {
          const currChannel = message.channel.toLowerCase() === this.username.toLowerCase();
          const myChannel   = message.channel.toLowerCase() === this.page.toLowerCase();
          // if the message is NOT in the current channel AND NOT in our channel
          if ( !currChannel && !myChannel ) return true;
        }

        // Add username highlighting
        const pattern = new RegExp( `@${this.username}\\b`, 'gi' );
        message.message = message.message.replace( pattern, `<span class="highlight">$&</span>` );

        return false
      },

      onStatTick () {
        this.statTickCount++;

        // Long rate stat updates
        if ( this.statTickCount > this.longStatRate ) {
          // calc stats
          const calcStats = ( dataArr, newVal, oldTotal, defaultValue ) => {
            if ( newVal === null ) return;

            // Record length here to prevent skewing average
            let length = dataArr.push( newVal );
            // Place holder for data set in short tick updates
            dataArr.push( defaultValue );
            // Limit to 60 data snapshots
            const val = dataArr.splice( -120 );

            return {
              value: val,
              current: newVal,
              min: val.reduce( ( a, b ) => Math.min( a, b ) ),
              max: val.reduce( ( a, b ) => Math.max( a, b ) ),
              average: val.reduce( ( a, b ) => a + b ) / length,
              total: oldTotal + newVal,
            };
          };

          this.chatStats = calcStats( this.chatStats.value, this.newMessageCount, this.chatStats.total, 0 );
          this.viewStats = calcStats( this.viewStats.value, this.getChannelViews( this.page ), this.viewStats.total, this.getChannelViews( this.page ) );

          this.newMessageCount = 0;
          this.statTickCount   = 0;
        } else {
          // Short rate stat update
          this.chatStats.value.splice( this.chatStats.value.length - 1, 1, this.newMessageCount );
          this.viewStats.value.splice( this.viewStats.value.length - 1, 1, this.getChannelViews( this.page ) );
          this.chatStats.current = this.newMessageCount;
          this.viewStats.current = this.getChannelViews( this.page );
        }
      },

      async sendMessage () {
        if ( !this.getMessage || this.getMessage.length > 300 ) return false;

        const msg = {
          message   : this.getMessage,
          channel   : this.page,
          global    : this.global,
          showBadge : this.chatBadge,
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
              else await this.httpHydrate();
              // else if ( this.socket ) await this.socket.emit( 'hydrate' );
              break;
            case 'crc':
            case 'cuckrockchris':
            case 'cleantts':
              this.cleanTTS = !this.cleanTTS;
              await this.insertMessage( `Clean TTS: ${this.cleanTTS}` );
              break;
            case 'graph':
            case 'stats':
              if ( !this.showChatStats && this.showViewStats ) {
                this.showViewStats = false;
              }
              this.showChatStats = !this.showChatStats;
              break;
            case 'views':
              if ( !this.showViewStats && this.showChatStats ) {
                this.showChatStats = false;
              }
              this.showViewStats = !this.showViewStats;
              break;
            case 'ignorelist':
              await this.insertMessage( `Ignored Users: ${this.ignoreList.join(', ')}` );
              await this.insertMessage( `Ignored Channels: ${this.ignoreChannelList.join(', ')}` );
              this.$ga.event({
                eventCategory : 'chat',
                eventAction   : 'ignorelist',
              }); // Analytics
              break;
            case 'pin':
              const msgToPin = msg.message.replace(/\/pin\s/i, '');
              console.log( `User is ${this.isChannelOwner ? '' : 'not'} owner. '${msgToPin}'` );
              this.createPinnedMessage( msgToPin );
              break;
            case 'badge':
              this.setChatBadge( !this.chatBadge );
              await this.insertMessage( `Badge ${this.chatBadge ? 'on' : 'off'}` );
              break;
            case 'skip':
            case 's':
              speechSynthesis.cancel(); // Skip TTS
              break;
            case 'w':
            case 'whisper':
              msg.message = msg.message.replace( '/w', '!w' );
              this.socket.emit( 'message', msg );
              break;
          }
        } else {
          this.socket.emit( 'message', msg );
        }
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

      async getRecaptchaToken ( action ) {
        try {
          await this.$recaptcha.init();
          return await this.$recaptcha.execute( action );
        } catch ( error ) {
          console.error( error );
          return null;
        }
      },

      speak ( message, username ) {
        if ( !this.getUseTts ) return;  // Check that TTS is enabled
        if ( this.ignoreList.find( user => user === username ) ) return; // Don't read ignored users
        if ( !this.getTrollTts && /troll:\w+/.test( username ) ) return;         // disables troll TTS

        // Remove HTML related strings & links
        message = stripHTML( message );

        if ( this.cleanTTS ) {
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

        voice.onend = e => console.log( `TTS Finished in ${(e.elapsedTime / 1000).toFixed(1)} seconds.`, e );

        speechSynthesis.speak( voice );
      },


      // POLL FUNCTIONS -> SOCKET
      //-------------------------
      subscribeToPoll ( channel ) {
        this.unsubscribePoll = db
          .collection( 'polls' )
          .where( 'channel', '==', channel.toLowerCase() )
          .limit( 1 )
          .onSnapshot( async result => {
            if ( result.empty ) return;

            const doc = result.docs[0];

            this.pollData = doc.data();
            this.pollData.id = doc.id;

            this.showPollClient = this.pollData.display;

            this.onResize(); // Scroll to bottom when showing / hiding polls
          });
      },

      async createPoll ( poll ) {
        if ( this.pollData.id ) {
          const pollDocRef = db
            .collection( 'polls' )
            .doc( this.pollData.id );
          const data = {
            display: true,
            endsAt: new Date( Date.now() + poll.time * 60 * 1000 ),
            trollVotes: poll.allowTrollVotes,
            options: poll.options,
            title: poll.title,
            resultsSaved: false,
            voteCount: 0,
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
            resultsSaved: false,
            voteCount: 0,
          };
          this.pollData.id = await db
            .collection( 'polls' )
            .add( data );
        }
      },

      // Add user vote to poll with matching poll id
      votePoll ( vote ) {
        // should pass option number & poll id
        this.socket.emit( 'votepoll', { id: this.pollData.id, vote: vote } )
      },

      // Update poll with data from socket
      async updatePoll ( data ) {
        if ( this.pollData.id !== data.id ) return;
        console.log( `Update Poll: `, data );
        this.pollData.options = data.options;
        this.pollData.voteCount  = data.voteCount;
      },

      // Change end time to now to end poll instantly
      async endPoll () {
        // tell server to update poll and transfer data to client
        await db
          .collection( 'polls' )
          .doc( this.pollData.id )
          .update( {
            endsAt:  new Date( Date.now() ),
            options: this.pollData.options,
            resultsSaved: true,
            voteCount: this.pollData.voteCount,
          });
      },


      // Delete and hide poll
      async destroyPoll ( pollId ) {
        await db
          .collection( 'polls' )
          .doc( pollId )
          .update( { 'display': false, 'options': null } );
      },

      async ignoreUser ( username ) {
        username = username.replace('@', '');
        const exists = this.ignoreList.find( el => el.toLowerCase() === username.toLowerCase() );
        if ( exists ) {
          console.log( `User already ignored: '${username}'` );

          // Confirmation Message
          await this.insertMessage( `You already ignore '${username}'` );
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

          // Error Message
          await this.insertMessage( `You are not ignoring '${username}'` );
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

          // Confirmation Message
          await this.insertMessage( `You do not ignore ${username}'s channel` );
        }
      },

      ...mapMutations ({
        setChatToken: VStore.$mutations.setChatToken,
      }),

      ...mapMutations ( Chat.namespace, {
        setIgnoreList     : Chat.$mutations.setIgnoreList,
        setMessage        : Chat.$mutations.setMessage,
        appendChatMessage : Chat.$mutations.appendMessage,
        setPinnedMessage  : Chat.$mutations.setPinnedMessage,
        setChatBadge      : Chat.$mutations.setShowBadge,
      }),

      ...mapActions ({
        updateViewers: VStore.$actions.updateViewers,
      }),

      ...mapActions ( Chat.namespace, {
        loadSettings : Chat.$actions.loadSettings,
        initChat : Chat.$actions.init,
        logoutChat : Chat.$actions.logout,
        updateChatToken : Chat.$actions.updateChatToken,
        exchangeIdTokenChatToken: Chat.$actions.exchangeIdTokenChatToken,
      }),

      ...mapActions ( ChatConfig.namespace, {
        loadChatConfig      : ChatConfig.$actions.loadConfig,
        createPinnedMessage : ChatConfig.$actions.createPinnedMessage,
      }),

    },

    computed: {
      ...mapGetters({
        isAuth       : VStore.$getters.isAuth,
        isAdmin      : VStore.$getters.isAdmin,
        user         : VStore.$getters.getUser,
        _username    : VStore.$getters.getUsername,
        getChannelViews : VStore.$getters.getChannelViews,
      }),

      ...mapState ( Chat.namespace, {
        global            : Chat.$states.global,
        showTimestamps    : Chat.$states.timestamps,
        getUseTts         : Chat.$states.useTts,
        useIgnore         : Chat.$states.useIgnore,
        getTrollTts       : Chat.$states.trollTts,
        getTtsRate        : Chat.$states.ttsRate,
        getTtsVolume      : Chat.$states.ttsVolume,
        getTtsVoice       : Chat.$states.ttsVoice,
        notify            : Chat.$states.notify,
        getIgnoreList     : Chat.$states.ignoreList,
        getMessage        : Chat.$states.message,

        getChatToken      : Chat.$states.chatToken,
        displayName       : Chat.$states.displayName,

        chatBadge         : Chat.$states.showBadge,
      }),

      username () {
        return this.displayName || this._username || 'user';
      },

      isChannelOwner () {
        return this.page.toLowerCase() === this.username.toLowerCase();
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
    },

    watch: {
      async global ( val, old ) {
        await this.httpHydrate();
      },
    },

    async created () {
      // Hydrate chat from SSR or API
      /*if ( this.hydrationData ) await this.hydrate( this.hydrationData, true );
      else await this.httpHydrate();*/
    },

    async mounted () {
      this.unsubAuthChanged = auth.onAuthStateChanged( async user => await this.authenticated( user ) );

      await this.connectToChat();

      // Add listener for voice changes, then update voices.
      this.voicesListTTS = speechSynthesis.getVoices();
      speechSynthesis.onvoiceschanged = () => this.voicesListTTS = speechSynthesis.getVoices();

      // Load settings from localstorage
      await this.loadSettings();

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

      // Stat tracking interval
      this.statInterval = setInterval( () => this.onStatTick(), 1000 );

      // Setup Notification Sound
      this.sound.src = '/sounds/tweet.mp3';
      this.sound.volume = .25;

      // Hydrate chat from SSR or API
      if ( this.hydrationData ) await this.hydrate( this.hydrationData, true );
      else await this.httpHydrate();

      // Listen for new polls
      this.subscribeToPoll( this.page );

      // Get channel chat configuration
      // this.loadChatConfig( this.page );
    },

    beforeDestroy () {
      if ( this.unsubAuthChanged ) this.unsubAuthChanged();
      if ( this.unsubscribeUser )  this.unsubscribeUser();
      if ( this.unsubscribePoll )  this.unsubscribePoll();
      if ( this.statInterval ) clearInterval( this.statInterval );
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
      color: $bw-blue;
    }

    code .highlight {
      background-color: $bw-blue;
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
      -webkit-box-shadow: inset 0 0 4px rgba(0,0,0,0.25);
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
      -webkit-box-shadow: inset 0 0 4px rgba(0,0,0,.25);
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
