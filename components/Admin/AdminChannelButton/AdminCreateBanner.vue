<template>
    <div>
      <v-btn
        class="d-flex mb-3"
        color="primary black--text"
        block
        small
        @click.prevent="showSystemAlertDialog = true"
      >
        Create Banner
      </v-btn>

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
            color="primary"
            class="pa-2 d-flex justify-space-between align-center"
          >
            <h4 class="black--text body-1">
              <v-icon color="black">announcement</v-icon>
              Create Banner
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
                color="primary black--text"
                @click="createSystemAlert"
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
    name: 'AdminCreateBanner',

    data() {
      return {
        showSystemAlertDialog: false,
        systemAlertMessage: '',
      };
    },

    methods: {
      async createSystemAlert () {
        const payload = {
          message: this.systemAlertMessage,
        };

        try {
          const { data } = await this.$axios.post(
            'https://api.bitwave.tv/v1/admin/alert',
            payload,
          );
          this.$toast.success( data, { icon: 'done', duration: 5000, position: 'top-center' } );
          this.$emit( 'close' );
          this.showSystemAlertDialog = false;
        } catch ( error ) {
          this.$toast.error( error.message, { icon: 'error', duration: 5000, position: 'top-center' } );
        }
      },
    },
  };
</script>
