<template>
    <div>
      <div class="mt-3 grey--text caption">NOTE: All purchases support bitwave media directly currently. Additional monetization options for streamers is in progress.</div>
      <div class="mt-3 grey--text caption"><i>coins are nonrefundable and cannot be redeemed for cash value.</i></div>
      <div class="mt-3 grey--text caption">Donations within the last 30 days are eligable for credit.<br>Email support@bitwave.tv for assistance.</div>

      <!-- Make a purchase -->
      <div ref="dropin"></div>

      <v-alert
        :value="error"
        type="error"
        transition="fade-transition"
      >
        {{ errorMessage }}
      </v-alert>
      <v-alert
        :value="success"
        type="success"
        transition="fade-transition"
      >
        Thanks for your purchase!
      </v-alert>

      <div class="d-flex mt-3">
        <v-spacer/>
        <v-btn
          ref="submit"
          :class="btnClass"
          :disabled="disabled"
          :loading="loading"
          v-show="!success"
          light
          @click="requestPaymentMethod"
        >
          {{ btnText }}
        </v-btn>
      </div>
    </div>
</template>

<script>
  import dropIn from 'braintree-web-drop-in';
  import { mapGetters } from 'vuex';
  import { VStore } from '@/store';

  export default {
    name: 'Checkout',

    props: {
      amount: {
        type: Number,
      },
      productId: {
        type: String,
      },
      token: {
        required: true,
        type: String
      },
      locale: {
        type: String,
        default: 'en_US'
      },
      url: {
        type: String,
        default: '/pay'
      },
      btnText: {
        type: String,
        default: 'Buy Coins'
      },
      btnClass: {
        type: String,
        default: 'btn btn-primary'
      },
      paypal: {
        type: Boolean,
        default: false
      }
    },

    data () {
      return {
        error: false,
        errorMessage: '',
        success: false,
        loading: false,  // When a payment is processed, prevents double clicks
        disabled: false, // When a payment is successfully processed, the entire component is disabled
        instance: null,
      };
    },

    methods: {
      async requestPaymentMethod () {
        if ( this.loading || this.disabled ) return;

        this.instance.requestPaymentMethod( async ( error, payload ) => {
          if ( error ) {
            // No payment method is available.
            // An appropriate error will be shown in the UI.
            console.error( error );
            this.$sentry.captureException( error );
            this.error = true;
            this.errorMessage = error.message;
            setTimeout( () => this.error = false, 5000 );
            return
          }
          this.loading = true;
          await this.pay( payload.nonce );
        });
      },

      async pay ( nonce ) {
        try {
          const response = await this.$axios.post( this.url, {
            nonce: nonce,
            username: this.user.username,
            uid: this.user.uid,
            amount: this.amount,
          });

          console.log( response );

          if ( response.data.success ) {
            console.log( 'Success' );
            this.loading = false;
            this.disabled = true;
            this.success = true;
            this.$ga.event({
              eventCategory : 'merchant',
              eventAction   : 'purchased coins',
              eventLabel    : 'coins',
              eventValue    : this.amount,
            });
            this.$analytics.logEvent( 'purchase', {
              currency: 'USD',
              value: 10.00,
            });
          } else {
            this.loading = false;
            this.error = true;
            this.errorMessage = response.data.message;
          }

        } catch ( error ) {
          this.$sentry.captureException( error );
          this.error = true;
          this.errorMessage = error.response.data.message;
          this.loading = false
        }
      }
    },

    computed: {
      ...mapGetters({
        isAuth     : VStore.$getters.isAuth,
        user       : VStore.$getters.getUser,
        getBalance : VStore.$getters.getCoins,
      }),
    },

    mounted () {
      // Create config
      const config = {
        authorization: this.token,
        container: this.$refs.dropin,
        locale: this.locale,
        paypal: { flow: 'vault' },
        /*paypalCredit: { flow: 'vault' },*/
      };

      // Create drop-in
      dropIn.create( config, ( createErr, instance ) => {
        this.instance = instance;
        console.log( instance );
      });
    },
  };
</script>
