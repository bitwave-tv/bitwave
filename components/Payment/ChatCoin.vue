<template>
  <v-card>
    <!-- Title Bar -->
    <v-sheet
      tile
      color="primary"
      class="d-flex align-center justify-space-between pl-2"
    >
      <h4 class="black--text body-2">
        <v-icon color="black">local_atm</v-icon>
        wavecoin store
      </h4>
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

      <!-- Purchase Pop Up -->
      <v-dialog
        v-model="showPurchasePopup"
        width="500"
      >
        <template v-slot:activator="{ on }">

          <v-btn
            class="d-flex mb-3"
            color="green"
            v-on="on"
            @click.prevent="openBuyMenu ( '100', 10 )"
            small
            block
          >
            Buy 100 wavecoins - $10
          </v-btn>

        </template>

        <v-card colr="grey darken-4">
          <v-card-title
            class="title primary black--text"
            primary-title
          >
            ${{ this.amount }} - Buy 100 wavecoins
          </v-card-title>

          <v-card-text>
            <coin-checkout />
          </v-card-text>
        </v-card>
      </v-dialog>

      <!-- Buy Username Color -->
      <v-dialog
        v-model="showBuyColor"
        width="500"
      >
        <template v-slot:activator="{ on }">
          <v-btn
            class="mb-3"
            color="primary"
            v-on="on"
            small
            block
            @click.stop="showBuyColor = !showBuyColor"
          >
            Buy Chat Color - $5
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
          </v-sheet>

          <div class="px-4 py-4">
            <lazy-purchase-color />
          </div>
        </v-card>
      </v-dialog>

      <!-- Coin Balance -->
      <v-alert
        color="white"
        class="mb-0"
        text
      >
        <div class="d-flex justify-space-between align-end">
          <div class="mr-2">Balance: </div>
          <div>
            <span class="headline">{{ coins }}</span> <span>🌊coins</span>
          </div>
        </div>
      </v-alert>

      <div>
        <v-btn
          class="d-flex mt-3"
          color="red"
          outlined
          small
          block
          :disabled="coins === 0"
          @click="openRedeemMenu( 'red' )"
        >
          Red Alert 11
        </v-btn>
        <v-btn
          class="d-flex mt-3"
          color="blue"
          outlined
          small
          block
          :disabled="coins === 0"
          @click="openRedeemMenu( 'blue' )"
        >
          Blue Alert 09
        </v-btn>
        <v-btn
          class="d-flex mt-3"
          color="grey"
          outlined
          small
          block
          :disabled="coins === 0"
          @click="openRedeemMenu( 'grey' )"
        >
          Grey Alert 07
        </v-btn>
      </div>

      <!-- For creating chat alerts -->
      <v-dialog
        v-model="redeemAlertPopup"
        width="500"
      >
        <v-card colr="grey darken-4">
          <v-sheet
            tile
            color="primary"
            class="d-flex align-center justify-space-between pl-2"
          >
            <h4 class="black--text body-2">
              <v-icon color="black">warning</v-icon>
              Create {{ alertColor.toUpperCase() }} Chat Alert
            </h4>
            <v-btn
              color="black"
              text
              icon
              pa-0
              @click="redeemAlertPopup = false"
            >
              <v-icon color="black">close</v-icon>
            </v-btn>
          </v-sheet>

          <div class="pa-3">
            <v-text-field
              v-model="alertMessage"
              :color="alertColor"
              label="Message..."
              single-line
              outlined
              dense
              clearable
              counter="600"
            ></v-text-field>

            <v-checkbox
              v-model="sendAsTroll"
              class="mt-0"
              dense
            >
              <template #label>
                <div class="d-flex align-center">
                  <span>send as troll</span>
                  <v-tooltip top color="blue-grey darken-4">
                    <template #activator="{ on: tooltip }">
                      <v-btn v-on="{ ...tooltip }" class="ml-1" x-small icon>
                        <v-icon color="grey">help_outline</v-icon>
                      </v-btn>
                    </template>
                    <span>
                      Enabling this will make the alert show up in chat as from "troll"<br>
                      <i>note: the channel owner can still see the username in their dashboard</i>
                    </span>
                  </v-tooltip>
                </div>
              </template>
            </v-checkbox>

            <div class="d-flex align-end mt-3">
              <v-spacer />
              <v-btn
                class="d-flex ml-2"
                color="primary"
                small
                :loading="processing"
                @click="createAlert"
              >Send</v-btn>
              <v-btn
                class="d-flex ml-2"
                color="red"
                small
                :loading="processing"
                @click="redeemAlertPopup = false"
              >Cancel</v-btn>
            </div>
          </div>

        </v-card>
      </v-dialog>
    </div>
  </v-card>
</template>

<script>
  const CoinCheckout = async () => await import ( '@/components/Payment/Stripe/CoinCheckout' );

  import { mapState, mapGetters } from 'vuex';
  import { VStore } from '@/store';
  import { Chat } from '@/store/chat';

  export default {
    name: 'ChatCoin',

    components: {
      CoinCheckout,
    },

    data () {
      return {
        showBuyColor: false,
        showPurchasePopup: false,
        redeemAlertPopup: false,
        token: 'production_ndjvk9d7_4q2xfsbyxjmm8brs',
        server: 'https://api.bitwave.tv',
        endpoint: 'api/payment/coins/checkout',

        amount: null,
        productId: null,

        alertColor: 'grey',
        alertMessage: '',
        sendAsTroll: false,
        processing: false,
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

      openRedeemMenu ( color ) {
        this.redeemAlertPopup = true;
        this.alertColor = color;
      },

      async createAlert () {
        if ( this.processing ) return;

        // Make purchase with site currency
        this.processing = true;
        try {
          await this.$axios.post(
            'https://api.bitwave.tv/api/store/alerts/checkout',
            {
              username: this.user.username,
              uid: this.user.uid,
              color: this.alertColor,
              message: this.alertMessage,
              channel: this.room,
              anon: this.sendAsTroll,
            }
          );
          this.redeemAlertPopup = false;
          this.alertMessage = '';
          this.closeMenu();
        } catch ( error ) {
          console.error( error.message );
          this.$toast.error( error.message, { duration: 2500, icon: 'error', position: 'top-center' } );
        }
        this.processing = false;
      },
    },

    computed: {
      ...mapGetters({
        isAuth     : VStore.$getters.isAuth,
        user       : VStore.$getters.getUser,
        getCoins   : VStore.$getters.getCoins,
      }),

      ...mapState( Chat.namespace, {
        room : Chat.$states.room,
      }),

      coins () {
        return this.getCoins > 1000 ? `${(this.getCoins / 1000).toFixed( 1 )}k` : this.getCoins;
      },

      url () {
        return `${this.server}/${this.endpoint}`;
      },
    },
  };
</script>
