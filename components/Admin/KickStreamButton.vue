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
            @click="testKickStreamer"
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
            @click="kickStreamer"
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

  const endpoint = 'https://api.bitwave.tv/v1/admin/stream/kick/';

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
        const token = await auth.currentUser.getIdToken(true);
        console.log( `Fresh ID token: ${token}` );
        return token;
      },

      async testKickStreamer () {
        try {
          const token = await this.getFreshIdToken();
          const result = await this.$axios( `${this.kickEndpoint }?reset=false&token=${token}` );
          this.$toast.success( result.data, { duration: 2000 } );
        } catch ( error ) {
          console.error( error );
          this.$toast.error( error.message, { duration: 2000 } );
        }
        this.dialog = false;
      },

      async kickStreamer () {
        try {
          const token = await this.getFreshIdToken();
          const result = await this.$axios( `${this.kickEndpoint }?reset=true&token=${token}` );
          this.$toast.success( result.data, { duration: 2000 } );
        } catch ( error ) {
          console.error( error );
          this.$toast.error( error.message, { duration: 2000 } );
        }
        this.dialog = false;
      },
    },

    computed: {
      kickEndpoint () {
        return `${endpoint}${this.streamer}`;
      }
    },
  };
</script>
