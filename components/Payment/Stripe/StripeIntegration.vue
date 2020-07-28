<template>
  <div
    v-show="!success"
  >
    <form id="payment-form">
      <slot name="card-element">
        <div id="card-element"></div>
      </slot>
      <slot name="card-errors">
        <div id="card-errors" role="alert"></div>
      </slot>
      <button ref="submitButtonRef" type="submit"></button>
    </form>
    <div class="d-flex">
      <v-spacer/>
      <v-btn
        ref="submit"
        :class="btnClass"
        :disabled="loading"
        :loading="loading"
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
  const product = 'username-color'

  export default {
    name: 'PurchaseColor',

    props: {
      color: { type: String, },
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
        stripe: null,
        elements: null,
        card: null,
      };
    },

    methods: {
      async getPaymentIntent () {
        try {
          const response = await this.$axios.post( intentUrl, {
            product: product,
            username: this.username,
            data: {
              uid: this.user.uid,
              color: this.color,
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
        console.log(data.token)
      },

      submit () {
        this.$refs.submitButtonRef.click();
      },
    },

    computed: {
      form () {
        return document.getElementById('payment-form');
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

      this.card.mount( '#card-element' );

      this.card.addEventListener( 'change', ({ error }) => {
        const displayError = document.getElementById( 'card-errors' );
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

          const result = await this.stripe.confirmCardPayment( paymentIntentResult.clientSecret, {
            payment_method: {
              card: this.card,
            },
          });

          if ( result.error ) {
            const errorElement = document.getElementById( 'card-errors' );
            errorElement.textContent = result.error.message;
            console.error( result.error );
            this.$emit( 'error', result.error );
            return;
          }

          console.log( result );

          this.success = true;
          this.$emit( 'success', true );

          this.$ga.event({
            eventCategory : 'merchant',
            eventAction   : 'purchased color',
            eventLabel    : this.username.toLowerCase(),
          });
          this.$analytics.logEvent( 'purchase', {
            currency: 'USD',
            value: 5.00,
          });
        } catch ( error ) {
          console.error( error );
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
