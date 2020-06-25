<template>
  <div>
    <transition-group name="fade-transition">
      <v-card
        v-if="overlays.length === 0"
        key="no-data"
        color="teal darken-3"
        class="my-3"
      >
        <v-card-title>
          <v-icon class="mr-2">event_busy</v-icon>
          No custom overlays
        </v-card-title>
        <v-card-subtitle>
          Click 'create' to make a new OBS chat overlay.
        </v-card-subtitle>
      </v-card>

      <v-card
        v-else
        v-for="overlay in overlays"
        :key="overlay.id"
        class="my-3"
      >
        <v-card-title>
          {{ overlay.title }}
          <v-btn
            class="ml-1"
            color="primary"
            text
            small
            @click="copyLink( overlay.id )"
          >
            copy link
          </v-btn>
        </v-card-title>
        <v-card-subtitle>
          <div>
            {{ `https://bitwave.tv/overlay/chat/${overlay.id}` }}
          </div>
        </v-card-subtitle>

        <v-card-text class="py-0 d-flex align-center justify-space-between flex-wrap">
          <!-- Property Chips -->
          <div>
            <v-chip
              class="mr-1 my-1"
              color="primary"
              outlined
              small
            >
              <v-icon left small>person</v-icon>
              {{ overlay.channel }}
            </v-chip>
            <v-chip
              class="mx-1 my-1"
              color="blue"
              outlined
              small
            >
              <v-avatar left>{{ overlay.history }}</v-avatar>
              Messages
            </v-chip>
            <v-chip
              class="mx-1 my-1"
              :color="overlay.global ? 'cyan' : 'teal'"
              outlined
              small
            >
              {{ overlay.global ? 'Global' : 'Local' }}
            </v-chip>
          </div>

          <!-- Dates -->
          <div class="d-flex">
            <div>
              Edited: {{ formatDate( overlay.edited.toDate() ) }}
            </div>
            <v-divider
              vertical
              class="mx-2"
            />
            <div>
              Created: {{ formatDate( overlay.created.toDate() ) }}
            </div>
          </div>
        </v-card-text>

        <!-- Overlay actions -->
        <v-card-actions>
          <v-btn
            color="primary"
            text
            :href="`/overlay/chat/${overlay.id}`"
            target="_blank"
          >
            View
          </v-btn>

          <!-- Open edit dialog -->
          <v-btn
            color="primary"
            text
            @click="editOverlay( overlay.id )"
          >
            Edit
          </v-btn>

          <v-spacer/>
          <v-btn
            color="error"
            text
            @click="deleteOverlay(overlay)"
          >
            Delete
          </v-btn>
        </v-card-actions>
      </v-card>
    </transition-group>

    <!-- Open edit dialog -->
    <v-dialog
      v-model="showEditDialog"
      width="500"
      persistent
    >
      <chat-overlay-dialog
        v-model="showEditDialog"
        :data="overlayData"
      />
    </v-dialog>

    <!-- Snackbar Notifications -->
    <v-snackbar
      v-model="showAlert"
      :color="alertType"
      :timeout="5000"
      bottom
      right
      @click="showAlert = false"
    >
      <v-icon>{{ alertIcon }}</v-icon>
      {{ alertMessage }}
    </v-snackbar>
  </div>
</template>

<script>
  import { db } from '@/plugins/firebase.js';
  import moment from 'moment';

  const ChatOverlayDialog = () => import ( '@/components/Overlay/ChatOverlayDialog' );

  export default {
    name: 'ChatOverlayInfoCard',

    components: {
      ChatOverlayDialog,
    },

    props: {
      overlays: { type: Array },
    },

    data() {
      return {
        showEditDialog: false,
        overlayData: {},
        showAlert: false,
        alertType: '',
        alertIcon: '',
        alertMessage: '',
      };
    },

    methods: {
      editOverlay ( overlayId ) {
        this.overlayData = this.overlays.find( overlay => overlay.id === overlayId );
        this.showEditDialog = true;
      },

      async deleteOverlay ( overlay ) {
        const overlayRef = db
          .collection( 'overlays' )
          .doc( overlay.id );
        await overlayRef.delete();
      },

      formatDate ( date ) {
        return moment( date ).format( 'MM-DD hh:mm A' );
      },

      copyLink ( id ) {
        this.copyToClipboard( `https://bitwave.tv/overlay/chat/${id}` );
      },

      copyToClipboard ( text ) {
        this.$copyText( text ).then( () => {
          this.alertMessage = 'Copied to clipboard';
          this.$toast.success( 'Copied to clipboard', { icon: 'done', duration: 5000 } );
          this.alertType = 'success';
          this.alertIcon = 'check';
          this.showAlert = true;
        }, ( error ) => {
          console.log( error );
          this.alertMessage = 'Failed to copy to clipboard';
          this.$toast.error( 'Failed to copy to clipboard', { icon: 'error', duration: 5000 } );
          this.alertType = 'error';
          this.alertIcon = 'warning';
          this.showAlert = true;
        });
      },
    },

    computed: {},
  };
</script>
