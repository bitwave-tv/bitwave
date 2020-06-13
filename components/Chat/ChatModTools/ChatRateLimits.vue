<template>
  <div>

    <div class="pa-3">

      <div class="overline mb-3 grey--text">Rates per 15 seconds</div>

      <div class="mb-4">
        <v-switch
          v-model="config.allowLinks"
          label="Allow hotlinks"
          class="mt-0"
          dense
          inset
          hide-details
        />
      </div>

      <div>
        <div>Message Rate: {{ config.rates.long / 20 }}</div>
        <v-slider
          :disabled="saving"
          v-model="config.rates.long"
          class="align-center ma-0"
          :max="20"
          :min="1"
          :step="0.5"
          dense
        >
        </v-slider>
      </div>

      <div>
        <div>Big Text Penalty: {{ config.rates.big / 10 }}</div>
        <v-slider
          :disabled="saving"
          v-model="config.rates.big"
          class="align-center ma-0"
          :max="10"
          :min="0"
          :step="0.5"
          dense
        >
        </v-slider>
      </div>

      <div class="d-flex justify-end">
        <v-btn
          class="mr-2"
          color="red"
          small
        >reset</v-btn>
        <v-btn
          color="green"
          small
        >save</v-btn>
      </div>

    </div>

  </div>
</template>

<script>
  const defaultConfig = {

      allowLinks: true,
      allowTrolls: true,
      blockSpam: false,

      rates: {
        short: 2.5,
        long: 5,
        big: 5,
      },

      bans: {
        users: [],
      },

    };

  export default {
    name: 'ChatRateLimits',

    data() {
      return {
        saving: false,
        config: defaultConfig,
      }
    },

    methods: {
      reset () {
        this.config = defaultConfig ;
      },

      getChatConfig () {

      }
    },

    computed: {},

    mounted() {},

  }
</script>
