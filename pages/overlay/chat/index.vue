<template>
  <v-container>
    <!-- Header -->
    <div class="d-flex align-baseline justify-space-between my-2">
      <div>
        Create & manage OBS chat overlays.
      </div>

      <!-- Actions -->
      <div class="d-flex justify-end">
        <v-dialog
          v-model="showCreateDialog"
          width="500"
          persistent
        >
          <template #activator="{ on }">
            <v-btn
              v-on="on"
              color="yellow"
              outlined
            >
              create
            </v-btn>
          </template>

          <create-overlay-dialog
            v-model="showCreateDialog"
            :data="defaultOverlay"
          ></create-overlay-dialog>
        </v-dialog>
      </div>
    </div>

    <!-- Loading -->
    <div>
      <v-expand-transition>
        <v-card
          v-show="loading"
          :loading="loading"
        >
          <v-card-title>Loading...</v-card-title>
        </v-card>
      </v-expand-transition>
    </div>

    <!-- Overlays -->
    <chat-overlay-info-cards
      v-show="!loading"
      :overlays="overlays"
    ></chat-overlay-info-cards>

  </v-container>
</template>

<script>
  import { db } from '@/plugins/firebase.js';
  import { mapGetters } from 'vuex';

  import ChatOverlayInfoCards from '@/components/Overlay/ChatOverlayInfoCards';
  const ChatOverlayDialog = () => import ( '@/components/Overlay/ChatOverlayDialog' );

  export default {
    name: 'chat',

    components: {
      ChatOverlayInfoCards,
      ChatOverlayDialog,
    },

    data () {
      return {
        loading: true,
        unsubscribeOverlays: null,
        overlays: [],
        showCreateDialog: false,
        defaultOverlay: null,
      };
    },

    methods: {
      subscribeToOverlays ( uid ) {
        const overlayRefs = db.collection( 'overlays' ).where( 'owner', '==', uid ).orderBy( 'edited', 'desc' );
        this.unsubscribeOverlays = overlayRefs.onSnapshot( docs => this.onOverlaysChange( docs ) );
      },

      onOverlaysChange ( docs ) {
        this.loading = false;
        if ( !docs.empty ) {
          this.overlays = docs.docs.map( doc => ({ id: doc.id, ...doc.data() }) );
        } else {
          this.overlays = [];
        }
      },
    },

    computed: {
      ...mapGetters ({
        user: 'user',
      }),
    },

    mounted () {
      this.subscribeToOverlays( this.user.uid );
    },

    beforeDestroy () {
      if ( this.unsubscribeOverlays ) this.unsubscribeOverlays();
    },
  };
</script>
