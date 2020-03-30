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
              color="primary"
              :loading="loading"
              outlined
              :disabled="overlays.length >= 10"
            >
              create
            </v-btn>
          </template>

          <chat-overlay-dialog
            v-model="showCreateDialog"
            :data="defaultOverlay"
          />
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
    />

  </v-container>
</template>

<script>
  import { auth, db } from '@/plugins/firebase.js';
  import { mapGetters } from 'vuex';

  import ChatOverlayInfoCards from '@/components/Overlay/ChatOverlayInfoCards';
  import { VStore } from '@/store';
  const ChatOverlayDialog = () => import ( '@/components/Overlay/ChatOverlayDialog' );

  export default {
    name: 'chat',

    middleware: 'auth',

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
      async onAuthChanged ( user ) {
        if ( !user ) {
          await this.$router.push( '/login' );
        }
      },

      subscribeToOverlays ( uid ) {
        const overlayRefs = db
          .collection( 'overlays' )
          .where( 'owner', '==', uid )
          .orderBy( 'edited', 'desc' )
          .limit( 10 );
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
        user: VStore.$getters.getUser,
      }),
    },

    created () {
      this.unsubAuthChanged = auth.onAuthStateChanged( user => this.onAuthChanged ( user ) );
    },

    mounted () {
      this.subscribeToOverlays( this.user.uid );
    },

    beforeDestroy () {
      if ( this.unsubAuthChanged ) this.unsubAuthChanged();
      if ( this.unsubscribeOverlays ) this.unsubscribeOverlays();
    },
  };
</script>
