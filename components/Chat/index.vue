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
            <!-- Viewer List -->
            <v-menu
              v-model="showViewers"
              :close-on-content-click="false"
              :nudge-width="250"
              offset-y
              bottom
            >
              <template #activator="{ on }">
                <v-chip
                  v-on="on"
                  color="yellow"
                  text-color="black"
                >
                  {{ channelViews[page.toLowerCase()] ? channelViews[page.toLowerCase()].total : 0 }}
                  <v-icon right>account_circle</v-icon>
                </v-chip>
              </template>

              <v-card>
                <v-sheet color="yellow">
                  <v-card-title class="title black--text">({{ viewerCount }}) Live Viewers</v-card-title>
                </v-sheet>

                <v-layout style="max-height: 60vh; overflow: auto; overscroll-behavior: contain;">
                  <v-list
                    dense
                    two-line
                  >
                    <v-list-tile
                      avatar
                      v-for="viewer in viewerList"
                      :key="viewer.username"
                    >
                      <template v-if="viewerList.length > 0">
                        <v-list-tile-avatar>
                          <img v-if="!!viewer.avatar" :src="viewer.avatar" :alt="viewer.username">
                          <v-icon v-else :style="{ background: viewer.color || 'radial-gradient( yellow, #ff9800 )', color: !viewer.color && 'black' }">person</v-icon>
                        </v-list-tile-avatar>
                        <v-list-tile-content>
                          <v-list-tile-title>{{ viewer.username }}</v-list-tile-title>
                          <v-list-tile-sub-title v-if="viewer.page && viewer.page.watch">Chatting in: {{ `${viewer.page.watch} (${ channelViews[ viewer.page.watch.toLowerCase() ].total })` }}</v-list-tile-sub-title>
                          <v-list-tile-sub-title v-else-if="viewer.page">Just Watching {{`${viewer.page} (${ channelViews[ (viewer.page || '').toLowerCase() ].total })` }}</v-list-tile-sub-title>
                          <v-list-tile-sub-title v-else>Getting Soda</v-list-tile-sub-title>
                        </v-list-tile-content>
                      </template>
                    </v-list-tile>
                  </v-list>
                </v-layout>

              </v-card>
            </v-menu>
          </v-flex>

          <!-- Chat Label -->
          <v-flex grow ml-2>
            <h4>{{ page }}</h4>
          </v-flex>

          <!--<v-spacer/>-->

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
              :max-width="350"
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
                <v-list>
                  <v-list-tile>
                    <v-switch
                      v-model="global"
                      :label="`${ global ? 'Global' : 'Local' } Chat`"
                      class="ml-2 mt-0 pt-0"
                      :disabled="false"
                      color="yellow"
                      hide-details
                    ></v-switch>
                  </v-list-tile>
                  <v-list-tile>
                    <v-switch
                      v-model="useIgnoreListForChat"
                      @change="toggleUseIgnore"
                      label="Ignore chat messages"
                      class="ml-2 mt-0 pt-0"
                      color="yellow"
                      hide-details
                    ></v-switch>
                  </v-list-tile>

                  <v-divider/>

                  <v-list-tile>
                    <v-switch
                      v-model="useTTS"
                      label="Text to speech"
                      class="ml-2 mt-0 pt-0"
                      color="yellow"
                      hide-details
                      @change="toggleTTS"
                    ></v-switch>
                  </v-list-tile>
                  <v-list-tile>
                    <v-switch
                      v-model="allowTrollTTS"
                      :disabled="!useTTS"
                      label="Troll TTS"
                      class="ml-2 mt-0 pt-0"
                      color="yellow"
                      hide-details
                    ></v-switch>
                  </v-list-tile>
                </v-list>

                <v-divider/>

                <v-list two-line subheader>
                  <v-subheader>Text To Speech Options</v-subheader>
                  <v-list-tile v-if="false">
                    <v-text-field
                      v-model="selectionTTS"
                      type="number"
                      label="Voice ID"
                      min="0"
                      max="25"
                      single-line
                    ></v-text-field>
                  </v-list-tile>
                  <v-list-tile>
                    <v-select
                      v-model="selectionTTS"
                      :items="voices"
                      label="TTS Voice"
                    ></v-select>
                  </v-list-tile>
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
        :is-owner="pollData.owner === user.uid"
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
      <dynamic-scroller
        id="chat-scroll"
        ref="scroller"
        :items="messages"
        key-field="timestamp"
        :min-item-size="60"
        :buffer="400"
        :emitUpdate="false"
      >
        <dynamic-scroller-item
          slot-scope="{ item, index, active }"
          :item="item"
          :active="active"
          :size-dependencies="[]"
          :data-index="index"
        >
          <chat-message
            :key="item.timestamp"
            :username="item.username"
            :channel="item.channel"
            :timestamp="getTime(item.timestamp)"
            :avatar="item.avatar"
            :color="item.color"
            @reply="addUserTag"
          ><div v-html="item.message"></div>
          </chat-message>
        </dynamic-scroller-item>
      </dynamic-scroller>
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
              :color="dark ? 'yellow' : 'blue'"
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

  import { mapGetters } from 'vuex'

  import socketio from 'socket.io-client'

  import { DynamicScroller, DynamicScrollerItem } from 'vue-virtual-scroller'
  import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'

  import ChatPoll from '@/components/Chat/ChatPoll';
  import ChatPollVote from '@/components/Chat/ChatPollVote';

  export default {
    name: 'Chat',

    props: {
      enable: { type: Boolean, default: true },
      dark: { type: Boolean },
      chatChannel: { type: String },
    },

    components: {
      ChatPollVote,
      ChatPoll,
      ChatMessage,
      DynamicScroller,
      DynamicScrollerItem,
    },

    data() {
      return {
        color: null,
        unsubscribeUser: null,
        unsubscribePoll: null,
        loading: true,
        socket: null,
        message: '',
        messages: [
          {
            timestamp: Date.now(),
            username: 'Dispatch',
            avatar: 'https://cdn.bitwave.tv/uploads/avatar/19135417-ecc9-4957-8711-e7ac71ac0805-md',
            message: 'Loading messages...',
            channel: 'global',
          },
        ],
        ignoreList: [],
        uid: null,
        viewerCount: 0,
        chatLimit: 150,
        chatContainer: null,

        showToolMenu: false,
        useIgnoreListForChat: false,
        useTTS: false,
        allowTrollTTS: true,
        selectionTTS: 1,
        rateTTS: 10.00,
        voicesListTTS: [],

        showViewers: false,
        viewers: [{name: 'NONE'}],
        channelViews: {},

        showPoll: false,

        showPollClient: false,
        pollData: {
          channel: '',
          display: false,
          endsAt: 0,
          id: '',
          options: {
            a: { label:'', votes: 0 },
            b: { label:'', votes: 0 },
          },
          owner: '',
          title: '',
        },

        global: true,
      }
    },

    methods: {
      addUserTag (user) {
        this.message = `${this.$refs['chatmessageinput'].value}@${user} `;
        this.$refs['chatmessageinput'].focus();
      },

      authenticated (user) {
        if (user) {
          this.subscribeToUser(user.uid);
        } else {
          if (this.unsubscribeUser) this.unsubscribeUser();
          const trollUser = {
            type     : 'troll',
            username : `troll:${this.uid}`,
            color    : this.color,
            email    : null,
            uid      : this.uid,
            page     : this.page,
          };
          this.connectChat(trollUser);
        }
        this.loading = false;
      },

      subscribeToUser (uid) {
        const userdocRef = db.collection('users').doc(uid);
        this.unsubscribeUser = userdocRef.onSnapshot( doc => {
          const user = doc.data();
          user.page  = this.page;
          this.connectChat(user);
        });
      },

      subscribeToPoll (channel) {
        channel = channel.toLowerCase();
        const pollDocRef = db.collection('polls').where('channel', '==', channel).limit(1);
        this.unsubscribePoll = pollDocRef.onSnapshot( result => {
          if (result.empty) return;

          const doc = result.docs[0];

          this.pollData = doc.data();
          this.pollData.id = doc.id;

          this.showPollClient = this.pollData.display;
        });
      },

      async scrollToBottom (force) {
        const scrollTop = this.chatContainer.$el.scrollTop;
        const scrollHeight = this.chatContainer.$el.scrollHeight;
        const scrollDistance = scrollHeight - scrollTop;
        const scroll = !!force || scrollDistance < ( 1.25 * screen.height );
        console.debug(`ScrollTop: ${scrollTop} ScrollHeight: ${scrollHeight} ScrollDistance: ${scrollDistance} Scroll: ${scroll}`);
        if ( scroll ) {
          // await this.$nextTick( () => this.chatContainer.$el.scrollTop = scrollHeight + 500 );
          // if (this.messages.length > this.chatLimit) this.messages.shift();
          this.messages = this.messages.length > 100 ? this.messages.splice(-this.chatLimit) : data;
          setTimeout( () => this.chatContainer.$el.scrollTop = scrollHeight + 500, 250 );
        }
      },

      scrollToChatBottom () {
        this.$nextTick( () => this.$refs.scroller.scrollToBottom() );
      },

      connectChat (user) {
        if (this.socket) {
          this.socket.disconnect();
        }

        if (!user) {
          console.warn(`Failed to connect to chat. No user defined.`);
          return;
        }
        console.debug('Chat User:', user);

        const socket = socketio( 'chat.bitwave.tv', { transports: ['websocket'] } );
        // const socket = socketio('chat.bitwave.tv');
        // const socket = socketio('api.bitwave.tv:443', { transports: ['websocket'] });
        // const socket = socketio('api.bitwave.tv:443');

        socket.on( 'connect', () => socket.emit('new user', user) );
        socket.on( 'update usernames', data => this.updateUsernames(data) );
        socket.on( 'hydrate', async data => await this.hydrate(data) );
        socket.on( 'message', async data => await this.rcvMessage(data) );
        socket.on( 'blocked', data => this.message = data.message );

        // socket.on( 'showpoll',    data => this.displayPoll(data) );
        // socket.on( 'destroypoll', data => this.removePoll(data) );
        socket.on( 'pollstate',   data => this.updatePoll(data) );

        this.socket = socket;
      },

      updateUsernames (data) {
        // Create unique list of users
        const key = 'username';
        this.viewers = data.reduce( (accumulator, current) => {
          if (!accumulator.find( obj => obj[key] === current[key] )) accumulator.push(current);
          return accumulator;
        }, []);

        // Create list of unique viewers in channel
        this.channelViews = data.reduce( (accumulator, user) => {
          let username = user.username;
          let channel  = user.page ? user.page.watch || user.page : 'global' ;
          if ( !channel ) {
            // console.warn(user);
            return accumulator;
          }
          if ( typeof(channel) === 'string' ) channel = channel.toLowerCase();

          if (username) username = username.toLowerCase();

          // console.log(`[${channel}] - ${user.username}`); // Log Shit

          if ( channel in accumulator ) {
            if ( username in accumulator[channel] ) {
              accumulator[channel][username].push(user);
            } else {
              accumulator[channel][username] = [ user ];
              accumulator[channel].total++;
            }
          } else {
            accumulator[channel] = {};
            accumulator[channel][username] = [ user ];
            accumulator[channel].total = 1;
          }
          return accumulator;
        }, {});
        this.viewerCount = this.viewers.length;
      },

      async hydrate (data) {
        const size = data.length;
        this.messages = size > 100 ? data.splice(-this.chatLimit) : data;
        await this.$nextTick( async () => await this.scrollToBottom(true) );
        // re-highlight username mentions on hydration
        const pattern = new RegExp( `@${this.username}\\b`, 'gi' );
        this.messages.forEach( msg => {
          msg.message = msg.message.replace(pattern, `<span class="highlight">$&</span>`);
        });
      },

      async rcvMessage (message) {
        if ( !this.enable ) return;

        if(this.useIgnoreListForChat){
          if ( this.ignoreList.includes( message.username) ) return;
        }

        if ( !this.global ) {
          const notCurrentChat = message.channel.toLowerCase() !== this.page.toLowerCase();
          const notUserChat    = message.channel.toLowerCase() !== this.username.toLowerCase();
          if ( notCurrentChat && notUserChat ) return;
        }

        // Highlight username tags in new messages
        const pattern = new RegExp(`@${this.username}\\b`, 'gi' );
        message.message = message.message.replace(pattern, `<span class="highlight">$&</span>`);

        // For Text to Speech
        const currentChat = message.channel.toLowerCase() === this.username.toLowerCase();
        const myChat      = message.channel.toLowerCase() === this.page.toLowerCase();
        if ( currentChat || myChat ) this.speak(message.message, message.username); // Say Message

        this.messages.push({ ...{ channel: 'null', id: Date.now() }, ...message });
        await this.$nextTick( async () => await this.scrollToBottom() );
      },

      sendMessage () {
        if (this.message.length > 300) return false;

        const match = /^\/(\w+)\s?(\w+)?/g.exec(this.message);
        const parts = this.message.split(' ');

        if (match) {
          const command  = match[1];
          const argument = parts[1]; //match[2];

          switch (command) {
            case 'ignore':
              const exists = this.ignoreList.find( el => el.toLowerCase() === argument.toLowerCase() );
              if (!exists) {
                this.ignoreList.push(argument);
                localStorage.setItem('ignorelist', JSON.stringify(this.ignoreList));
              }
              break;
            case 'unignore':
              const location = this.ignoreList.findIndex( el => el === argument );
              if (location) {
                this.ignoreList.splice(location, 1);
                localStorage.setItem('ignorelist', JSON.stringify(this.ignoreList));
              }
              break;
            case 'skip':
            case    's':
              speechSynthesis.cancel();
              break;
            case 'w':
            case 'whisper':
              const msg = {
                message: this.message,
                channel: this.page,
              };
              this.socket.emit('whisper', msg);
          }
        } else {
          const msg = {
            message: this.message,
            channel: this.page,
          };
          this.socket.emit('message', msg);
        }
        this.message = '';
      },

      setupTrollData () {
        let uid   = localStorage.getItem('tuid');
        let color = localStorage.getItem('tcolor');
        if (!uid || !color) {
          uid   = [...Array(4)].map(() => (~~(Math.random()*36)).toString(36)).join('');
          color = `hsl( ${Math.round(256 * Math.random())},75%,50%,1)`;
          localStorage.setItem('tuid'  , uid  );
          localStorage.setItem('tcolor', color);
        }
        this.uid   = uid;
        this.color = color
      },

      speak ( message, username ) {
        if ( !this.useTTS ) return;
        if ( this.ignoreList.find( user => user === username ) ) return;
        if ( !this.allowTrollTTS && /troll:\w+/.test(username) ) return; // disables troll TTS

        function unescapeHtml(unsafe) {
          return unsafe
            .replace(/&amp;/g,  `&`)
            .replace(/&lt;/g,   `<`)
            .replace(/&gt;/g,   `>`)
            .replace(/&quot;/g, `"`)
            .replace(/&#39;/g,  `'`)
        }

        message = unescapeHtml( message ); // Fixes escaped characters

        // Remove Links
        message = message.replace(/((https?:\/\/)|(www\.))[^\s]+/gi, '');

        // Remove html tags
        message = message.replace(/<\/?[^>]*>/g, '');

        // const voicesTTS = speechSynthesis.getVoices();

        const voice = new SpeechSynthesisUtterance();
        const pitch = .9;
        voice.voice = this.voicesListTTS[this.selectionTTS];
        voice.rate  = this.rateTTS / 10.0;
        voice.pitch = pitch;
        voice.text  = message;

        voice.onend = function(e) {
          console.log(`Finished in ${e.elapsedTime} seconds.`, e);
        };

        speechSynthesis.speak(voice);
      },

      toggleTTS () {
        speechSynthesis.cancel();
        localStorage.setItem( 'tts', this.useTTS );
      },



      // POLL FUNCTIONS -> SOCKET
      //-------------------------
      async createPoll (poll) {
        // this.showPoll = false;
        // poll.id = [...Array(8)].map(() => (~~(Math.random()*36)).toString(36)).join('');
        // this.socket.emit('createpoll', poll);

        if ( this.pollData.id ) {
          const pollDocRef = db.collection('polls').doc(this.pollData.id);
          const data = {
            display: true,
            endsAt: new Date( Date.now() + 1.5 * 600000 ),
            options: poll.options,
            title: poll.title,
          };
          await pollDocRef.update(data);
        } else {
          const data = {
            channel: this.page.toLowerCase(),
            display: true,
            endsAt: new Date( Date.now() + 1.5 * 600000 ),
            options: poll.options,
            owner: this.user.uid,
            title: poll.title,
          };
          this.pollData.id = await db.collection('polls').add(data);
        }
      },

      // Add user vote to poll with matching poll id
      votePoll (vote) {
        // should pass option number & poll id
        this.socket.emit('votepoll', { id: this.pollData.id, vote: vote })
      },

      // Change end time to now to end poll instantly
      endPoll (pollId) {
        // this.socket.emit('endpoll', pollId)
      },

      async destroyPoll (pollId) {
        const pollRef = db.collection('polls').doc(pollId);
        await pollRef.update({ 'display': false, 'options': null });
      },

      async updatePoll (data) {
        this.pollData.options = data.options;
        this.pollData.voters = data.voters;
      },

      // FUNCTIONS THAT REACT TO POLL SOCKET UPDATES
      //--------------------------------------------
      /*displayPoll (poll) {
        console.log(poll);

        // Only show poll if you are in the channel
        if ( poll.channel !== this.page.toLowerCase() ) return;

        this.pollData = {
          id      : poll.id,
          channel : poll.channel,
          title   : poll.title,
          options : poll.options,
          time    : poll.time,
        };

        this.showPollClient = true;
      },

      removePoll (id) {
        if ( this.pollData.id === id ) {
          this.showPollClient = false;
        }
      },*/



      getTime (timestamp) { return `[${moment(timestamp).format('HH:mm')}]`; },

      toggleUseIgnore () { localStorage.setItem( 'useignore', this.useIgnoreListForChat ); }
    },

    computed: {
      ...mapGetters({
        user: 'user',
        _username: 'username',
      }),

      username () {
        return this._username || `troll:${this.uid}`;
      },

      page () {
        let channel = this.chatChannel;
        if (channel) {
          if (channel.match(/^[a-zA-Z0-9._-]+$/))
            return channel;
          else
            return '404';
        } else {
          return 'Global';
        }
      },

      voices () {
        return this.voicesListTTS.map( (voice, index) => { return { text: voice.name, value: index } } );
      },

      viewerList () {
        if ( this.showViewers ) return this.viewers;
        else  return [];
      }
    },

    created() {
      auth.onAuthStateChanged(async user => await this.authenticated(user));
    },

    mounted() {
      this.setupTrollData();
      this.chatContainer = this.$refs.scroller;

      // Add listener for voice changes, then update voices.
      speechSynthesis.onvoiceschanged = () => this.voicesListTTS = speechSynthesis.getVoices();
      this.$nextTick( () => this.voicesListTTS = speechSynthesis.getVoices() );

      try {
        let ignores = localStorage.getItem('ignorelist');
        if ( ignores ) this.ignoreList = JSON.parse(ignores);
      } catch (e) {
        console.log('No ignore list found.');
      }
      try {
        let useIgnore = localStorage.getItem('useignore');
        if ( useIgnore ) this.useIgnoreListForChat = useIgnore;
      } catch (e) {
        console.log('No useIgnore option found.');
      }
      try {
        let tts = localStorage.getItem('tts');
        if ( tts ) this.useTTS = tts;
      } catch (e) {
        console.log('No tts option found.');
      }
      if ( this.enable ) {
        this.useTTS = false;
        this.subscribeToPoll(this.page);
      }
    },

    beforeDestroy() {
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
