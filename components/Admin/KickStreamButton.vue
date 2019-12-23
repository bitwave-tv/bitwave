<template>
  <div>
    <v-dialog
      v-model="dialog"
      width="300"
    >
      <template v-slot:activator="{ on }">
        <v-btn
          v-on="on"
          color="red"
          class="mr-2"
          small
          dark
        >
          Kick
        </v-btn>
      </template>

      <v-card>
        <v-card-title
          class="title yellow black--text pa-1 mb-3"
          primary-title
        >
          Confirm Kick Streamer
        </v-card-title>

        <v-card-text>
          By default this will also reset the streamer's streamkey to prevent the
          streaming client from auto-reconnecting.
        </v-card-text>

        <v-divider />

        <v-card-actions>
          <v-btn
            color="yellow"
            text
            small
            @click="kickStreamer( false )"
          >
            Test
          </v-btn>
          <v-spacer />
          <v-btn
            color="red"
            small
            @click="dialog = false"
          >
            Cancel
          </v-btn>
          <v-btn
            color="yellow"
            small
            light
            @click="kickStreamer( true )"
          >
            Confirm
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
  import { auth } from '@/plugins/firebase.js';

  const endpoint = 'https://api.bitwave.tv/v1/admin/stream/kick';

  export default {
    name: 'KickStreamButton',

    props: {
      streamer: { type: String },
    },

    data () {
      return {
        dialog: false,
      };
    },

    methods: {
      async getFreshIdToken () {
        const token = await auth.currentUser.getIdToken( true );
        console.log( `Fresh ID token:\n${token}` );
        return token;
      },

      async kickStreamer ( resetKey ) {
        try {
          const token = await this.getFreshIdToken();
          const { data } = await this.$axios.post(
            this.createEndpoint( endpoint, token, !!resetKey ),
            { streamer: this.streamer },
          );
          console.log( data );
          if ( data.success )
            this.success( 'Successfully kicked stream' );
          else
            this.error( 'Failed to kick stream' );
        } catch ( error ) {
          console.error( error );
          this.error( error.message );
        }
        this.dialog = false;
      },

      success ( data ) {
        this.$toast.success( data, { icon: 'done', duration: 5000, position: 'top-center' } );
      },

      error ( error ) {
        this.$toast.error( error, { icon: 'error', duration: 5000, position: 'top-center' } );
      },

      createEndpoint ( base, token, reset ) {
        return `${base}?reset=${!!reset}`;
      },
    },
  };
</script>
