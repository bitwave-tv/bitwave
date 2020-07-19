<template>
  <div>
    <div class="mt-3 grey--text caption">NOTE: All purchases support bitwave media directly currently. Additional monetization options for streamers is in progress.</div>
    <div class="mt-3 grey--text caption"><i>coins are nonrefundable and cannot be redeemed for cash value.</i></div>
    <div class="mt-3 mb-3 grey--text caption">Donations within the last 30 days are eligable for credit.<br>Email support@bitwave.tv for assistance.</div>

    <!-- Make a purchase -->
    <div
      v-show="!success"
    >
      <form id="payment-form-cc">
        <slot name="card-element-cc">
          <div id="card-element-cc"></div>
        </slot>
        <slot name="card-errors-cc">
          <div id="card-errors-cc" role="alert"></div>
        </slot>
        <button ref="submitButtonRef" type="submit"></button>
      </form>
    </div>

    <v-alert
      :value="error"
      type="error"
      transition="fade-transition"
    >
      {{ error }}
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
        :disabled="loading"
        :loading="loading"
        v-show="!success"
        color='primary'
        @click="submit"
      >
        {{ btnText }}
      </v-btn>
    </div>
  </div>
</template>

<script>
  import { mapGetters } from 'vuex';
  import { VStore } from '@/store';

  const intentUrl = `https://api.bitwave.tv/v1/payments/intent`;
  // const product = 'coins-100';

  const STRIPE_CHECKOUT_URL = 'https://js.stripe.com';
  const loadStripeCheckout = ( pk, version = 'v3' ) => {
    return new Promise( resolve => {
      if ( window.Stripe ) {
        resolve( window.Stripe );
        return;
      }
      const e = document.createElement( 'script' );
      e.src = `${STRIPE_CHECKOUT_URL}/${version}`;
      e.type='text/javascript';
      document.getElementsByTagName('head')[0].appendChild( e );
      e.addEventListener( 'load', () => resolve( window.Stripe ) );
    });
  };

  export default {
    name: 'CoinCheckout',

    props: {
      btnText: {
        type: String,
        default: 'Buy Now'
      },
      btnClass: {
        type: String,
        default: 'btn btn-primary'
      },
    },

    data() {
      return {
        stripePk: process.env.STRIPE_PUBLISHABLE_KEY,
        complete: false,
        stripeOptions: {},

        loading: false,
        success: false,
        error: false,
        stripe: null,
        elements: null,
        card: null,
      };
    },

    methods: {
      async getPaymentIntent () {
        try {
          const response = await this.$axios.post( intentUrl, {
            product: 'coins-100',
            username: this.username,
            data: {
              uid: this.user.uid,
            },
          });
          return response.data;
        } catch ( error ) {
          this.$emit( 'error', error );
          console.error( error );
          return null;
        }
      },

      async pay () {
        const data = await createToken();
        console.log( data.token )
      },

      submit () {
        this.$refs.submitButtonRef.click();
      },
    },

    computed: {
      form () {
        return document.getElementById( 'payment-form-cc' );
      },

      style () {
        return {
          base: {
            color: '#32325d',
            fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
            fontSmoothing: 'antialiased',
            fontSize: '16px',
            '::placeholder': {
              color: '#aab7c4'
            }
          },
          invalid: {
            color: '#fa755a',
            iconColor: '#fa755a'
          }
        };
      },

      ...mapGetters({
        user: VStore.$getters.getUser,
        username: VStore.$getters.getUsername,
      }),
    },

    async mounted () {
      this.stripe = this.$stripe.import();

      this.elements = this.stripe.elements();

      this.card = this.elements.create( 'card', { style: this.style } );

      this.card.mount( '#card-element-cc' );

      this.card.addEventListener( 'change', ({ error }) => {
        const displayError = document.getElementById( 'card-errors-cc' );
        if ( error ) {
          displayError.textContent = error.message;
          return;
        }
        displayError.textContent = '';
      });

      this.form.addEventListener( 'submit', async ( event ) => {
        if ( this.loading ) return;
        try {
          this.loading = true;
          this.$emit( 'loading', true );

          event.preventDefault();

          const data = {
            ...this.card
          };

          if ( this.amount ) data.amount = this.amount;

          const paymentIntentResult = await this.getPaymentIntent();

          // const { token, error } = await this.stripe.createToken(data);
          const result = await this.stripe.confirmCardPayment(paymentIntentResult.clientSecret, {
            payment_method: {
              card: this.card,
            },
          });

          if ( result.error ) {
            const errorElement = document.getElementById( 'card-errors' );
            errorElement.textContent = result.error.message;
            console.error(result.error);
            this.$emit( 'error', result.error );
            return;
          }

          console.log( result );

          this.success = true;
          this.$emit( 'success', true );
        } catch (error) {
          console.error(error);
          this.error = error;
          this.$emit( 'error', error );
        } finally {
          this.loading = false;
          this.$emit( 'loading', false );
        }
      });
    },
  };
</script>


<style lang='scss'>
  .StripeElement {
    box-sizing: border-box;
    /*height: 40px;*/
    padding: 10px 12px;
    border: 1px solid transparent;
    border-radius: 4px;
    background-color: white;
    box-shadow: 0 1px 3px 0 #e6ebf1;
    -webkit-transition: box-shadow 150ms ease;
    transition: box-shadow 150ms ease;
  }
  .StripeElement--focus {
    box-shadow: 0 1px 3px 0 #cfd7df;
  }
  .StripeElement--invalid {
    border-color: #fa755a;
  }
  .StripeElement--webkit-autofill {
    background-color: #fefde5 !important;
  }
</style>
