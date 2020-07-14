<template>
  <div>
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
        @click="addChannelTag"
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

        <!-- Chat Admin Menu -->
        <chat-admin-menu
          class="mr-2"
        />

        <!-- Chat Overflow Menu -->
        <chat-overflow-menu
          :page="page"
        />

      </div>
    </v-sheet>
  </div>
</template>

<script>
import ViewerList from '@/components/Chat/ViewerList';
import ChatAdminMenu from '@/components/Chat/ChatAdminMenu';
import ChatOverflowMenu from '@/components/Chat/ChatOverflowMenu';

const ChatPoll = async () => await import ( '@/components/Chat/ChatPoll' );

  export default {
    name: 'ChatHeader',

    components: {
      ViewerList,
      ChatAdminMenu,
      ChatOverflowMenu,
      ChatPoll,
    },

    props: {
      page: { type: String },
      isChannelOwner: { type: Boolean },
    },

    data () {
      return {
        showPoll: false,
      };
    },

    methods: {
      addChannelTag () {
        this.$emit( 'add-channel-tag' );
      },

      createPoll ( poll ) {
        this.$emit( 'create-poll', poll );
      },
    },
  };
</script>
