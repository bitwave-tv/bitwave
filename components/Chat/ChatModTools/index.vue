<template>
  <v-menu
    v-model="showChatModTools"
    :close-on-content-click="false"
    transition="slide-x-transition"
    :max-width="320"
    max-height="90vh"
    top
    right
    offset-y
  >
    <template #activator="{ on: menu }">
      <v-tooltip top :open-delay="500">
        <template #activator="{ on: tooltip }">
          <v-btn v-on="{ ...tooltip, focus: () => true, ...menu }" class="ml-2" small icon>
            <v-icon>build</v-icon>
          </v-btn>
        </template>
        <span>Chat Configuration</span>
      </v-tooltip>
    </template>

    <v-card
      class="mb-3"
      color="grey darken-4"
      width="250"
    >
      <!-- Title Bar -->
      <v-sheet
        tile
        color="primary"
        class="d-flex align-center justify-space-between pl-2"
      >
        <h5 class="black--text body-2">Chat Configuration</h5>
        <v-btn
          color="black"
          text
          icon
          pa-0
          @click="close"
        >
          <v-icon color="black">close</v-icon>
        </v-btn>
      </v-sheet>

      <chat-rate-limits/>

    </v-card>
  </v-menu>
</template>

<script>
  const ChatRateLimits = async () => await import('@/components/Chat/ChatModTools/ChatRateLimits');

  export default {
    name: 'ChatModTools',

    components: {
      ChatRateLimits,
    },

    data() {
      return {
        showChatModTools: false,
      };
    },

    methods: {
      close () {
        this.showChatModTools = false;
      },
    },
  };
</script>
