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
        Live Chat
      </v-flex>

      <v-flex class="subheading text-xs-center red--text mb-3">
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

          <template v-for="x in 10">

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
        </v-layout>
      </v-flex>
    </v-layout>

    <v-divider/>

    <!-- Chat Input -->
    <v-flex>
      <v-layout
        row
        justify-center
        py-3
      >
        <v-flex
          xs11
        >
          <v-text-field
            v-model="message"
            outline
            label="Chat"
            clearable
            hide-details
            append-outer-icon="message"
            @click:append-outer="scrollToBottom"
          ></v-text-field>
        </v-flex>
      </v-layout>
    </v-flex>

  </v-layout>
</template>

<script>
  import ChatMessage from './ChatMessage'

  import { mapState } from 'vuex'

  export default {
    name: 'Chat',

    components: {
      ChatMessage,
    },

    data() {
      return {
        message: '',
      }
    },

    methods: {
      scrollToBottom() {
        this.$refs.chat.scrollTop = this.$refs.chat.scrollHeight;
      },
    },

    computed: {
      ...mapState({
        currentUser: state => state.user.currentUser
      })
    },

    mounted() {
      this.scrollToBottom();
    },
  }
</script>
