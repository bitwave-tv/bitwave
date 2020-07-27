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

        <!-- TODO: Move this to it's own component during poll refactor -->
        <!-- Create Poll Button -->
        <div
          v-if="isChannelOwner"
        >
          <v-menu
            v-model="showPoll"
            :close-on-content-click="false"
            :close-on-click="false"
            bottom
            offset-y
            left
          >
            <template #activator="{ on: menu }">
              <v-tooltip
                left
                color="error"
                transition="slide-x-reverse-transition"
              >
                <template #activator="{ on: tooltip }">
                  <v-btn
                    v-on="{ ...tooltip, /*focus: () => true, ...menu,*/ }"
                    small
                    color="primary darken-4 black--text"
                    class="mr-2"
                  >POLL</v-btn>
                </template>
                <span>
                  <v-icon>warning</v-icon>
                  Temporarily Disabled Due to a Bug
                </span>
              </v-tooltip>
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
        <lazy-chat-admin-menu-button
          v-if="isChannelOwner || isAdmin"
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
import ChatOverflowMenu from '@/components/Chat/ChatOverflowMenu';
import { mapGetters } from 'vuex';
import { VStore } from '@/store';

const ChatPoll = async () => await import ( '@/components/Chat/ChatPoll' );

  export default {
    name: 'ChatHeader',

    components: {
      ViewerList,
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

    computed: {
      ...mapGetters({
        isAdmin: VStore.$getters.isAdmin,
      }),
    },
  };
</script>
