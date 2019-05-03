<template>
  <v-layout
    id="sidechat"
    column
    fill-height
  >
    <!-- Chat Header -->
    <v-flex id="chat-header">
      <v-sheet>
        <v-layout align-center class="pa-2">
          <v-flex shrink>
            <v-menu
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
                  @input="showViewers = !showViewers"
                >
                  {{ viewerCount }}
                  <v-icon right>account_circle</v-icon>
                </v-chip>
              </template>

              <v-card>
                <v-sheet color="yellow">
                  <v-card-title class="title black--text">Live Viewers</v-card-title>
                </v-sheet>

                <v-layout style="max-height: 60vh; overflow: auto;">
                  <v-list dense two-line>

                    <v-list-tile avatar v-for="viewer in viewers" :key="viewer.username">
                      <v-list-tile-avatar>
                        <img v-if="!!viewer.avatar" :src="viewer.avatar" :alt="viewer.username">
                        <v-icon v-else :style="{ background: viewer.color || 'radial-gradient( yellow, #ff9800 )', color: !viewer.color && 'black' }">person</v-icon>
                      </v-list-tile-avatar>
                      <v-list-tile-content>
                        <v-list-tile-title>{{ viewer.username }}</v-list-tile-title>
                        <!--<v-list-tile-sub-title>watching: {{ viewer.page ? viewer.page.watch : 'global' }}</v-list-tile-sub-title>-->
                        <v-list-tile-sub-title v-if="viewer.page && viewer.page.watch">watching: {{ `${viewer.page.watch} (${ channelViews[ viewer.page.watch.toLowerCase() ] })` }}</v-list-tile-sub-title>
                        <v-list-tile-sub-title v-else>Just Browsing</v-list-tile-sub-title>
                      </v-list-tile-content>
                    </v-list-tile>

                  </v-list>
                </v-layout>
              </v-card>
            </v-menu>
          </v-flex>

          <v-spacer/>

          <v-flex shrink>


            <v-menu
              v-model="showToolMenu"
              :close-on-content-click="false"
              transition="slide-x-reverse-transition"
              :max-width="350"
              bottom
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
                >TOOLS</v-btn>
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

          <v-flex shrink>
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

    <v-flex id="chat-poll" v-if="false">
      <v-sheet>
        <v-layout column>

          <v-layout align-center class="pa-2">
            <v-flex shrink>
              <v-btn
                color="yellow"
                light
              >
                Option A - Some BullShit
              </v-btn>
            </v-flex>
          </v-layout>


          <v-layout align-center class="pa-2">
            <v-flex shrink>
              <v-btn
                color="yellow"
                light
              >
                Option A - Some BullShit
              </v-btn>
            </v-flex>
          </v-layout>

          <v-layout align-center class="pa-2">
            <v-flex shrink>
              <v-btn
                color="yellow"
                light
              >
                Option A - Some BullShit
              </v-btn>
            </v-flex>
          </v-layout>

        </v-layout>
      </v-sheet>
    </v-flex>

    <v-flex
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
    <v-flex>
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

  export default {
    name: 'Chat',

    props: {
      dark: {
        type: Boolean,
      },
    },

    components: {
      ChatMessage,
      DynamicScroller,
      DynamicScrollerItem,
    },

    data() {
      return {
        color: null,
        unsubscribeUser: null,
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
        ignoreList: ['Nexus'],
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
        voicesListTTS: process.client ? speechSynthesis.getVoices() : [],

        showViewers: false,
        viewers: [{name: 'NONE'}],
        channelViews: {},

        global: true,
      }
    },

    methods: {
      addUserTag (user) {
        this.message += `@${user}: `
        this.$refs['chatmessageinput'].focus();
      },

      authenticated(user) {
        if (user) {
          this.subscribeToUser(user.uid);
        } else {
          if (this.unsubscribeUser) this.unsubscribeUser();
          const trollUser = {
            type: 'troll',
            color: this.color,
            email: null,
            username: `troll:${this.uid}`,
            uid: this.uid,
            page: this.$route.params,
          };
          this.connectChat(trollUser);
        }
        this.loading = false;
      },

      subscribeToUser(uid) {
        const userdocRef = db.collection('users').doc(uid);
        this.unsubscribeUser = userdocRef.onSnapshot( doc => {
          const user = doc.data();
          user.page = this.$route.params;
          this.connectChat(user);
        });
      },

      async scrollToBottom(force) {
        const scrollTop = this.chatContainer.$el.scrollTop;
        const scrollHeight = this.chatContainer.$el.scrollHeight;
        const scrollDistance = scrollHeight - scrollTop;
        const scroll = !!force || scrollDistance < (1.25 * screen.height);
        console.debug(`ScrollTop: ${scrollTop} ScrollHeight: ${scrollHeight} ScrollDistance: ${scrollDistance} Scroll: ${scroll}`);
        if ( scroll ) {
          // await this.$nextTick( () => this.chatContainer.$el.scrollTop = scrollHeight + 500 );
          if (this.messages.length > this.chatLimit) this.messages.shift();
          setTimeout( () => this.chatContainer.$el.scrollTop = scrollHeight + 500, 250 );
        }
      },

      scrollToChatBottom () {
        this.$nextTick( () => this.$refs.scroller.scrollToBottom() );
      },

      connectChat(user) {
        if (this.socket) {
          this.socket.disconnect();
        }
        if (!user) {
          console.warn(`Failed to connect to chat. No user defined.`);
          return;
        }
        console.debug('Chat User:', user);

        // const socket = socketio('api.bitwave.tv:443', { transports: ['websocket'] });
        const socket = socketio('api.bitwave.tv:443');

        socket.on( 'connect', () => socket.emit('new user', user) );
        socket.on( 'update usernames', data => this.updateUsernames(data) );
        socket.on( 'hydrate', async data => await this.hydrate(data) );
        socket.on( 'message', async data => await this.rcvMessage(data) );
        socket.on( 'blocked', data => this.message = data.message );

        this.socket = socket;
      },

      updateUsernames(data) {
        const key = 'username';
        this.viewers = data.reduce( (accumulator, current) => {
          if (!accumulator.find( obj => obj[key] === current[key] )) accumulator.push(current);
          return accumulator;
        }, []);

        this.channelViews = data.reduce( (accumulator, current) => {
          let channel = current.page && current.page.watch;
          if ( !channel ) return accumulator;

          channel  = channel.toLowerCase();

          if ( channel in accumulator ) {
            accumulator[channel]++;
          } else {
            accumulator[channel] = 1;
          }

          return accumulator;

          // if (!accumulator.find( obj => obj[key2] === current[key2] )) accumulator.push(current);
          // return accumulator;
        }, {});
        console.log(this.channelViews);

        // this.viewers = data;
        this.viewerCount = this.viewers.length;
        console.debug(data);
      },

      async hydrate(data) {
        const size = data.length;
        this.messages = size > 100 ? data.splice(-this.chatLimit) : data;
        await this.$nextTick( async () => await this.scrollToBottom(true) );
      },

      async rcvMessage(message) {
        if(this.useIgnoreListForChat){
          if ( this.ignoreList.includes( message.username) ) {
            return;
          }
        }

        if ( !this.global ) {
          if ( message.channel.toLowerCase() !== this.page.toLowerCase() && message.channel.toLowerCase() !== this.username.toLowerCase() ) {
            return;
          }
        }

        const pattern = `@${this.username}\\b`;
        message.message = message.message.replace(new RegExp(pattern, 'gi'), `<span class="highlight">$&</span>`);

        // For Text to Speech
        const allowTTS = message.channel.toLowerCase() === this.username.toLowerCase() || message.channel.toLowerCase() === this.page.toLowerCase();
        if ( allowTTS ) {
          this.speak(message.message, message.username); // Say Message
        }

        this.messages.push({ ...{ channel: 'null', id: Date.now() }, ...message });
        await this.$nextTick( async () => await this.scrollToBottom() );
      },

      sendMessage() {
        if (this.message.length > 300) return false;

        const match = /^\/(\w+)\s?(\w+)?/g.exec(this.message);
        const parts = this.message.split(" ");

        if (match) {
          const command  = match[1];
          const argument = parts[1];//match[2];

          switch (command) {
            case 'ignore':
              const exists = this.ignoreList.find( el => el.toLowerCase() === argument.toLowerCase() );
              if (!exists) {
                this.ignoreList.push(argument);
              }
              break;
            case 'unignore':
              const location = this.ignoreList.findIndex( el => el === argument );
              if (location) {
                this.ignoreList.splice(location, 1);
              }
              break;
            case 'skip':
            case    's':
              speechSynthesis.cancel();
              break;
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

      getTime(timestamp) {
        return `[${moment(timestamp).format('HH:mm')}]`;
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

      speak (message, username) {
        if (!this.useTTS) return;

        if ( this.ignoreList.find(user => user === username) ) {
          return;
        }

        if ( !this.allowTrollTTS && /troll:\w+/.test(username) ) {
          return; // disables troll TTS
        }

        function unescapeHtml(unsafe) {
          return unsafe
            .replace(/&amp;/g, "&")
            .replace(/&lt;/g, "<")
            .replace(/&gt;/g, ">")
            .replace(/&quot;/g, "\"")
            .replace(/&#39;/g, "'");
        }

        message = unescapeHtml(message); // Fixes escaped characters

        // Remove Links
        message = message.replace(/((https?:\/\/)|(www\.))[^\s]+/gi, '');

        // Remove html tags
        message = message.replace(/<\/?[^>]*>/g, '');

        const voicesTTS = speechSynthesis.getVoices();

        const voice = new SpeechSynthesisUtterance();
        const pitch = .9;
        voice.voice = voicesTTS[this.selectionTTS];
        voice.rate = this.rateTTS / 10.0;
        voice.pitch = pitch;
        voice.text = message;

        voice.onend = function(e) {
          // console.log(`Finished in ${e.elapsedTime} seconds.`, e);
        };

        speechSynthesis.speak(voice);
      }
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
        const params = this.$route.params;
        if (params.hasOwnProperty('watch')) {
          if (params.watch.match(/^[a-zA-Z0-9._-]+$/))
            return params.watch;
          else
            return '404';
        } else {
          return 'Global';
        }
      },

      voices () {
        return this.voicesListTTS.map( (voice, index) => { return { text: voice.name, value: index } } );
      },
    },

    created() {
      auth.onAuthStateChanged( async user => await this.authenticated(user) );
    },

    mounted() {
      this.setupTrollData();;
      this.chatContainer = this.$refs.scroller;

      speechSynthesis.onvoiceschanged = () => this.voicesListTTS = speechSynthesis.getVoices();
    },

    beforeDestroy() {
      if (this.unsubscribeUser) this.unsubscribeUser();
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
