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
            Live Chat: <b>{{ viewerCount }}</b>
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
          @click="scrollToBottom"
        >
          <v-icon>keyboard_arrow_down</v-icon>
        </v-btn>
      </v-sheet>
    </v-flex>

    <v-divider/>

    <v-flex
      fill-height
      style="overflow: hidden;"
    >
      <dynamic-scroller
        id="chat-scroll"
        ref="scroller"
        :items="messages"
        key-field="timestamp"
        :min-item-size="60"
        :buffer="90"
        :emitUpdate="false"
      >
        <dynamic-scroller-item
          slot-scope="{ item, index, active }"
          :item="item"
          :active="active"
          :size-dependencies="[]"
          :data-index="index"
        >
          <template #before>
            <v-spacer fill-height/>
          </template>

          <chat-message
            :key="item.timestamp"
            :username="item.username"
            :channel="item.channel"
            :timestamp="getTime(item.timestamp)"
            :avatar="item.avatar"
          ><div slot="message" v-html="item.message"></div>
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
  import moment from 'moment'

  import { mapState } from 'vuex'

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
        chatLimit: 1000,
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

      async scrollToBottom(force) {
        const scrollTop = this.chatContainer.$el.scrollTop;
        const scrollHeight = this.chatContainer.$el.scrollHeight;
        const scrollDistance = scrollHeight - scrollTop;
        console.log(`ScrollTop: ${scrollTop} ScrollHeight: ${scrollHeight} ScrollDistance: ${scrollDistance}`);
        if ( !!force || scrollDistance > (2.5 * screen.height) ) {
          console.log('Scroll Down');
          // await this.$nextTick( () => this.chatContainer.$el.scrollTop = scrollHeight + 500 );
          if (this.messages.length > this.chatLimit) this.messages.shift();
          setTimeout(() => this.chatContainer.$el.scrollTop = scrollHeight + 500, 250);
        }
      },

      scrollToChatBottom () {
        this.$nextTick( () => this.$refs.scroller.scrollToBottom() );
      },

      connectChat(user) {
        if (this.socket) this.socket.disconnect();
        if (!user) return;

        const socket = socketio('api.bitwave.tv:443');
        this.socket = socket;
        socket.on( 'connect', () => socket.emit('new user', user) );
        socket.on( 'update usernames', data => this.updateUsernames(data) );
        socket.on( 'hydrate', async data => await this.hydrate(data) );
        socket.on( 'message', async data => await this.rcvMessage(data) );
        socket.on( 'blocked', data => this.message = data.message );
      },

      updateUsernames(data) {
        this.viewerCount = data.length;
        console.log(data);
      },

      async hydrate(data) {
        const size = data.length;
        this.messages = size > 100 ? data.splice(99, size) : data;
        // this.$nextTick( () => this.scrollToChatBottom() );
        await this.$nextTick( async () => await this.scrollToBottom(true) );
      },

      async rcvMessage(message) {
        const pattern = `@${this.username}\\b`;
        message.message = message.message.replace(new RegExp(pattern, 'gi'), `<span class="highlight">$&</span>`);
        this.messages.push({ ...{ channel: 'null', id: Date.now() }, ...message });
        // if (this.messages.length > this.chatLimit) this.messages.shift();
        await this.$nextTick( async () => await this.scrollToBottom() );
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

      getTime(timestamp) {
        return `[${moment(timestamp).format('HH:mm')}]`;
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
      this.chatContainer = this.$refs.scroller;
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
    height: 100%;
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
