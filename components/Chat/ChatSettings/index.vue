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
    origin="bottom left"
    ref="chatSettingsMenu"
  >
    <template #activator="{ on: menu }">
      <v-tooltip
        :open-delay="500"
        top
      >
        <template #activator="{ on: tooltip }">
          <v-btn
            v-on="{ ...tooltip, focus: () => true, ...menu, }"
            small
            icon
          >
            <v-icon>settings</v-icon>
          </v-btn>
        </template>
        <span>Chat settings</span>
      </v-tooltip>
    </template>

    <div
      style="height: 36rem;"
    >
      <v-card
        color="grey darken-4"
      >
        <!-- Title Bar -->
        <v-sheet
          tile
          color="primary"
          class="d-flex align-center justify-space-between pl-2"
        >
          <h5 class="black--text body-2 font-weight-medium">
            Chat Settings
          </h5>
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

        <!-- Tabbed Settings -->
        <settings-menu
          @change="onTabChange"
        />
      </v-card>
    </div>
  </v-menu>
</template>

<script>
  const SettingsMenu = async () => await import( '@/components/Chat/ChatSettings/SettingsMenu' );

  export default {
    name: 'ChatSettingsMenu',

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

      onTabChange () {
        // this.$nextTick( () => this.$refs.chatSettingsMenu.onResize() );
      }
    },
  };
</script>
