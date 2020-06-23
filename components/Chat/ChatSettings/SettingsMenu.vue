<template>
  <div>
    <div class="px-3">
      <div class="d-flex">
        <!-- Global Chat -->
        <v-switch
          v-model="globalChat"
          label="Global Chat"
          color="primary"
          hide-details
          dense
          inset
        />

        <!-- Show Timestamps -->
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
        v-model="recieveMentionsInLocal"
        :disabled="globalChat"
        class="mb-2"
        label="Recieve @'s while in local"
        color="primary"
        hide-details
        dense
        inset
      />

      <!-- Ignore -->
      <v-switch
        v-model="useIgnore"
        label="Ignore Users"
        class="mb-2"
        color="primary"
        hide-details
        dense
        inset
      />

      <!-- Notification Sounds -->
      <v-switch
        v-model="notificationSound"
        label="Notification Sounds"
        class="mb-2"
        color="primary"
        hide-details
        dense
        inset
      />

      <!-- Autocomplete -->
      <v-switch
        v-model="autocomplete"
        label="Autocomplete"
        class="mb-2"
        color="primary"
        hide-details
        dense
        inset
      />

      <!-- Dense Chat -->
      <v-switch
        v-model="denseChat"
        label="High Density"
        class="mb-2"
        color="primary"
        hide-details
        dense
        inset
      />
    </div>

    <v-divider/>

    <v-alert
      v-if="!ttsVoicesExist"
      class="mt-5 mb-0"
      type="warning"
      text
    >
      No TTS voices found!
    </v-alert>

    <div class="pb-2" v-if="ttsVoicesExist">

      <!-- TTS Settings -->
      <v-subheader class="overline mb-0">Text To Speech Options</v-subheader>

      <div class="px-3">
	<div class="d-flex">
          <!-- Enable TTS -->
          <v-switch
            v-model="useTts"
	    :disabled="!ttsVoicesExist"
            label="Use TTS"
            class="mt-0 pt-0"
            color="primary"
            hide-details
            dense
            inset
          />

          <!-- Troll TTS -->
          <v-switch
            v-model="trollTts"
            :disabled="!useTts"
            label="Troll TTS"
            class="mt-0 ml-3 pt-0"
            color="primary"
            hide-details
            dense
            inset
          />
	</div>

      <!-- Read username -->
      <v-switch
        v-model="ttsReadUsername"
        :disabled="!useTts"
        label="Read Username"
        class="mb-3 pt-0"
        color="primary"
        hide-details
        dense
        inset
      />
      </div>

      <!-- TTS Voice -->
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

      <!-- TTS Rate -->
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

      <!-- TTS Volume -->
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

      <!-- TTS Timeout -->
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
        setTtsReadUsername: Chat.$mutations.setTtsReadUsername,
        setTtsTimeout     : Chat.$mutations.setTtsTimeout,
        setTtsVolume      : Chat.$mutations.setTtsVolume,
        setTtsVoice       : Chat.$mutations.setTtsVoice,
        setNotify         : Chat.$mutations.setNotify,
        setAutocomplete   : Chat.$mutations.setAutocomplete,
        setRecieveMentionsInLocal : Chat.$mutations.setRecieveMentionsInLocal,
        setHighDensity    : Chat.$mutations.setHighDensity,
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
        getTtsReadUsername: Chat.$states.ttsReadUsername,
        getTtsTimeout     : Chat.$states.ttsTimeout,
        getTtsVolume      : Chat.$states.ttsVolume,
        getTtsVoice       : Chat.$states.ttsVoice,
        getNotify         : Chat.$states.notify,
        getAutocomplete   : Chat.$states.autocomplete,
        getRecieveMentionsInLocal : Chat.$states.recieveMentionsInLocal,
        getHighDensity    : Chat.$states.highDensity,
      }),

      ttsVoicesExist: {
        get () { return this.ttsVoices.length }
      },

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

      denseChat: {
        set ( val ) {
          this.setHighDensity( val );
          this.$analytics.logEvent( 'chat_high_density', { value: val } );
        },
        get () { return this.getHighDensity }
      },

      recieveMentionsInLocal: {
        set ( val ) {
          this.setRecieveMentionsInLocal( val );
          this.$analytics.logEvent( 'chat_recieve_mentions_in_local', { value: val } );
        },
        get () { return this.getRecieveMentionsInLocal }
      }
    },

    async mounted () {
      this.ttsVoices = speechSynthesis.getVoices().map( ( voice, index ) => ({ text: voice.name, value: index }));
      speechSynthesis.onvoiceschanged = () => this.ttsVoices = speechSynthesis.getVoices().map( ( voice, index ) => ({ text: voice.name, value: index }) );
    },
  }
</script>
