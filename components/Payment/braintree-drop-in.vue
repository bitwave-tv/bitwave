<template>
  <div class="align-end">
    <v-dialog
      v-model="show"
      width="500"
    >
      <template v-slot:activator="{ on }">
        <v-btn
          color="yellow"
          light
          small
          v-on="on"
        >
          <v-icon class="mr-2">store</v-icon>
          Buy Color
        </v-btn>
      </template>

      <v-card light>
        <v-card-title
          class="title yellow black--text"
          primary-title
        >
          $5 - Purchase chat color
        </v-card-title>

        <v-card-text>
          <v-braintree
            :token="token"
            :paypal="false"
            :url="url"
            :btn-class="'v-btn theme--light yellow'"
          ></v-braintree>
        </v-card-text>

        <!--<v-divider></v-divider>-->

        <!--<v-card-actions>
          <v-btn
            small
            href="#"
            flat color="#2196f3"
            @click="resetPassword(user.email)"
          >Forgot Password?</v-btn>
          <v-spacer></v-spacer>
          <v-btn
            color="yellow"
            flat
            @click="show = false"
          >
            CANCEL
          </v-btn>
        </v-card-actions>-->
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
  import VBraintree from '~/components/payment/v-braintree'

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

<style lang='scss'>

</style>
