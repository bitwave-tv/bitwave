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
        color="primary"
        hide-details
        dense
        inset
      >
        <template #label>
          <div>
            <span>Global Chat</span>
            <v-tooltip top color="blue-grey darken-4">
              <template #activator="{ on: tooltip }">
                <v-btn v-on="{ ...tooltip }" class="ml-1" x-small icon>
                  <v-icon color="grey">help_outline</v-icon>
                </v-btn>
              </template>
              <span><b>OFF</b> Local - messages from this channel<br>
                <b>ON</b> Global - messages from every chat</span>
            </v-tooltip>
          </div>
        </template>
      </v-switch>

      <!-- Receive @'s in Local -->
      <v-switch
        v-model="receiveMentionsInLocal"
        :disabled="globalChat"
        color="primary"
        hide-details
        dense
        inset
      >
        <template #label>
          <div>
            <span>Receive @'s in local</span>
            <v-tooltip top color="blue-grey darken-4">
              <template #activator="{ on: tooltip }">
                <v-btn v-on="{ ...tooltip }" class="ml-1" x-small icon>
                  <v-icon color="grey">help_outline</v-icon>
                </v-btn>
              </template>
              <span>Show chat messages that you are @tagged in<br>
                 from every channels</span>
            </v-tooltip>
          </div>
        </template>
      </v-switch>

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
        label=""
        color="primary"
        hide-details
        dense
        inset
      >
        <template #label>
          <div>
            <span>High Density</span>
            <v-tooltip top color="blue-grey darken-4">
              <template #activator="{ on: tooltip }">
                <v-btn v-on="{ ...tooltip }" class="ml-1" x-small icon>
                  <v-icon color="grey">help_outline</v-icon>
                </v-btn>
              </template>
              <span>Reduce big chat to small chat.<br>
                Reduces big emotes to small varient.<br>
                This can help make chat more readable.</span>
            </v-tooltip>
          </div>
        </template>
      </v-switch>
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
