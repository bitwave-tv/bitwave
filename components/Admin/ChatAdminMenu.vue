<template>
  <v-card class="mt-2">
    <!-- Title Bar -->
    <v-sheet
      tile
      color="yellow"
      class="d-flex align-center justify-space-between pl-2"
    >
      <h5 class="black--text body-2">Bitwave Admin Alerts</h5>
      <v-btn
        color="black"
        text
        icon
        pa-0
        @click="closeMenu"
      >
        <v-icon color="black">close</v-icon>
      </v-btn>
    </v-sheet>

    <div class="pa-3">

      <v-btn
        class="d-flex mb-3"
        color="yellow"
        light
        @click.prevent="showSystemAlertDialog = true"
      >
        Create System Alert
      </v-btn>

      <v-btn
        class="d-flex"
        color="yellow"
        light
        block
        @click.prevent="showFireworksDialog = true"
      >
        Create Fireworks
      </v-btn>

    </div>

    <!-- Create System Alert Dialog -->
    <v-dialog
      v-model="showSystemAlertDialog"
      width="500"
    >
      <v-card
        color="grey darken-4"
      >
        <!-- Title Bar -->
        <v-sheet
          tile
          color="yellow"
          class="pa-2 d-flex justify-space-between align-center"
        >
          <h4 class="black--text body-1">
            <v-icon color="black">announcement</v-icon>
            Create System Alert
          </h4>
          <v-btn
            color="black"
            text
            icon
            small
            @click="showSystemAlertDialog = false"
          >
            <v-icon>close</v-icon>
          </v-btn>
        </v-sheet>

        <div class="pa-3">
          <v-text-field
            v-model="systemAlertMessage"
            color="blue"
            light
            solo
            clearable
            label="Message"
          />

          <div class="d-flex justify-end">
            <v-btn
              class="mr-3"
              color="red"
              @click="showSystemAlertDialog = false"
            >
              Cancel
            </v-btn>

            <v-btn
              color="yellow"
              light
              @click="createSystemAlert"
            >
              Create
            </v-btn>
          </div>
        </div>

      </v-card>
    </v-dialog>

    <!-- Create Fireworks Dialog -->
    <v-dialog
      v-model="showFireworksDialog"
      width="500"
    >
      <v-card color="grey darken-4">
        <!-- Title Bar -->
        <v-sheet
          tile
          color="yellow"
          class="pa-2 d-flex justify-space-between align-center"
        >
          <h4 class="black--text body-1">
            <v-icon color="black">call_split</v-icon>
            Create Fireworks Show
          </h4>
          <v-btn
            color="black"
            text
            icon
            small
            @click="showFireworksDialog = false"
          >
            <v-icon>close</v-icon>
          </v-btn>
        </v-sheet>

        <div class="pa-3">
          <v-text-field
            v-model="FireworksMessage"
            color="blue"
            light
            solo
            clearable
            label="Message"
          />
          <v-text-field
            v-model="FireworksSubtext"
            color="blue"
            light
            solo
            clearable
            label="Subtext"
          />

          <div class="d-flex justify-end">
            <v-btn
              class="mr-3"
              color="red"
              @click="showSystemAlertDialog = false"
            >
              Cancel
            </v-btn>

            <v-btn
              color="yellow"
              light
              @click="createFireworks"
            >
              Create
            </v-btn>
          </div>
        </div>

      </v-card>
    </v-dialog>

  </v-card>
</template>

<script>
  import { auth } from '@/plugins/firebase';

  export default {
    name: 'ChatAdminMenu',

    data () {
      return {
        showSystemAlertDialog: false,
        systemAlertMessage: '',

        showFireworksDialog: false,
        FireworksMessage: '',
        FireworksSubtext: '',
      };
    },

    methods: {
      closeMenu () {
        this.$emit( 'close' );
      },

      async createSystemAlert () {
        await this.updateToken();
        
        const payload = {
          message: this.systemAlertMessage,
        };

        try {
          const { data } = await this.$axios.post(
            'https://api.bitwave.tv/v1/admin/alert',
            payload,
          );
          this.$toast.success( data, { icon: 'done', duration: 5000, position: 'top-center' } );
          this.showSystemAlertDialog = false;
        } catch ( error ) {
          this.$toast.error( error.message, { icon: 'error', duration: 5000, position: 'top-center' } );
        }
      },

      async createFireworks () {
        await this.updateToken();

        const payload = {
          message: this.FireworksMessage,
          subtext: this.FireworksSubtext,
        };

        try {
          const { data } = await this.$axios.post(
            'https://api.bitwave.tv/v1/admin/fireworks',
            payload,
          );
          this.$toast.success( data, { icon: 'done', duration: 5000, position: 'top-center' } );
          this.showFireworksDialog = false;
        } catch ( error ) {
          this.$toast.error( error.message, { icon: 'error', duration: 5000, position: 'top-center' } );
        }
      },

      async updateToken () {
        const token = await auth.currentUser.getIdToken( true );
        this.$axios.setToken( token, 'Bearer' );
      },
    },

    computed: {

    },
  };
</script>
