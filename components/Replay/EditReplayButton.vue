<template>
    <v-dialog
      v-model="editReplay"
      transition="fade-transition"
      :max-width="$vuetify.breakpoint.mdAndDown ? '95%' : '60%'"
      @click:outside="cancel"
      persistent
    >
      <template #activator="{ on }">
        <v-btn
          v-on="on"
          class="mr-3"
          outlined
          small
          color="primary"
        >
          edit
          <v-icon small class="ml-1">edit</v-icon>
        </v-btn>
      </template>

      <v-card
        color="grey darken-4"
        :loading="saveLoading || showExitConfirm"
      >
        <v-sheet
          tile
          color="primary"
          class="pa-2 d-flex justify-space-between align-center"
        >
          <h4 class="black--text body-1">
            <v-icon color="black">create</v-icon>
            Edit Replay
          </h4>
          <v-btn
            color="black"
            text
            icon
            small
            @click="cancel"
          >
            <v-icon>close</v-icon>
          </v-btn>
        </v-sheet>

        <div class="pa-3">
          <div class="body-1 mb-1">
            Replay Title
          </div>
          <v-text-field
            v-model="replayData.title"
            color="primary"
            outlined
            clearable
            dense
            counter="240"
            :loading="saveLoading"
            :disabled="saveLoading"
            @change="enableSave = true"
          />
        </div>

        <div class="d-flex justify-end mt-3 pa-3">
          <v-btn
            class="mr-2"
            color="cyan"
            outlined
            small
            :disabled="!enableSave"
            @click="resetValues"
          >
            reset
          </v-btn>
          <v-spacer/>
          <v-btn
            class="mr-2"
            color="red"
            small
            :disabled="saveLoading"
            @click="cancel"
          >
            cancel
          </v-btn>
          <v-btn
            color="success"
            small
            :loading="saveLoading"
            @click="updateReplayData"
          >
            save
          </v-btn>
        </div>

      </v-card>

      <!-- Exit Confirmation Dialog -->
      <v-dialog
        v-model="showExitConfirm"
        width="320"
      >
        <v-card>

          <v-sheet
            color="primary"
            class="pa-2 d-flex justify-space-between align-center"
          >
            <h4 class="black--text body-1">
              You have unsaved changes!
            </h4>
            <v-icon light>warning</v-icon>
          </v-sheet>

          <v-card-title class="subtitle-1">
            Are you sure you want to exit?
          </v-card-title>


          <v-card-actions class="justify-end">

            <v-btn
              color="red"
              @click="forceQuit"
              outlined
              small
            >
              exit
            </v-btn>
            <v-btn
              class="mr-2"
              color="primary"
              outlined
              small
              @click="showExitConfirm = false"
            >
              no
            </v-btn>

          </v-card-actions>

        </v-card>
      </v-dialog>

    </v-dialog>
</template>

<script>
  import { db } from '@/plugins/firebase';

  export default {
    name: 'EditReplayButton',

    props: {
      archiveId: { type: String },
    },

    data() {
      return {
        editReplay: false,
        enableSave: false,
        saveLoading: false,
        showExitConfirm: false,
        _sourceReplayData: null,
        replayData: { title: '' },
      };
    },

    methods: {
      async getReplayData () {
        try {
          const doc = await db
            .collection( 'archives' )
            .doc( this.archiveId )
            .get();
          const data = doc.data();
          this._sourceReplayData = data;
          this.replayData = data;
        } catch ( error ) {
          this.$toast.error( error.message, { icon: 'error', duration: 5000 } );
          this.editReplay = false;
        }
      },

      resetValues () {
        this.replayData = this._sourceReplayData;
        this.saveLoading = false;
        this.enableSave = false;
      },

      cancel () {
        if ( this.enableSave ) {
          this.showExitConfirm = true;
          return;
        }
        // Reset Form
        this.resetValues();
        // Close dialog
        this.editReplay = false;
      },

      forceQuit() {
        // Reset exit confirmation
        this.showExitConfirm = false;
        // Reset Form
        this.resetValues();
        // Close dialog
        this.editReplay = false;
      },

      async updateReplayData () {
        // Bail early if no data changed
        if ( !this.enableSave ) {
          this.editReplay = false;
        }

        this.$ga.event({
          eventCategory : 'replay',
          eventAction   : 'update replay',
          eventLabel    : this.replayData.name.toLowerCase(),
        });

        this.saveLoading  = true;

        const streamRef   = db
          .collection( 'archives' )
          .doc( this.archiveId );

        await streamRef.update({
          title: this.replayData.title,
          // description: this.streamData.description,
        });

        this.saveLoading   = false;
        this.enableSave    = false;

        setTimeout( () => {
          this.editReplay = false;
          this.$emit( 'update', this.replayData );
        }, 100 );
      },
    },

    computed: {},

    async mounted () {
      await this.getReplayData();
    },
  };
</script>

<style lang='scss'>

</style>
