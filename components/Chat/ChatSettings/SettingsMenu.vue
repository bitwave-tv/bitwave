<template>
  <div>
    <div class="px-3">
      <div class="d-flex">
        <v-switch
          v-model="globalChat"
          label="Global Chat"
          color="primary"
          hide-details
          dense
          inset
        />
        <v-switch
          v-model="showTimestamps"
          class="ml-3"
          label="Timestamps"
          color="primary"
          hide-details
          dense
          inset
        />
      </div>

      <v-switch
        v-model="useIgnore"
        label="Ignore Users"
        class="mb-2"
        color="primary"
        hide-details
        dense
        inset
      />

      <v-switch
        v-model="notificationSound"
        label="Notification Sounds"
        class="mb-2"
        color="primary"
        hide-details
        dense
        inset
      />

      <v-switch
        v-model="autocomplete"
        label="Autocomplete"
        class="mb-2"
        color="primary"
        hide-details
        dense
        inset
      />
    </div>

    <v-divider/>

    <div class="pb-2">
      <v-subheader class="overline mb-0">Text To Speech Options</v-subheader>

      <div class="d-flex justify-space-around mb-3">
        <v-switch
          v-model="useTts"
          label="Use TTS"
          class="d-block mt-0 pt-0"
          color="primary"
          hide-details
          dense
          inset
        />
        <v-switch
          v-model="trollTts"
          :disabled="!useTts"
          label="Troll TTS"
          class="d-block mt-0 pt-0"
          color="primary"
          hide-details
          dense
          inset
        />
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

      <v-list-item>
        <v-slider
          :disabled="!useTts"
          label="Vol."
          v-model="ttsVolume"
          class="align-center"
          :max="10"
          :min="0"
          :step="0.5"
          hide-details
        />
      </v-list-item>

      <v-list-item>
        <v-slider
          :disabled="!useTts"
          label="Timeout"
          v-model="ttsTimeout"
          class="align-center"
          :max="60"
          :min="0"
          :step="0.5"
          hide-details
        >

	  <template #append>
            <v-text-field
              v-model="ttsTimeout"
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
  </div>
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
        setTtsTimeout     : Chat.$mutations.setTtsTimeout,
        setTtsVolume      : Chat.$mutations.setTtsVolume,
        setTtsVoice       : Chat.$mutations.setTtsVoice,
        setNotify         : Chat.$mutations.setNotify,
        setAutocomplete   : Chat.$mutations.setAutocomplete,
      }),

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
        getTtsTimeout     : Chat.$states.ttsTimeout,
        getTtsVolume      : Chat.$states.ttsVolume,
        getTtsVoice       : Chat.$states.ttsVoice,
        getNotify         : Chat.$states.notify,
        getAutocomplete   : Chat.$states.autocomplete,
      }),

      globalChat: {
        set ( val ) {
          this.setModeGlobal( val );
          this.$analytics.logEvent( 'global_chat', { value: val } );
        },
        get () { return this.getModeGlobal }
      },

      showTimestamps: {
        set ( val ) {
          this.setModeTimestamps( val );
          this.$analytics.logEvent( 'show_timestamps', { value: val } );
        },
        get () { return this.getModeTimestamps }
      },

      useTts: {
        set ( val ) {
          this.setUseTts( val );
          this.$analytics.logEvent( 'use_tts', { value: val } );
        },
        get () { return this.getUseTts }
      },

      useIgnore: {
        set ( val ) {
          this.setUseIgnore( val );
          this.$analytics.logEvent( 'use_ignore', { value: val } );
        },
        get () { return this.getUseIgnore }
      },

      trollTts: {
        set ( val ) {
          this.setTrollTts( val );
          this.$analytics.logEvent( 'allow_troll_tts', { value: val } );
        },
        get () { return this.getTrollTts }
      },

      ttsRate: {
        set ( val ) {
          this.setTtsRate( val );
          this.$analytics.logEvent( 'tts_rate', { value: val } );
        },
        get () { return this.getTtsRate }
      },

      ttsTimeout: {
        set ( val ) {
          this.setTtsTimeout( val );
          this.$analytics.logEvent( 'tts_timeout', { value: val } );
        },
        get () { return this.getTtsTimeout }
      },

      ttsVolume: {
        set ( val ) {
          this.setTtsVolume( val );
          this.$analytics.logEvent( 'tts_volume', { value: val } );
        },
        get () { return this.getTtsVolume }
      },

      ttsVoice: {
        set ( val ) {
          this.setTtsVoice( val );
        },
        get () { return this.getTtsVoice }
      },

      notificationSound: {
        set ( val ) {
          this.setNotify( val );
          this.$analytics.logEvent( 'chat_notifications', { value: val } );
        },
        get () { return this.getNotify }
      },

      autocomplete: {
        set ( val ) {
          this.setAutocomplete( val );
          this.$analytics.logEvent( 'chat_autocomplete', { value: val } );
        },
        get () { return this.getAutocomplete }
      },
    },

    async mounted () {
      this.ttsVoices = speechSynthesis.getVoices().map( ( voice, index ) => ({ text: voice.name, value: index }));
      speechSynthesis.onvoiceschanged = () => this.ttsVoices = speechSynthesis.getVoices().map( ( voice, index ) => ({ text: voice.name, value: index }) );
    },
  }
</script>
