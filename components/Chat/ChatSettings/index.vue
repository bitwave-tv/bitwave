<template>
  <v-menu
    v-model="showChatSettings"
    :close-on-content-click="false"
    transition="slide-x-transition"
    :max-width="320"
    max-height="90vh"
    top
    right
    offset-y
  >
    <template #activator="{ on: menu }">
      <v-tooltip top right>
        <template #activator="{ on: tooltip }">
          <v-btn v-on="{ ...menu, ...tooltip }" small icon>
            <v-icon>settings</v-icon>
          </v-btn>
        </template>
        <span>Chat settings</span>
      </v-tooltip>
    </template>

    <v-card class="mb-3" color="grey darken-4">
      <!-- Title Bar -->
      <v-sheet
        tile
        color="primary"
        class="d-flex align-center justify-space-between pl-2"
      >
        <h5 class="black--text body-2">Chat Settings</h5>
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
      <settings-menu />
    </v-card>
  </v-menu>
</template>

<script>
  const SettingsMenu = async () => await import( '@/components/Chat/ChatSettings/SettingsMenu' );

  export default {
    name: 'index',

    components: {
      SettingsMenu,
    },

    data() {
      return {
        showChatSettings: false,
      };
    },

    methods: {
      close () {
        this.showChatSettings = false;
      },
    },
  };
</script>
