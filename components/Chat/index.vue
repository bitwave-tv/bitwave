<template>
  <v-layout
    column
    fill-height
  >

    <!-- Chat Header -->
    <v-layout
      column
      py-1
    >
      <v-flex class="title text-xs-center py-2">
        Live Chat: {{ viewerCount }}
      </v-flex>

      <v-flex class="caption text-xs-center red--text mb-3">
        <v-icon small color="red" class="px-1">warning</v-icon>
        WORK IN PROGRESS
        <v-icon small color="red" class="px-1">warning</v-icon>
      </v-flex>
    </v-layout>

    <v-divider/>

    <!-- Chat Messages -->
    <v-layout
      column
      fill-height
      style="overflow-y: scroll"
      ref="chat"
    >
      <v-flex>
        <v-layout
          column
          fill-height
          justify-end
        >
          <v-spacer fill-height></v-spacer>

          <template v-if="false">

            <chat-message username="Kovalski">
              <img slot="avatar" src="https://www.gravatar.com/avatar/5C016fba937df454004cf4c2ac5aef80?d=identicon" alt="Dispatch">
              <template slot="message">This is an example message.</template>
            </chat-message>

            <chat-message username="ANON">
              <template slot="message">This is a troll friendly chat.</template>
            </chat-message>

            <chat-message username="Murderder">
              <img slot="avatar" src="https://www.gravatar.com/avatar/4c016fba937df454004cf4c2ac5aef80?d=identicon" alt="Dispatch">
              <template slot="message">This is an example message.</template>
            </chat-message>

            <chat-message username="Dispatch">
              <img slot="avatar" src="https://www.gravatar.com/avatar/b88fd66ccef2d2ebbc343bfb08fb2efb?d=identicon" alt="Dispatch">
              <template slot="message">
                This is an example message which is supposed to be a multiline comment to test to see
                if the interface can handle very long comments that go across multiple lines and
                therefore can overflow or stretch or grow or whatever.
              </template>
            </chat-message>

          </template>

          <chat-message
            v-for="message in messages"
            :key="message.timestamp"
            :username="message.username"
          >
            <img
              v-if="message.avatar"
              slot="avatar"
              :src="message.avatar"
              :alt="message.username"
            >
            <template slot="message">{{ message.message }}</template>
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
          pt-3
        >
          <v-flex
            xs11
          >
            <v-text-field
              :label="`Chatting as ${this.username}`"
              :color="dark ? 'yellow' : 'blue'"
              autocomplete="off"
              autocorrect="off"
              autocapitalize="off"
              spellcheck="false"
              single-line
              outline
              append-icon="message"
              counter="300"
              validate-on-blur
              @change="v => message = v"
              @click:append="sendMessage"
              @keyup.enter.stop="sendMessage"
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
          },
        ],
        uid: null,
        viewerCount: 0,
        chatLimit: 100,
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

      scrollToBottom() {
        this.$refs.chat.scrollTop = this.$refs.chat.scrollHeight;
      },

      connectChat(user) {
        if (!user) {
          if (this.socket) {
            this.socket.disconnect();
          }
          return;
        }
        const socket = socketio('api.bitwave.tv:443');
        this.socket = socket;
        socket.on('connect', () => {
          socket.emit('new user', user);
        });
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
        setTimeout(() => this.scrollToBottom(), 250);
      },

      rcvMessage(message) {
        this.messages.push(message);
        setTimeout(() => this.scrollToBottom(), 250);
        if (this.messages.length > this.chatLimit) this.messages.shift();
      },

      sendMessage() {
        if (this.message.length > 300) {
          return false;
        }

        const msg = {
          message: this.message,
        };
        this.socket.emit('message', msg);
        this.message = '';
        // this.scrollToBottom();
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
          this.uid = this.createUID();
          return `troll:${this.uid}`;
        } else {
          return this.user.username;
        }
      },
    },

    created() {
      auth.onAuthStateChanged( async user => await this.authenticated(user) );
    },

    mounted() {
      this.scrollToBottom();
    },

    beforeDestroy() {
      if (this.unsubscribeUser) this.unsubscribeUser();
    },
  }
</script>
