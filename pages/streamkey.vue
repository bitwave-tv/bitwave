<template>
  <v-container>
    <v-card class="mb-3">
      <v-card-title>
        Stream Settings
      </v-card-title>
      <v-card-text>
        <div>
          To stream on bitwave.tv you first need a streaming software.
          For PC you can use OBS or StreamLabs.
        </div>
      </v-card-text>
    </v-card>

    <v-card v-if="userType === 'Streamer'">
      <v-card-title>
        Stream Server & Key
      </v-card-title>
      <v-card-text>
        <v-btn
          color="yellow"
          to="/profile"
          light
        >
          View on Profile
        </v-btn>
      </v-card-text>
    </v-card>

    <v-card v-else>
      <v-card-title>
        Request Streamkey
      </v-card-title>
      <v-card-text>
        <v-alert
          v-model="alert.show"
          :type="alert.type"
        >
          {{ alert.message }}
        </v-alert>

        <v-alert
          v-model="requestError.show"
          :type="requestError.type"
        >
          {{ requestError.message }}
        </v-alert>

        <v-btn
          color="yellow"
          :disabled="alert.type === 'error'"
          :light="!alert.type === 'error'"
          @click="requestKey"
        >
          Request Key
        </v-btn>

        <v-btn
        color="yellow"
        to="/profile"
        light
      >
        View Profile
      </v-btn>
      </v-card-text>
    </v-card>

  </v-container>
</template>

<script>
  import { mapGetters } from 'vuex';

  export default {
    name: 'streamkey',

    data() {
      return {
        loading: false,
        requestError: {
          show: false,
          type: 'error',
          message: '',
        },
      };
    },

    methods: {
      async requestKey () {
        const endpoint = 'https://api.bitwave.tv/api/stream/create';
        const cover = 'https://cdn.bitwave.tv/static/img/bitwave_cover_sm.jpg';
        const username = this.user.username.toLowerCase();


        this.$ga.event({
          eventCategory : 'profile',
          eventAction   : 'request stream key',
          eventLabel    : username,
        });

        try {
          const res = await this.$axios.post( endpoint, { username, cover } );
          const type = res.status === 200 ? 'success' : 'error';
          this.requestError = {
            show: true,
            type: type,
            message: res.data,
          };
        } catch ( error ) {
          const type = error.response.status === 200 ? 'success' : 'error';
          this.requestError = {
            show: true,
            type: type,
            message: error.response.data,
          };
        }
      },
    },

    computed: {
      ...mapGetters({
        isAuth : 'isAuth',
        user   : 'user',
      }),

      userType () {
        if ( !this.isAuth )
          return 'Troll';

        if ( this.user.hasOwnProperty( 'streamkey' ) )
          return 'Streamer';

        else
          return 'Viewer'
      },

      alert () {
        // Check if logged in
        // Check if user has avatar
        // Else user qualifies
        const valid = this.user && this.user.hasOwnProperty( 'avatar' );

        if ( this.isAuth && valid ) {
          return {
            type: 'success',
            message: 'You meet all requirements to request a streamkey.',
            show: true,
          }
        } else if ( !this.isAuth ) {
          return {
            type: 'error',
            message: 'You must be logged in to request a streamkey.',
            show: true,
          }
        } else if ( !valid ) {
          return {
            type: 'error',
            message: 'You must set an avatar to request a streamkey.',
            show: true,
          }
        } else {
          return {
            type: 'error',
            message: 'Unknown Error: unable to verifyaccount requirements.',
            show: true,
          }
        }
      },
    },
  };
</script>
