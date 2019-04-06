<template>
  <v-layout
    id="sidechat"
    column
    fill-height
  >
    <!-- Chat Header -->
    <v-flex>
      <v-sheet>
        <v-layout
          column
          py-2
        >
          <v-flex class="subheading text-xs-center mb-1">
            Live Chat: {{ viewerCount }}
          </v-flex>
          <v-flex class="caption text-xs-center red--text">
            <v-icon small color="red" class="px-1">warning</v-icon>
            WORK IN PROGRESS
            <v-icon small color="red" class="px-1">warning</v-icon>
          </v-flex>
        </v-layout>
        <v-btn
          small
          absolute
          right
          bottom
          fab
          light
          color="yellow"
          @click="scrollToBottom(true)"
        >
          <v-icon>keyboard_arrow_down</v-icon>
        </v-btn>
      </v-sheet>
    </v-flex>

    <v-divider/>

    <!-- Chat Messages -->
    <v-layout
      ref="chat"
      id="chat-scroll"
      class="scrollbar"
      column
      fill-height
      style="overflow-y: scroll"
    >
      <v-flex>
        <v-layout
          column
          fill-height
          justify-end
        >
          <v-spacer fill-height/>
          <chat-message
            v-for="message in messages"
            :key="message.timestamp"
            :username="message.username"
            :channel="message.channel"
            :timestamp="message.timestamp"
          >
            <img v-if="message.avatar" slot="avatar" :src="message.avatar" alt="">
            <div slot="message" v-html="message.message"></div>
          </chat-message>
        </v-layout>
      </v-flex>
    </v-layout>

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
              :label="`Chat as ${this.username}...`"
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

  import { mapState } from 'vuex'

  import socketio from 'socket.io-client'

  export default {
    name: 'Chat',

    props: {
      dark: {
        type: Boolean,
      },
    },

    components: {
      ChatMessage,
    },

    data() {
      return {
        unsubscribeUser: null,
        loading: true,
        socket: null,
        message: '',
        messages: [
          {
            timestamp: Date.now(),
            username: 'Dispatch',
            avatar: 'https://www.gravatar.com/avatar/b88fd66ccef2d2ebbc343bfb08fb2efb?d=identicon',
            message: 'Loading messages...',
            channel: 'global',
          },
        ],
        uid: null,
        viewerCount: 0,
        chatLimit: 100,
        chatContainer: null,
      }
    },

    methods: {
      authenticated(user) {
        if (user) {
          this.subscribeToUser(user.uid);
          this.connectChat(this.user);
        } else {
          if (this.unsubscribeUser) this.unsubscribeUser();
          const trollUser = {
            email: null,
            username: this.username,
            uid: this.uid,
          };
          this.connectChat(trollUser);
        }
        this.loading = false;
      },

      subscribeToUser(uid) {
        const userdocRef = db.collection('users').doc(uid);
        this.unsubscribeUser = userdocRef.onSnapshot( doc => {
          this.$store.commit('setUser', doc.data());
        });
      },

      scrollToBottom(force) {
        const scrollTop = this.chatContainer.scrollTop;
        const scrollHeight = this.chatContainer.scrollHeight;
        if ( !!force || (scrollTop / scrollHeight * 100 > 95) ) this.chatContainer.scrollTop = scrollHeight;
      },

      connectChat(user) {
        if (this.socket) this.socket.disconnect();
        if (!user) return;

        const socket = socketio('api.bitwave.tv:443');
        this.socket = socket;
        socket.on( 'connect', () => socket.emit('new user', user) );
        socket.on( 'update usernames', data => this.updateUsernames(data) );
        socket.on( 'hydrate', data => this.hydrate(data) );
        socket.on( 'message', data => this.rcvMessage(data) );
        socket.on( 'blocked', data => this.message = data.message );
      },

      updateUsernames(data) {
        this.viewerCount = data.length;
        console.log(data);
      },

      hydrate(data) {
        this.messages = data;
        this.$nextTick( () => this.scrollToBottom(true) );
      },

      rcvMessage(message) {
        const pattern = `@${this.username}\\b`;
        message.message = message.message.replace(new RegExp(pattern, 'gi'), `<span class="highlight">$&</span>`);
        this.messages.push({ ...{ channel: 'null' }, ...message });
        if (this.messages.length > this.chatLimit) this.messages.shift();
        this.$nextTick( () => this.scrollToBottom() );
      },

      sendMessage() {
        if (this.message.length > 300) return false;

        const msg = {
          message: this.message,
          channel: this.page,
        };
        this.message = '';
        this.socket.emit('message', msg);
      },

      createUID() {
        return [...Array(4)].map(() => (~~(Math.random()*36)).toString(36)).join('');
      },
    },

    computed: {
      ...mapState({
        user: state => state.user,
      }),

      username () {
        if (!this.user || !this.user.username) {
          return `troll:${this.uid}`;
        } else {
          return this.user.username;
        }
      },

      page () {
        const route = this.$route.params;
        return route ? route.watch : 'global';
      },
    },

    created() {
      auth.onAuthStateChanged( async user => await this.authenticated(user) );
    },

    mounted() {
      this.uid = this.createUID();
      this.chatContainer = this.$refs.chat;
    },

    beforeDestroy() {
      if (this.unsubscribeUser) this.unsubscribeUser();
    },
  }
</script>

<style lang='scss'>
  #sidechat {
    border-top: 3px yellow;
    background-color: #111;

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
    margin-right: 2px;
    overscroll-behavior: contain;

    &::-webkit-scrollbar-track
    {
      -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,0.3);
      border-radius: 3px;
      background-color: #0a0a0a;
    }

    &::-webkit-scrollbar
    {
      width: 10px;
      background-color: #0a0a0a;
    }

    &::-webkit-scrollbar-thumb
    {
      border-radius: 3px;
      -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,.3);
      background-color: #555;
    }
  }
</style>
