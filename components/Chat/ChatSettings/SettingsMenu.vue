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
      <v-tabs-slider/>

      <!-- Tabs -->
      <v-tab
        v-for="tab in tabs"
        :key="tab.value"
        :href="`#${tab.value}`"
      >
        {{ tab.label }}
      </v-tab>
    </v-tabs>


    <!-- TAB: General Settings -->
    <v-tabs-items
      v-model="settingsTab"
    >
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
    </v-tabs-items>
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
        // Current tab selection
        settingsTab: 0,

        // Dynamic tabs will swap out vue components on the fly
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
    height: 30rem;
    width: 350px;
    overflow-y: auto;
  }
</style>
