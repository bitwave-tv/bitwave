<template>
  <div class="payment">
    <v-responsive
      :style="{ background: `${selectedColor}` }"
      height="32px"
      class="mb-4"
    ></v-responsive>
    <v-select
      v-model="selectedColor"
      :items="colors"
      label="Chat color"
      light
    ></v-select>
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

    <v-layout>
      <v-spacer></v-spacer>
      <v-btn
        ref="submit"
        :class="btnClass"
        :disabled="disabled"
        :loading="loading"
        v-show="!success"
        @click="requestPaymentMethod"
      >
        {{ btnText }}
      </v-btn>
    </v-layout>
  </div>
</template>

<script>
  import dropIn from 'braintree-web-drop-in'

  export default {
    props: {
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
        default: 'Buy Now'
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
        colors: [
          {
            text: 'Red',
            value: '#f44336'
          },
          {
            text: 'Pink',
            value: '#e91e63'
          },
          {
            text: 'Orange',
            value: '#ff9800'
          },
          {
            text: 'Yellow',
            value: '#f1c40f'
          },
          {
            text: 'Green',
            value: '#4caf50'
          },
          {
            text: 'Teal',
            value: '#009688'
          },
          {
            text: 'Blue',
            value: '#2196f3'
          },
          {
            text: 'Purple',
            value: '#673ab7'
          },
        ],
        selectedColor: '#2196f3',
      }
    },

    mounted () {
      // Create config
      let config = {
        authorization: this.token,
        container: this.$refs.dropin,
        locale: this.locale
      };

      // If Paypal is available
      if (this.paypal) {
        config.paypal = {
          flow: 'vault'
        }
      }

      // Create dropin
      dropIn.create(config, ( createErr, instance ) => {
        this.instance = instance;
        console.log(instance);
      });
    },

    methods: {
      async requestPaymentMethod () {
        if ( this.loading || this.disabled ) return;

        this.instance.requestPaymentMethod( async (error, payload) => {
          if (error) {
            // No payment method is available.
            // An appropriate error will be shown in the UI.
            console.error(error);
            this.error = true;
            this.errorMessage = error.message;
            setTimeout( () => this.error = false, 5000 );
            return
          }
          this.loading = true;
          await this.pay(payload.nonce);
        });
      },

      async pay (nonce) {
        try {
          const response = await this.$axios.post( this.url, {
            nonce: nonce,
            username: this.$store.getters.username,
            color: this.selectedColor,
          });
          console.log(response);
          if ( response.data.success ) {
            console.log('Success');
            this.loading = false;
            this.disabled = true;
            this.success = true;
          } else {
            this.loading = false;
            this.error = true;
            this.errorMessage = response.data.message;
          }

        } catch (error) {
          this.error = true;
          this.errorMessage = error.response.data.message;
          this.loading = false
        }
      }
    },
  }
</script>
