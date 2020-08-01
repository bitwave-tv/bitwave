<template>
    <div>
      <v-btn
        class="d-flex"
        color="primary black--text"
        block
        small
        @click.prevent="showFireworksDialog = true"
      >
        Create Fireworks
      </v-btn>

      <!-- Create Fireworks Dialog -->
      <v-dialog
        v-model="showFireworksDialog"
        width="500"
      >
        <v-card color="grey darken-4">
          <!-- Title Bar -->
          <v-sheet
            tile
            color="primary"
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
                color="primary black--text"
                @click="createFireworks"
              >
                Create
              </v-btn>
            </div>
          </div>

        </v-card>
      </v-dialog>
    </div>
</template>

<script>
  import { auth } from '@/plugins/firebase';

  export default {
    name: 'AdminCreateFireworks',

    data() {
      return {
        showFireworksDialog: false,
        FireworksMessage: '',
        FireworksSubtext: '',
      };
    },

    methods: {
      async updateToken () {
        const token = await auth.currentUser.getIdToken( true );
        this.$axios.setToken( token, 'Bearer' );
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
    },
  };
</script>
