<template>
  <v-card
    flat
    tile
    class="pb-3 px-3"
  >
    <!-- TTS Settings -->
    <div>
      <!-- No TTS Voice Warning -->
      <v-alert
        v-if="!ttsVoicesExist"
        class="my-3"
        type="warning"
        text
      >
        No TTS voices found!
      </v-alert>

      <!-- TTS Voice Options -->
      <div
        v-if="ttsVoicesExist"
      >
        <!-- Enable TTS -->
        <v-switch
          v-model="useTts"
          :disabled="!ttsVoicesExist"
          label="Enable Chat TTS"
          color="primary"
          hide-details
          dense
          inset
        />

        <!-- Troll TTS -->
        <v-switch
          v-model="trollTts"
          :disabled="!useTts"
          label="Allow Troll TTS"
          color="primary"
          hide-details
          dense
          inset
        />

        <!-- Read username -->
        <v-switch
          v-model="ttsReadUsername"
          :disabled="!useTts"
          label="Read Username"
          color="primary"
          hide-details
          dense
          inset
          class="mb-3"
        />

        <v-divider class="mt-3" />

        <!-- TTS Voice Settings Labels -->
        <v-subheader class="overline mb-0">
          TTS Voice Settings
        </v-subheader>

        <!-- TTS Voice -->
        <v-select
          v-model="ttsVoice"
          :items="ttsVoices"
          :disabled="!useTts"
          label="TTS Voice"
          style="font-size: 12px;"
          hide-details
          solo-inverted
          class="mb-3"
        />

        <!-- TTS Rate -->
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

        <!-- TTS Volume -->
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

        <!-- TTS Timeout -->
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

      </div>
    </div>
  </v-card>
</template>

<script>
  import { mapMutations, mapState } from 'vuex';
  import { Chat } from '@/store/chat';

  export default {
    name: 'ChatTtsSettingsPanel',

    data() {
      return {
        ttsVoices: [],
      };
    },

    methods: {
      ...mapMutations (Chat.namespace, {
        setUseTts          : Chat.$mutations.setUseTts,
        setTrollTts        : Chat.$mutations.setTrollTts,
        setTtsRate         : Chat.$mutations.setTtsRate,
        setTtsReadUsername : Chat.$mutations.setTtsReadUsername,
        setTtsTimeout      : Chat.$mutations.setTtsTimeout,
        setTtsVolume       : Chat.$mutations.setTtsVolume,
        setTtsVoice        : Chat.$mutations.setTtsVoice,
      }),

      updateSettings() {
        const settings = {};
        this.$emit( 'input', settings );
      },
    },

    computed: {
      ...mapState (Chat.namespace, {
        getUseTts          : Chat.$states.useTts,
        getTrollTts        : Chat.$states.trollTts,
        getTtsRate         : Chat.$states.ttsRate,
        getTtsReadUsername : Chat.$states.ttsReadUsername,
        getTtsTimeout      : Chat.$states.ttsTimeout,
        getTtsVolume       : Chat.$states.ttsVolume,
        getTtsVoice        : Chat.$states.ttsVoice,
      }),

      ttsVoicesExist: {
        get () { return this.ttsVoices.length }
      },

      useTts: {
        set ( val ) {
          this.setUseTts( val );
          this.$analytics.logEvent( 'use_tts', { value: val } );
        },
        get () { return this.getUseTts }
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

      ttsReadUsername: {
        set ( val ) {
          this.setTtsReadUsername( val );
          this.$analytics.logEvent( 'tts_read_username', { value: val } );
        },
        get () { return this.getTtsReadUsername }
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
    },

    async mounted () {
      // https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis/onvoiceschanged
      // This could be used to populate a list of voices that the user can choose between when the event fires
      // Firefox doesn't support it at present, and will just return a list of voices when SpeechSynthesis.getVoices() is fired.
      // With Chrome, you have to wait for the event to fire before populating the list, hence the bottom if statement seen below.

      const getVoicesList = () => speechSynthesis.getVoices().map( ( voice, index ) => ({ text: voice.name, value: index }))
      this.ttsVoices = getVoicesList();

      if ( !speechSynthesis.onvoiceschanged ) {
        speechSynthesis.onvoiceschanged = () => this.ttsVoices = getVoicesList();
      }
    },
  };
</script>
