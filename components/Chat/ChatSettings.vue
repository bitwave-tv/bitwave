<template>
  <v-card>
    <v-sheet color="yellow">
      <v-layout class="pl-2" align-center>
        <v-flex>
          <h5 class="black--text body-2">Settings</h5>
        </v-flex>
        <v-flex shrink>
          <v-btn
            color="black"
            text
            icon
            pa-0
            @click="closeMenu"
          >
            <v-icon color="black">close</v-icon>
          </v-btn>
        </v-flex>
      </v-layout>
    </v-sheet>

    <div class="px-2">
      <div class="d-flex justify-space-between">
        <v-switch
          v-model="globalChat"
          :label="`${ globalChat ? 'Global' : 'Local' } Chat`"
          color="yellow"
          hide-details
        ></v-switch>
        <v-switch
          v-model="showTimestamps"
          label="Timestamps"
          color="yellow"
          hide-details
        ></v-switch>
      </div>

      <div class="mb-2">
        <v-switch
          v-model="notificationSound"
          label="Notification Sounds"
          color="yellow"
          hide-details
        ></v-switch>
      </div>
    </div>

    <v-divider/>

    <v-list subheader pb-2>
      <v-subheader class="mb-0">Text To Speech Options</v-subheader>

      <v-layout mb-3>
        <v-flex>
          <v-switch
            v-model="useTts"
            label="Use TTS"
            class="ml-3 mt-0 pt-0"
            color="yellow"
            hide-details
            @change="toggleTts"
          ></v-switch>
        </v-flex>
        <v-flex>
          <v-switch
            v-model="trollTts"
            :disabled="!useTts"
            label="Troll TTS"
            class="ml-0 mt-0 pt-0"
            color="yellow"
            hide-details
            @change="toggleTrollTts"
          ></v-switch>
        </v-flex>
      </v-layout>

      <v-flex mx-3>
        <v-select
          v-model="ttsVoice"
          :items="ttsVoices"
          :disabled="!useTts"
          label="TTS Voice"
          style="font-size: 12px;"
          hide-details
        ></v-select>
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
            ></v-text-field>
          </template>
        </v-slider>
      </v-list-item>
    </v-list>
  </v-card>
</template>

<script>
  import { mapState, mapMutations } from 'vuex'

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
      ...mapMutations ('chat', {
        setModeGlobal: 'SET_MODE_GLOBAL',
        setModeTimestamps: 'SET_TIMESTAMPS',
        setUseTts: 'SET_USE_TTS',
        setTrollTts: 'SET_TROLL_TTS',
        setTtsRate: 'SET_TTS_RATE',
        setTtsVoice: 'SET_TTS_VOICE',
        setNotify: 'SET_NOTIFY',
      }),

      toggleTts() {

      },

      toggleTrollTts() {

      },

      closeMenu() {
        this.$emit('close');
      },

      updateSettings() {
        const settings = {};
        this.$emit('input', settings);
      },
    },

    computed: {
      ...mapState ('chat', {
        getModeGlobal: 'global',
        getModeTimestamps: 'timestamps',
        getUseTts: 'useTts',
        getTrollTts: 'trollTts',
        getTtsRate: 'ttsRate',
        getTtsVoice: 'ttsVoice',
        getNotify: 'notify'
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
    },

    created () {

    },

    async mounted () {
      this.ttsVoices = speechSynthesis.getVoices().map( ( voice, index ) => ({ text: voice.name, value: index }));
      speechSynthesis.onvoiceschanged = () => this.ttsVoices = speechSynthesis.getVoices().map( ( voice, index ) => ({ text: voice.name, value: index }) );
    },
  }
</script>
