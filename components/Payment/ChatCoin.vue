<template>
  <v-card>
    <!-- Title Bar -->
    <v-sheet
      tile
      color="primary"
      class="d-flex align-center justify-space-between pl-2"
    >
      <h5 class="black--text body-2">
        <v-icon color="black">local_atm</v-icon>
        Coin Store
      </h5>
      <v-btn
        color="black"
        text
        icon
        pa-0
        @click="closeMenu"
      >
        <v-icon color="black">close</v-icon>
      </v-btn>
    </v-sheet>

    <div class="pa-3">

      <v-btn
        class="d-flex mb-3"
        color="primary"
        light
        block
        @click.prevent="openBuyMenu ( '500', 5 )"
      >
        500 Coin - $5
      </v-btn>

      <v-btn
        class="d-flex mb-3"
        color="primary"
        light
        block
        @click.prevent="openBuyMenu ( '1000', 10 )"
      >
        1000 Coin - $10
      </v-btn>

      <div>
        Balance: <span class="headline">{{ balance }}</span> coins
      </div>

    </div>

    <!-- Purchase Pop Up -->
    <v-dialog
      v-model="showPurchasePopup"
      width="500"
    >
      <template v-slot:activator="{ on }">
        <v-btn
          color="primary"
          class="black--text"
          v-on="on"
          block
          @click.stop="showPurchasePopup = !showPurchasePopup"
        >
          <v-icon class="mr-2">shop</v-icon>
          Buy Coins
        </v-btn>
      </template>

      <v-card colr="grey darken-4">
        <v-card-title
          class="title primary black--text"
          primary-title
        >
          Buy Coins
        </v-card-title>

        <v-card-text>
          <checkout
            :productId="productId"
            :amount="amount"
            :token="token"
            :paypal="false"
            :url="url"
            :btn-class="'v-btn theme--light yellow'"
          />
        </v-card-text>
      </v-card>
    </v-dialog>

  </v-card>
</template>

<script>
  const Checkout = async () => await import ( '@/components/Payment/Checkout' );

  import { mapGetters } from 'vuex';
  import { VStore } from '@/store';

  export default {
    name: 'ChatCoin',

    components: {
      Checkout,
    },

    data () {
      return {
        showPurchasePopup: false,
        token: 'production_ndjvk9d7_4q2xfsbyxjmm8brs',
        server: 'https://api.bitwave.tv',
        endpoint: 'v1/payments/checkout',

        amount: null,
        productId: null,
      };
    },

    methods: {
      closeMenu () {
        this.$emit( 'close' );
      },

      openBuyMenu ( productId, amount ) {
        this.productId = productId;
        this.amount = amount;
        this.showPurchasePopup = true;
      },
    },

    computed: {
      ...mapGetters({
        getBalance: VStore.$getters.getBalance,
      }),

      balance () {
        return this.getBalance > 1000 ? `${(this.getBalance / 1000).toFixed( 1 )}k` : this.getBalance;
      },

      url () {
        return `${this.server}/${this.endpoint}`;
      },
    },
  };
</script>

<style lang='scss'>

</style>
