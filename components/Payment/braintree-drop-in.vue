<template>
  <div class="align-end">
    <v-dialog
      v-model="show"
      width="500"
    >
      <template v-slot:activator="{ on }">
        <v-btn
          color="primary"
          class="black--text"
          v-on="on"
          block
          @click.stop="show = !show"
        >
          <v-icon class="mr-2">shop</v-icon>
          Buy Color
        </v-btn>
      </template>

      <v-card colr="grey darken-4">
        <v-card-title
          class="title primary black--text"
          primary-title
        >
          $5 - Purchase chat color
        </v-card-title>

        <v-card-text>
          <v-braintree
            :token="token"
            :paypal="false"
            :url="url"
            :btn-class="'v-btn theme--light yellow mt-3'"
          />
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
  const VBraintree = async () => await import (  '~/components/Payment/v-braintree' );

  export default {
    name: 'braintree-drop-in',

    components: {
      VBraintree,
    },

    data() {
      return {
        server: 'https://api.bitwave.tv',
        endpoint: 'api/payment/checkout',
        show: false,
        token: 'production_ndjvk9d7_4q2xfsbyxjmm8brs',
      }
    },

    methods: {},

    computed: {
      url() {
        return `${this.server}/${this.endpoint}`;
      }
    },
  }
</script>
