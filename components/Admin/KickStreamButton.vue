<template>
  <div>
    <v-dialog
      v-model="dialog"
      :width="$vuetify.breakpoint.mdAndDown ? '95%' : '400'"
    >
      <template v-slot:activator="{ on }">
        <v-btn
          v-on="on"
          color="red"
          class="mr-2"
          small
        >
          admin
        </v-btn>
      </template>

      <v-card>
        <v-card-title
          class="title yellow black--text pa-1 mb-3"
          primary-title
        >
          <div>
            <v-icon color="black">security</v-icon>
            Admin Controls
          </div>
          <v-spacer />
          <v-btn
            color="black"
            text
            icon
            pa-0
            @click="dialog = false"
          >
            <v-icon color="black">close</v-icon>
          </v-btn>
        </v-card-title>

        <v-card-text>
          <div>
            By default kicking a stream will also reset the streamer's streamkey to prevent the
            streaming client from auto-reconnecting.<br>
            If you do not want to reset a streamer's key, choose <code>Disconnect</code> instead of <code>Kick</code>.
          </div>
          <div>
            For performance reasons, do not start more than <strong>2</strong> transcoder. If transcoded streams begin to buffer or stutter
            try disabling a transcoder.<br>
            Also avoid attempting to transocde multiple high res / high bitrate streams as those require more power.
          </div>
        </v-card-text>

        <v-divider />

        <v-card-actions>
          <span>Transcoder:</span>
          <v-spacer />
          <v-btn
            color="green"
            small
            outlined
            @click="transcodeStreamer( 'start' )"
          >
            Start
          </v-btn>
          <v-btn
            color="red"
            class="ml-2"
            small
            outlined
            @click="transcodeStreamer( 'stop' )"
          >
            Stop
          </v-btn>
        </v-card-actions>

        <v-divider />

        <v-card-actions>
          <span>Livestream:</span>
          <v-spacer />
          <v-btn
            color="yellow"
            small
            outlined
            @click="transcodeStreamer( 'start' )"
          >
            Disconnect
          </v-btn>
          <v-btn
            color="red"
            class="ml-2"
            small
            outlined
            @click="transcodeStreamer( 'stop' )"
          >
            Kick
          </v-btn>
        </v-card-actions>

        <v-divider />

        <v-card-actions>
          <v-spacer />
          <v-btn
            color="blue"
            small
            @click="dialog = false"
          >
            Close
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
  import { auth } from '@/plugins/firebase.js';

  const endpoint = 'https://api.bitwave.tv/v1/admin/stream/kick';
  const transcodeEndpoint = 'https://api.bitwave.tv/v1/streamer/transcoder/';

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
        this.$axios.setToken( token, 'Bearer' );
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

      async transcodeStreamer ( mode ) {
        try {
          await this.getFreshIdToken();
          const { data } = await this.$axios.post(
            transcodeEndpoint + mode,
            { user: this.streamer },
          );
          console.log( data );
          if ( data.success )
            this.success( 'Successfully transcoded stream' );
          else
            this.error( 'Failed to transcode stream' );
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
