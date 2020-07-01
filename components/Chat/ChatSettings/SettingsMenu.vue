<template>
  <div>
    <v-tabs
      v-model="settingsTab"
      class="elevation-2"
      background-color="blue-grey darken-4"
      color="white"
      id="chat-settings"
    >
      <!-- Tab Slider Color -->
      <v-tabs-slider />

      <!-- Tabs -->
      <v-tab
        v-for="tab in tabs"
        :key="tab.value"
        :href="`#${tab.value}`"
      >
        {{ tab.label }}
      </v-tab>

      <!-- TAB: General Settings -->
      <v-tab-item
        v-for="tab in tabs"
        :key="tab.value"
        :value="tab.value"
        class="chat-settings-panel"
      >
        <component
          :is="tab.component"
          :key="tab.value"
        />
      </v-tab-item>
    </v-tabs>
  </div>
</template>

<script>
  import ChatGeneralSettingsPanel from './ChatSettingsPanel/ChatGeneralSettingsPanel';
  import ChatTtsSettingsPanel from './ChatSettingsPanel/ChatTtsSettingsPanel';
  import ChatBetaSettingsPanel from './ChatSettingsPanel/ChatBetaSettingsPanel';

  export default {
    name: 'ChatSettings',
    components: {
      ChatBetaSettingsPanel,
      ChatTtsSettingsPanel,
      ChatGeneralSettingsPanel,
    },

    data() {
      return {
        // Default tab
        settingsTab: 'chat-settings-general',
        tabs: [
          {
            label: 'General',
            value: 'chat-settings-general',
            component: ChatGeneralSettingsPanel,
          },
          {
            label: 'TTS',
            value: 'chat-settings-tts',
            component: ChatTtsSettingsPanel,
          },
          {
            label: 'Beta',
            value: 'chat-settings-beta',
            component: ChatBetaSettingsPanel,
          },
        ],
      };
    },
  }
</script>

<style lang="scss">
  /*#chat-settings .v-window__container {
    width: 350px;
    height: 20rem;
    overflow-y: auto;
  }*/

  .chat-settings-panel {
    width: 350px;
    height: 20rem;
    overflow-y: auto;
  }
</style>
