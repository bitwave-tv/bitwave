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
        <!-- Title Bar -->
        <v-sheet
          tile
          color="primary"
          class="d-flex align-center justify-space-between pl-2"
        >
          <h5 class="ma-2 black--text title primary font-weight-medium">
            $5 - Purchase chat color
          </h5>
          <!--<v-btn
            color="black"
            text
            icon
            pa-0
            @click="close"
          >
            <v-icon color="black">close</v-icon>
          </v-btn>-->
        </v-sheet>

        <div class="px-4 py-4">
          <stripe />
        </div>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
  const VBraintree = async () => await import (  '~/components/Payment/v-braintree' );
  const Stripe = async () => await import ( `~/components/Payment/Stripe/PurchaseColor` );

  export default {
    name: 'braintree-drop-in',

    components: {
      VBraintree,
      Stripe,
    },

    data() {
      return {
        server: 'https://api.bitwave.tv',
        endpoint: 'api/payment/checkout',
        show: false,
        token: 'production_ndjvk9d7_4q2xfsbyxjmm8brs',
      }
    },

    computed: {
      url() {
        return `${this.server}/${this.endpoint}`;
      }
    },
  }
</script>
