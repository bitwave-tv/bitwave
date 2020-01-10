<template>
  <v-card>
    <!-- Title Bar -->
    <v-sheet
      tile
      color="yellow"
      class="d-flex align-center justify-space-between pl-2"
    >
      <h5 class="black--text body-2">Chat Settings</h5>
      <v-btn
        color="black"
        text
        icon
        pa-0
        @click="closeMenu"
      >
        <v-icon color="black">close</v-icon>
      </v-btn>
    </v-sheet>

    <div class="px-3">
      <div class="d-flex">
        <div class="flex-grow-1">
          <v-switch
            v-model="globalChat"
            label="Global Chat"
            color="yellow"
            hide-details
            dense
            inset
          />
        </div>
        <div class="flex-grow-1">
          <v-switch
            v-model="showTimestamps"
            class="ml-3"
            label="Timestamps"
            color="yellow"
            hide-details
            dense
            inset
          />
        </div>
      </div>

      <v-switch
        v-model="useIgnore"
        label="Ignore Users"
        class="mb-2"
        color="yellow"
        hide-details
        dense
        inset
      />

      <v-switch
        v-model="notificationSound"
        label="Notification Sounds"
        class="mb-2"
        color="yellow"
        hide-details
        dense
        inset
      />

      <v-switch
        v-model="autocomplete"
        label="Autocomplete"
        class="mb-2"
        color="yellow"
        hide-details
        dense
        inset
      />
    </div>

    <v-divider/>

    <div class="pb-2">
      <v-subheader class="overline mb-0">Text To Speech Options</v-subheader>

      <div class="d-flex mb-3">
        <v-flex>
          <v-switch
            v-model="useTts"
            label="Use TTS"
            class="ml-3 mt-0 pt-0"
            color="yellow"
            hide-details
            dense
            inset
          />
        </v-flex>
        <v-flex>
          <v-switch
            v-model="trollTts"
            :disabled="!useTts"
            label="Troll TTS"
            class="ml-0 mt-0 pt-0"
            color="yellow"
            hide-details
            dense
            inset
          />
        </v-flex>
      </div>

      <v-flex mx-3>
        <v-select
          v-model="ttsVoice"
          :items="ttsVoices"
          :disabled="!useTts"
          label="TTS Voice"
          style="font-size: 12px;"
          hide-details
        />
      </v-flex>

      <v-list-item>
        <v-slider
          :disabled="!useTts"
          label="Speed"
          v-model="ttsRate"
          class="align-center"
          :max="20"
          :min="1"
          :step="0.5"
          hide-details
        >
          <template #append>
            <v-text-field
              v-model="ttsRate"
              class="mt-0 pt-0"
              hide-details
              single-line
              type="number"
              style="width: 50px"
            />
          </template>
        </v-slider>
      </v-list-item>
    </div>
  </v-card>
</template>

<script>
  import { mapState, mapMutations } from 'vuex'
  import { Chat } from '@/store/chat';

  export default {
    name: 'ChatSettings',

    props: {

    },

    data() {
      return {
        useIgnoreList: true,
        ttsVoices: [],
      }
    },

    methods: {
      ...mapMutations (Chat.namespace, {
        setModeGlobal     : Chat.$mutations.setGlobal,
        setModeTimestamps : Chat.$mutations.setTimestamps,
        setUseTts         : Chat.$mutations.setUseTts,
        setUseIgnore      : Chat.$mutations.setUseIgnore,
        setTrollTts       : Chat.$mutations.setTrollTts,
        setTtsRate        : Chat.$mutations.setTtsRate,
        setTtsVoice       : Chat.$mutations.setTtsVoice,
        setNotify         : Chat.$mutations.setNotify,
        setAutocomplete   : Chat.$mutations.setAutocomplete,
      }),

      closeMenu() {
        this.$emit( 'close' );
      },

      updateSettings() {
        const settings = {};
        this.$emit( 'input', settings );
      },
    },

    computed: {
      ...mapState (Chat.namespace, {
        getModeGlobal     : Chat.$states.global,
        getModeTimestamps : Chat.$states.timestamps,
        getUseTts         : Chat.$states.useTts,
        getUseIgnore      : Chat.$states.useIgnore,
        getTrollTts       : Chat.$states.trollTts,
        getTtsRate        : Chat.$states.ttsRate,
        getTtsVoice       : Chat.$states.ttsVoice,
        getNotify         : Chat.$states.notify,
        getAutocomplete   : Chat.$states.autocomplete,
      }),

      globalChat: {
        set ( val ) { this.setModeGlobal( val ) },
        get () { return this.getModeGlobal }
      },

      showTimestamps: {
        set ( val ) { this.setModeTimestamps( val ) },
        get () { return this.getModeTimestamps }
      },

      useTts: {
        set ( val ) { this.setUseTts( val ) },
        get () { return this.getUseTts }
      },

      useIgnore: {
        set ( val ) { this.setUseIgnore( val ) },
        get () { return this.getUseIgnore }
      },

      trollTts: {
        set ( val ) { this.setTrollTts( val ) },
        get () { return this.getTrollTts }
      },

      ttsRate: {
        set ( val ) { this.setTtsRate( val ) },
        get () { return this.getTtsRate }
      },

      ttsVoice: {
        set ( val ) { this.setTtsVoice( val ) },
        get () { return this.getTtsVoice }
      },

      notificationSound: {
        set ( val ) { this.setNotify( val ) },
        get () { return this.getNotify }
      },

      autocomplete: {
        set ( val ) { this.setAutocomplete( val ) },
        get () { return this.getAutocomplete }
      },
    },

    created () {

    },

    async mounted () {
      this.ttsVoices = speechSynthesis.getVoices().map( ( voice, index ) => ({ text: voice.name, value: index }));
      speechSynthesis.onvoiceschanged = () => this.ttsVoices = speechSynthesis.getVoices().map( ( voice, index ) => ({ text: voice.name, value: index }) );
    },
  }
</script>
