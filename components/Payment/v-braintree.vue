<template>
  <div class="payment">

    <div class="mt-3">
      Username colors appear sitewide in all stream chats.
      Newly purchased colors will replace existing color.<br>
      Purchased colors will immediately apply to account.
    </div>

    <div class="subtitle-1 mt-2">Preview:</div>

    <!-- Preview Name Color -->
    <v-card
      color="black"
      class="mb-4 mt-2 px-4 py-2 elevation-3"
    >
      <div>
        <span style="color: #757575;">[00:00]</span>
        <span class="font-weight-bold" :style="{ color: color }">{{ user ? user.username : 'FailedToLoadUsername' }}</span>
      </div>
    </v-card>

    <!-- Select Color -->
    <v-color-picker
      v-model="selectedColor"
      mode="hexa"
      class="mt-4"
      width="100%"
      hide-canvas
      light
    />

    <!-- Purchase Color UI -->
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
    </v-layout>
  </div>
</template>

<script>
  import dropIn from 'braintree-web-drop-in';

  import { mapGetters } from 'vuex';
  import { VStore } from '@/store';

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
            text: 'red',
            value: '#f44336'
          },
          {
            text: 'pink',
            value: '#e91e63'
          },
          {
            text: 'orange',
            value: '#ff9800'
          },
          {
            text: 'yellow',
            value: '#f1c40f'
          },
          {
            text: 'green',
            value: '#4caf50'
          },
          {
            text: 'teal',
            value: '#009688'
          },
          {
            text: 'blue',
            value: '#2196f3'
          },
          {
            text: 'purple',
            value: '#673ab7'
          },
        ],
        selectedColor: '#20EEEE',
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
      if ( this.paypal ) {
        config.paypal = {
          flow: 'vault'
        }
      }

      // Create dropin
      dropIn.create( config, ( createErr, instance ) => {
        this.instance = instance;
        console.log( instance );
      });
    },

    methods: {
      async requestPaymentMethod () {
        if ( this.loading || this.disabled ) return;

        this.instance.requestPaymentMethod( async ( error, payload ) => {
          if ( error ) {
            // No payment method is available.
            // An appropriate error will be shown in the UI.
            console.error( error );
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
            username: this.username,
            color: this.color,
          });
          console.log( response );
          if ( response.data.success ) {
            console.log( 'Success' );
            this.loading = false;
            this.disabled = true;
            this.success = true;
            this.$ga.event({
              eventCategory : 'merchant',
              eventAction   : 'purchased color',
              eventLabel    : this.username.toLowerCase(),
            });
          } else {
            this.loading = false;
            this.error = true;
            this.errorMessage = response.data.message;
          }

        } catch ( error ) {
          this.error = true;
          this.errorMessage = error.response.data.message;
          this.loading = false
        }
      }
    },

    computed: {
      ...mapGetters({
        user: VStore.$getters.getUser,
        username: VStore.$getters.getUsername,
      }),

      color () {
        return !!this.selectedColor.value ? this.selectedColor.value : this.selectedColor;
      },
    },

  }
</script>
