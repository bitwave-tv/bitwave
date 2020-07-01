<template>
  <v-card
    flat
    tile
    class="mb-3 px-3"
  >
    <!-- General Settings Toggles -->
    <div>

      <!-- Global Chat -->
      <v-switch
        v-model="globalChat"
        label="Global Chat"
        color="primary"
        hide-details
        dense
        inset
      />

      <!-- Receive @'s in Local -->
      <v-switch
        v-model="receiveMentionsInLocal"
        :disabled="globalChat"
        label="Recieve @'s in local"
        color="primary"
        hide-details
        dense
        inset
      />

      <!-- Ignore -->
      <v-switch
        v-model="useIgnore"
        label="Ignore Users"
        color="primary"
        hide-details
        dense
        inset
      />

      <!-- Notification Sounds -->
      <v-switch
        v-model="notificationSound"
        label="Notification Sounds"
        color="primary"
        hide-details
        dense
        inset
      />

      <!-- Autocomplete -->
      <v-switch
        v-model="autocomplete"
        label="Autocomplete"
        color="primary"
        hide-details
        dense
        inset
      />

      <!-- Show Timestamps -->
      <v-switch
        v-model="showTimestamps"
        label="Show Timestamps"
        color="primary"
        hide-details
        dense
        inset
      />

      <!-- Dense Chat -->
      <v-switch
        v-model="denseChat"
        label="Higher Density Chat"
        color="primary"
        hide-details
        dense
        inset
      />
    </div>
  </v-card>
</template>

<script>
  import { mapMutations, mapState } from 'vuex';
  import { Chat } from '@/store/chat';

  export default {
    name: 'ChatGeneralSettingsPanel',

    data() {
      return {};
    },

    methods: {
      ...mapMutations (Chat.namespace, {
        setModeGlobal     : Chat.$mutations.setGlobal,
        setModeTimestamps : Chat.$mutations.setTimestamps,
        setUseIgnore      : Chat.$mutations.setUseIgnore,
        setNotify         : Chat.$mutations.setNotify,
        setAutocomplete   : Chat.$mutations.setAutocomplete,
        setHighDensity    : Chat.$mutations.setHighDensity,
        setReceiveMentionsInLocal : Chat.$mutations.setReceiveMentionsInLocal,
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
        getUseIgnore      : Chat.$states.useIgnore,
        getNotify         : Chat.$states.notify,
        getAutocomplete   : Chat.$states.autocomplete,
        getHighDensity    : Chat.$states.highDensity,
        getReceiveMentionsInLocal : Chat.$states.receiveMentionsInLocal,
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

      useIgnore: {
        set ( val ) {
          this.setUseIgnore( val );
          this.$analytics.logEvent( 'use_ignore', { value: val } );
        },
        get () { return this.getUseIgnore }
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

      receiveMentionsInLocal: {
        set ( val ) {
          this.setReceiveMentionsInLocal( val );
          this.$analytics.logEvent( 'chat_recieve_mentions_in_local', { value: val } );
        },
        get () { return this.getReceiveMentionsInLocal }
      },
    },
  };
</script>
