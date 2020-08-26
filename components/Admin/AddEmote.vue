<template>
  <v-card
    color="purple darken-4"
  >
    <v-card-title>Add Global Emote</v-card-title>
    <v-card-text>This should be an <i>already</i> properly sized emote. ( 28 / 32 / 52 / 72 ) </v-card-text>

    <div class="mx-2">
      <v-text-field
        v-model="key"
        solo-inverted
        label=":emote:"
      />
      <v-text-field
        v-model="url"
        solo-inverted
        label="Emote URL"
      />
    </div>


    <v-alert
      :value="alertShow"
      :type="alertType"
      border="left"
      dense
      class="mx-2"
    >
      {{ alertMessage }}
    </v-alert>


    <v-card-actions>
      <v-spacer/>
      <v-btn
        color="primary"
        light
        :loading="updating"
        @click="addEmote"
      >
        Add Emote
      </v-btn>
    </v-card-actions>

  </v-card>
</template>

<script>
  export default {
    name: 'AddEmote',

    data() {
      return {
        key: '',
        url: '',
        updating: false,

        alertShow: false,
        alertType: 'error',
        alertMessage: 'Test',
      };
    },

    methods: {
      async addEmote () {
        this.updating = true;

        const endpoint = 'https://api.bitwave.tv/v1/emotes';

        try {
          await this.$axios.post( endpoint, { key: this.key, url: this.url, user: '' } );
          this.key = this.url = '';
          this.showAlert( `success`, `Emote Added` );
        } catch ( error ) {
          console.log( error.message );
          this.showAlert( `error`, error.message );
        }

        this.updating = false;
      },

      showAlert ( type, message, t ) {
        this.alertShow = true;
        this.alertMessage = message || 'no message';
        this.alertType = type || 'error';
        if ( t ) setTimeout( () => this.hideAlert(), t );
      },

      hideAlert () {
        this.alertShow = false;
        this.alertMessage = '';
        this.alertType = 'error';
      },
    },

    computed: {},

    mounted() {

    },
  };
</script>

<style lang='scss'>

</style>
