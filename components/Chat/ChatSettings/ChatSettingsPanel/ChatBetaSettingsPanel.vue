<template>
  <v-card
    flat
    tile
    class="pb-3 px-3"
  >
    <!-- Beta Settings Toggles -->
    <div>
      <v-switch
        v-model="trackMetrics"
        label="Keep track of chat statistics"
        color="primary"
        hide-details
        dense
        inset
      />

      <v-switch
        v-model="trackMetricsPerUser"
        :disabled="!trackMetrics"
        label="Track stats per-user"
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
    name: 'ChatBetaSettingsPanel',

    data() {
      return {};
    },

    methods: {
      ...mapMutations (Chat.namespace, {
        setTrackMetrics        : Chat.$mutations.setTrackMetrics,
        setTrackMetricsPerUser : Chat.$mutations.setTrackMetricsPerUser,
      }),

      updateSettings() {
        const settings = {};
        this.$emit( 'input', settings );
      },
    },

    computed: {
      ...mapState (Chat.namespace, {
        getTrackMetrics        : Chat.$states.trackMetrics,
        getTrackMetricsPerUser : Chat.$states.trackMetricsPerUser,
      }),

      trackMetrics: {
        set ( val ) {
          this.setTrackMetrics( val );
          this.$analytics.logEvent( 'chat_track_metrics', { value: val } );
        },
        get () { return this.getTrackMetrics }
      },

      trackMetricsPerUser: {
        set ( val ) {
          this.setTrackMetricsPerUser( val );
          this.$analytics.logEvent( 'chat_track_metrics_per_user', { value: val } );
        },
        get () { return this.getTrackMetricsPerUser }
      },
    },
  };
</script>
