<template>
  <v-layout
    id="sidechat"
    column
    fill-height
  >

    <!-- Chat Header -->
    <v-flex id="chat-header">
      <v-sheet>
        <v-layout
          align-center
          class="pa-2"
        >
          <!-- Viewer List -->
          <v-flex shrink>
            <ViewerList :page="page" />
          </v-flex>

          <!-- Chat Label -->
          <v-flex grow ml-2>
            <h4>{{ page }}</h4>
          </v-flex>

          <!-- Create Poll Button -->
          <v-flex
            v-if="page === username"
            shrink
          >
            <v-menu
              v-model="showPoll"
              :close-on-content-click="false"
              bottom
              left
            >
              <template #activator="{ on }">
                <v-btn
                  v-on="on"
                  :style="{ 'min-width': '40px' }"
                  small
                  light
                  :disabled="showPollClient"
                  color="yellow"
                  @click="scrollToBottom(true)"
                >POLL</v-btn>
              </template>

              <!-- Create Poll Dialog -->
              <chat-poll
                id="chat-poll"
                @close="showPoll = false"
                @create="createPoll"
              />

            </v-menu>
          </v-flex>

            <!-- Tools -->
          <v-flex shrink>
            <v-menu
              v-model="showToolMenu"
              :close-on-content-click="false"
              transition="slide-x-reverse-transition"
              :max-width="320"
              bottom
              offset-x
              offset-y
            >
              <template #activator="{ on }">
                <v-btn
                  v-on="on"
                  :style="{ 'min-width': '40px' }"
                  small
                  light
                  color="yellow"
                  @click="scrollToBottom(true)"
                >
                  <v-icon>settings</v-icon>
                </v-btn>
              </template>

              <v-card>
                <v-sheet color="yellow">
                  <v-layout class="pl-2" align-center>
                    <v-flex>
                      <h5 class="black--text body-1">Settings</h5>
                    </v-flex>
                    <v-flex shrink>
                      <v-btn
                        color="black"
                        flat
                        icon
                        pa-0
                        @click="showToolMenu = false"
                      >
                        <v-icon color="black">close</v-icon>
                      </v-btn>
                    </v-flex>
                  </v-layout>
                </v-sheet>

                <v-list>
                  <v-list-tile>
                    <v-switch
                      v-model="global"
                      :label="`${ global ? 'Global' : 'Local' } Chat`"
                      class="ml-0 mt-0 pt-0"
                      :disabled="false"
                      color="yellow"
                      hide-details
                    ></v-switch>
                    <v-switch
                      v-model="showTimestamps"
                      label="Timestamps"
                      class="ml-2 mt-0 pt-0"
                      color="yellow"
                      hide-details
                    ></v-switch>
                  </v-list-tile>
                  <v-list-tile>
                    <v-switch
                      v-model="useIgnoreListForChat"
                      @change="toggleUseIgnore"
                      label="Ignore chat messages"
                      class="ml-0 mt-0 pt-0"
                      color="yellow"
                      hide-details
                    ></v-switch>
                  </v-list-tile>
                </v-list>

                <v-divider/>

                <v-list subheader pb-2>
                  <v-subheader class="mb-0">Text To Speech Options</v-subheader>

                  <v-layout mb-3>
                    <v-flex>
                      <v-switch
                        v-model="useTTS"
                        label="Use TTS"
                        class="ml-3 mt-0 pt-0"
                        color="yellow"
                        hide-details
                        @change="toggleTTS"
                      ></v-switch>
                    </v-flex>
                    <v-flex>
                      <v-switch
                        v-model="allowTrollTTS"
                        v-show="useTTS"
                        label="Troll TTS"
                        class="ml-0 mt-0 pt-0"
                        color="yellow"
                        hide-details
                      ></v-switch>
                    </v-flex>
                  </v-layout>

                  <v-flex mx-3>
                    <v-select
                      v-model="selectionTTS"
                      :items="voices"
                      label="TTS Voice"
                      style="font-size: 12px;"
                      hide-details
                    ></v-select>
                  </v-flex>

                  <v-list-tile>
                    <v-slider
                      label="Speed"
                      v-model="rateTTS"
                      class="align-center"
                      :max="20"
                      :min="1"
                      :step="0"
                      hide-details
                    >
                      <template #append>
                        <v-text-field
                          v-model="rateTTS"
                          class="mt-0 pt-0"
                          hide-details
                          single-line
                          type="number"
                          style="width: 40px"
                        ></v-text-field>
                      </template>
                    </v-slider>
                  </v-list-tile>
                </v-list>
              </v-card>
            </v-menu>
          </v-flex>

          <!-- Scroll to Chat Bottom -->
          <v-flex shrink v-show="enable">
            <!-- Scroll to bottom button -->
            <v-btn
              :style="{ 'min-width': '40px' }"
              small
              light
              color="yellow"
              @click="scrollToBottom(true)"
            ><v-icon>keyboard_arrow_down</v-icon>
            </v-btn>
          </v-flex>

        </v-layout>
      </v-sheet>
    </v-flex>

    <v-divider/>

    <!-- Show Poll to Users -->
    <v-flex>
      <chat-poll-vote
        v-if="showPollClient"
        :poll-data="pollData"
        :is-owner="pollData.owner === (user ? user.uid : null)"
        @vote="votePoll"
        @end="endPoll"
        @destroy="destroyPoll"
      />
    </v-flex>

    <v-flex
      v-show="enable"
      id="inner-chat"
      fill-height
      style="overflow: hidden;"
    >
      <div id="chat-scroll" ref="scroller" style="overflow-y: scroll;">
        <chat-message
          v-for="item in messages"
          :key="item.timestamp"
          :username="item.username"
          :display-name="item.username"
          :user-styling="{ color: item.userColor ? item.userColor : '#9e9e9e' }"
          :channel="item.channel"
          :timestamp="getTime(item.timestamp)"
          :avatar="item.avatar"
          :color="item.color"
          @reply="addUserTag"
        ><div v-html="item.message"></div>
        </chat-message>
      </div>
    </v-flex>

    <v-divider/>

    <!-- Chat Input -->
    <v-flex v-show="enable">
      <v-sheet>
        <v-layout
          row
          justify-center
          pb-1
          px-3
        >
          <v-flex>
            <v-text-field
              ref="chatmessageinput"
              :value="message"
              :label="`Chat as ${username}...`"
              color="yellow"
              autocomplete="off"
              autocorrect="off"
              autocapitalize="off"
              spellcheck="true"
              single-line
              append-outer-icon="send"
              counter="300"
              validate-on-blur
              @change="value => this.message = value"
              @click:append-outer.prevent="sendMessage"
              @keyup.enter.prevent="sendMessage"
              @keyup.prevent="event => lastMessageHandler(event)"
              @cut="event => lastMessageHandler(event)"
            ></v-text-field>
          </v-flex>
        </v-layout>
      </v-sheet>
    </v-flex>
  </v-layout>
