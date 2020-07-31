<template>
  <v-card
    flat
    tile
    class="mb-3 mx-3"
  >
    <!-- Beta Settings Toggles -->
    <div id="settings">
      <v-switch
        v-model="trackMetrics"
        class="mt-3"
        label="Keep track of chat statistics"
        color="primary"
        hide-details
        dense
        inset
      />

      <v-divider id="divider" />

      <v-switch
        v-model="trackMetricsPerUser"
        :disabled="!trackMetrics"
        label="Track stats per-user"
        color="primary"
        hide-details
        dense
        inset
      />

      <v-slider
        :disabled="!trackMetrics"
        label="Tick rate"
        v-model="statTickRate"
        class="align-center"
        :max="500"
        :min="1"
        :step="1"
        hide-details
      >
        <template #append>
          <v-text-field
            v-model="statTickRate"
            class="mt-0 pt-0"
            hide-details
            single-line
            type="number"
            style="width: 50px"
          />
        </template>
      </v-slider>

      <v-slider
        :disabled="!trackMetrics"
        label="Histogram size"
        v-model="statHistogramSize"
        class="align-center"
        :max="50"
        :min="10"
        :step="1"
        hide-details
      >
        <template #append>
          <v-text-field
            v-model="statHistogramSize"
            class="mt-0 pt-0"
            hide-details
            single-line
            type="number"
            style="width: 50px"
          />
        </template>
      </v-slider>

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
        setStatTickRate        : Chat.$mutations.setStatTickRate,
        setStatHistogramSize   : Chat.$mutations.setStatHistogramSize,
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
        getStatTickRate        : Chat.$states.statTickRate,
        getStatHistogramSize   : Chat.$states.statHistogramSize,
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

      statTickRate: {
        set ( val ) {
          this.setStatTickRate( val );
          this.$analytics.logEvent( 'chat_stat_tick_rate', { value: val } );
        },
        get () { return this.getStatTickRate }
      },

      statHistogramSize: {
        set ( val ) {
          this.setStatHistogramSize( val );
          this.$analytics.logEvent( 'chat_stat_histogram_size', { value: val } );
        },
        get () { return this.getStatHistogramSize }
      },
    },
  };
</script>

<style lang="scss">
  #settings > * {
    height: 45px;
    padding-top: 10px !important;
    padding-bottom: 10px !important;
    align-self: center;
  }
  #divider {
    margin: 11.25px 0 11.25px 0 !important;
    padding: 0 0 0 0 !important;
  }
</style>
