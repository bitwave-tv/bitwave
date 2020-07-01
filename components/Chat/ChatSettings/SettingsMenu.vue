<template>
  <div>
    <v-tabs
      v-model="settingsTab"
      class="elevation-2"
    >
      <!-- Tab Slider Color -->
      <v-tabs-slider />

      <!-- Tabs -->
      <v-tab
        :href="`#chat-settings-general`"
      >
        General
      </v-tab>
      <v-tab
        :href="`#chat-settings-tts`"
      >
        TTS
      </v-tab>
      <v-tab
        :href="`#chat-settings-beta`"
      >
        Beta
      </v-tab>

      <!-- TAB: General Settings -->
      <v-tab-item
        value="chat-settings-general"
        class="chat-settings-panel"
      >
        <chat-general-settings-panel />
      </v-tab-item>

      <!-- TAB: TTS Settings -->
      <v-tab-item
        value="chat-settings-tts"
        class="chat-settings-panel"
      >
        <chat-tts-settings-panel />
      </v-tab-item>

      <!-- TAB: Beta Settings -->
      <v-tab-item
        value="chat-settings-beta"
        class="chat-settings-panel"
      >
        <chat-beta-settings-panel />
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

    props: {

    },

    data() {
      return {
        settingsTab: 'chat-settings-general',
      }
    },

    methods: {

    },

    computed: {

    },

    async mounted () {

    },
  }
</script>

<style lang="scss">
  .chat-settings-panel {
    height: 20rem;
    overflow: auto;
  }
</style>