</template>

<script>
  import { auth, db } from '@/plugins/firebase.js'
  import ChatMessage from './ChatMessage'
  import moment from 'moment'
  import jwt_decode from 'jwt-decode'

  import { mapGetters } from 'vuex'

  import socketio from 'socket.io-client'

  import ChatPoll from '@/components/Chat/ChatPoll'
  import ChatPollVote from '@/components/Chat/ChatPollVote'

  import { mapState, mapMutations, mapActions } from 'vuex'
  import ViewerList from '@/components/Chat/ViewerList'

  export default {
    name: 'Chat',

    props: {
      enable      : { type: Boolean, default: true },
      dark        : { type: Boolean },
      chatChannel : { type: String },
      forceGlobal : { type: Boolean },
    },

    components: {
      ViewerList,
      ChatPollVote,
      ChatPoll,
      ChatMessage,
    },

    data() {
      return {
        color: null,

        unsubscribeUser: null,
        unsubscribePoll: null,

        loading: true,

        socket: null,
        message: '',
        lastMessage: '',
        messages: [
          {
            timestamp: Date.now(),
            username: 'Dispatch',
            avatar: 'https://cdn.bitwave.tv/static/img/glitchwave.gif',
            message: 'Loading messages...',
            channel: 'global',
          },
        ],

        token: null,

        ignoreList: [],
        ignoreChannelList: [],
        trollId: null,
        chatLimit: 50,
        chatContainer: null,

        showToolMenu: false,
        useIgnoreListForChat: false,
        useTTS: false,
        allowTrollTTS: true,
        selectionTTS: 1,
        rateTTS: 10.00,
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

      }
    },

    methods: {
      addUserTag ( user ) {
        this.message = `${this.$refs['chatmessageinput'].value}@${user} `;
        this.$refs['chatmessageinput'].focus();
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
        this.loading = false;
      },

      async subscribeToUser ( uid ) {
        const userdocRef = db.collection( 'users' ).doc( uid );
        let lastUser = {};
        this.unsubscribeUser = userdocRef.onSnapshot( async doc => {

          // Swap ID token for Chat Token
          const idToken = await auth.currentUser.getIdToken();
          console.log( `ID Token Generated in chat:`, idToken );
          const { data } = await this.$axios.post( `https://api.bitwave.tv/api/token`, { token: idToken } );
          const chatToken = data.chatToken;
          console.log( 'Chat Token Exchanged:', chatToken );

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
          if ( lastUser.avatar !== user.avatar || lastUser.username !== user.username ) {
            const tokenUser = {
              type  : 'user',
              token : chatToken,
              page  : this.page,
            };
            this.connectChat( tokenUser );
          }

          // Record user
          lastUser = user;
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
        });
      },

      checkIfBottom () {
        const scrollTop    = this.chatContainer.scrollTop;
        const clientHeight = this.chatContainer.clientHeight; // or offsetHeight
        const scrollHeight = this.chatContainer.scrollHeight;
        return scrollTop + clientHeight >= scrollHeight;
      },

      async scrollToBottom ( force ) {
        if ( this.checkIfBottom() ) return;

        // Scroll to last message
        document.querySelector("#chat-scroll > div:last-child").scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });

        setTimeout( () => {
          if ( !this.checkIfBottom() ) this.scrollToBottom()
        }, 250);

        if (this.messages.length > 2 * this.chatLimit) this.messages = this.messages.splice( -this.chatLimit );

        // ----------------

        // const scrollDistance = scrollHeight - scrollTop - this.chatContainer.clientHeight;
        // const scroll = !!force || scrollDistance < ( 0.55 * screen.height );

        // console.debug(`ScrollTop: ${scrollTop} ScrollHeight: ${scrollHeight} ScrollDistance: ${scrollDistance} Scroll: ${scroll}`);

        // if ( scroll ) {
          // await this.$nextTick( () => this.chatContainer.$el.scrollTop = scrollHeight + 500 );
          // if (this.messages.length > this.chatLimit) this.messages.shift();

          // if (this.messages.length > 2 * this.chatLimit) this.messages = this.messages.splice( -this.chatLimit );

          // setTimeout( () => this.chatContainer.scrollTop = scrollHeight + 750, 0 );

          // this.chatContainer.scrollTop = scrollHeight + 750

          // document.querySelector("#chat-scroll > div:last-child").scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
        // }
      },

      connectChat ( tokenUser ) {
        if ( this.socket) {
          this.socket.disconnect();
        }

        if ( !tokenUser ) {
          console.warn( `Failed to connect to chat. No user defined.` );
          return;
        }

        this.socket = socketio( 'chat.bitwave.tv', { transports: ['websocket'] } );
        // const socket = socketio('chat.bitwave.tv');

        this.socket.on( 'connect', () => this.socket.emit( 'new user', tokenUser ) );
        this.socket.on( 'update usernames', async data => await this.updateViewerlist( data ) );

        this.socket.on( 'hydrate', async data => await this.hydrate( data ) );
        this.socket.on( 'bulkmessage', async data => await this.rcvMessageBulk( data ) );

        this.socket.on( 'blocked',   data => this.message = data.message );
        this.socket.on( 'pollstate', data => this.updatePoll( data ) );

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

        this.messages = size > 100 ? data.splice( -this.chatLimit ) : data;
        await this.$nextTick( async () => {
          this.chatContainer.scrollTop = this.chatContainer.scrollHeight + 750
        });
        // re-highlight username mentions on hydration
        const pattern = new RegExp( `@${this.username}\\b`, 'gi' );
        this.messages.forEach( msg => {
          msg.message = msg.message.replace( pattern, `<span class="highlight">$&</span>` );
        });
      },

      async rcvMessageBulk ( messages ) {
        if ( !this.enable ) return;

        // Remove ignored user messages
        if ( this.useIgnoreListForChat ){
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
          // Highlight username tags in new messages
          el.message = el.message.replace( pattern, `<span class="highlight">$&</span>` );

          // For Text to Speech
          const currentChat = el.channel.toLowerCase() === this.username.toLowerCase();
          const myChat      = el.channel.toLowerCase() === this.page.toLowerCase();
          if ( currentChat || myChat ) this.speak( el.message, el.username ); // Say Message

          // Add message to list
          this.messages.push( { ...{ id: Date.now() }, ...el } );
        });

        if ( this.checkIfBottom() ) await this.$nextTick( async () => await this.scrollToBottom() );
      },

      async sendMessage () {
        if ( this.message.length > 300 ) return false;

        const match = /^\/(\w+)\s?(\w+)?/g.exec( this.message );
        const parts = this.message.split( ' ' );

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
              await this.rcvMessageBulk([
                {
                  timestamp: Date.now(),
                  username: '[bitwave.tv]',
                  avatar: 'https://cdn.bitwave.tv/static/img/glitchwave.gif',
                  message: `Ignored Users: ${this.ignoreList.join(', ')}`,
                  channel: this.page,
                },
                {
                  timestamp: Date.now(),
                  username: '[bitwave.tv]',
                  avatar: 'https://cdn.bitwave.tv/static/img/glitchwave.gif',
                  message: `Ignored Channels: ${this.ignoreChannelList.join(', ')}`,
                  channel: this.page,
                },
              ]);
              // Analytics
              this.$ga.event({
                eventCategory : 'chat',
                eventAction   : 'ignorelist',
              });
              break;
            case 'skip':
            case 's':
              speechSynthesis.cancel();
              break;
            case 'w':
            case 'whisper':
              const msg = {
                message: this.message,
                channel: this.page,
              };
              this.socket.emit( 'whisper', msg );
          }
        } else {
          const msg = {
            message: this.message,
            channel: this.page,
          };
          this.socket.emit( 'message', msg );
        }
        this.lastMessage = this.message;
        this.message = '';
      },

      lastMessageHandler ( event ) {
        if ( !event.srcElement.value ) {
          if ( event.keyCode == 38 ) {
            this.message = this.lastMessage;
          } else {
            this.message = '';
          }
        }

        if ( event.type === "cut" ) {
          setTimeout( () => {
            if ( !event.srcElement.value ) {
              this.message = '';
            }
          }, 20 );
        }
      },

      async setupTrollData () {
        let trollToken = localStorage.getItem( 'troll' );
        if ( !trollToken ) {
          const { data } = await this.$axios.get('https://api.bitwave.tv/api/troll-token');
          trollToken = data.chatToken;
          localStorage.setItem( 'troll', trollToken );
        }
        this.token = trollToken;
        this.trollId = jwt_decode(trollToken).user.name;
      },

      speak ( message, username ) {
        if ( !this.useTTS ) return;
        if ( this.ignoreList.find( user => user === username ) ) return;
        if ( !this.allowTrollTTS && /troll:\w+/.test(username) ) return; // disables troll TTS

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
        voice.voice = this.voicesListTTS[this.selectionTTS];
        voice.rate  = this.rateTTS / 10.0;
        voice.pitch = pitch;
        voice.text  = message;

        voice.onend = function(e) {
          console.log( `Finished in ${e.elapsedTime} seconds.`, e );
        };

        speechSynthesis.speak(voice);
      },

      toggleTTS () {
        speechSynthesis.cancel();
        localStorage.setItem( 'tts', this.useTTS );
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

      getTime ( timestamp ) { return this.showTimestamps ? `[${moment( timestamp ).format( 'HH:mm' )}]` : ''; },

      toggleUseIgnore () {
        localStorage.setItem( 'useignore', this.useIgnoreListForChat );
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
          await this.rcvMessageBulk([
            {
              timestamp: Date.now(),
              username: '[bitwave.tv]',
              avatar: 'https://cdn.bitwave.tv/static/img/glitchwave.gif',
              message: `Ignored User: ${username}`,
              channel: this.page,
            },
          ]);
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
          await this.rcvMessageBulk([
            {
              timestamp: Date.now(),
              username: '[bitwave.tv]',
              avatar: 'https://cdn.bitwave.tv/static/img/glitchwave.gif',
              message: `Unignored User: ${username}`,
              channel: this.page,
            },
          ]);
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
          await this.rcvMessageBulk([
            {
              timestamp: Date.now(),
              username: '[bitwave.tv]',
              avatar: 'https://cdn.bitwave.tv/static/img/glitchwave.gif',
              message: `Ignored Channel: ${channel}`,
              channel: this.page,
            },
          ]);
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
          await this.rcvMessageBulk([
            {
              timestamp: Date.now(),
              username: '[bitwave.tv]',
              avatar: 'https://cdn.bitwave.tv/static/img/glitchwave.gif',
              message: `Unignored Channel: ${channel}`,
              channel: this.page,
            },
          ]);
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
      }),

      global: {
        set ( val ) { this.setModeGlobal( val ) },
        get () { return this.getModeGlobal }
      },

      showTimestamps: {
        set ( val ) { this.setModeTimestamps( val ) },
        get () { return this.getModeTimestamps }
      },

      username () { return this._username || this.trollId; },

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

      voices () {
        return this.voicesListTTS.map( ( voice, index ) => { return { text: voice.name, value: index } } );
      },

    },

    created () {
      auth.onAuthStateChanged( async user => await this.authenticated( user ) );
    },

    async mounted () {
      await this.setupTrollData();
      this.chatContainer = this.$refs.scroller;

      // Add listener for voice changes, then update voices.
      speechSynthesis.onvoiceschanged = () => this.voicesListTTS = speechSynthesis.getVoices();
      this.$nextTick( () => this.voicesListTTS = speechSynthesis.getVoices() );

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
        let useIgnore = localStorage.getItem( 'useignore' );
        if ( !!useIgnore ) this.useIgnoreListForChat = JSON.parse( useIgnore );
      } catch ( error ) {
        console.log( 'No useIgnore option found.' );
      }

      try {
        const showTimestamps = localStorage.getItem( 'showtimestamps' );
        if ( !!showTimestamps ) this.showTimestamps = showTimestamps;
        else this.showTimestamps = true;
      } catch ( error ) {
        console.log( 'No showTimestamps option found.' );
        this.showTimestamps = true;
      }

      try {
        const global = localStorage.getItem( 'globalchat' );

        if ( !!global ) this.setModeGlobal( global );
        else this.setModeGlobal( false );

      } catch ( error ) {
        console.log( 'No showTimestamps option found.' );
        this.setModeGlobal( true );
      }

      try {
        let tts = localStorage.getItem( 'tts' );
        // if ( tts ) this.useTTS = tts;
      } catch ( error ) {
        console.log( 'No tts option found.' );
      }

      if ( this.enable ) {
        // this.useTTS = false;
        this.subscribeToPoll( this.page );
      }

      /*if (this.query.tts === true) {
        this.useTTS = true;
      }*/
    },

    beforeDestroy () {
      if ( this.unsubscribeUser ) this.unsubscribeUser();
      if ( this.unsubscribePoll ) this.unsubscribePoll();
      if ( this.socket ) this.socket.disconnect();
    },
  }
</script>

<style lang='scss'>
  #chat-poll {
    button {
      /*min-width: 55px;*/
    }
  }

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
    margin-right: 2px;
    overscroll-behavior: contain;

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
