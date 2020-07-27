<template>
    <div>
      <v-card class="mt-2">
        <!-- Title Bar -->
        <v-sheet
          tile
          color="red"
          class="d-flex align-center justify-space-between pl-2"
        >
          <h5 class="body-2">Admin Tools</h5>
          <v-btn
            color="black"
            text
            icon
            pa-0
            @click="closeMenu"
          >
            <v-icon color="white">close</v-icon>
          </v-btn>
        </v-sheet>

        <!-- Admin Options -->
        <div class="px-3 pb-4">

          <!-- Channel Specific Admin Tools -->
          <v-subheader class="overline mb-0 px-0">
            Channel Admin Tools
          </v-subheader>

          <!-- Stream Admin Control -->
          <admin-stream-control
            :streamer="streamer"
          />

          <!-- Platform Admin Tools -->
          <v-subheader class="overline mb-0 px-0">
            Platform Admin Tools
          </v-subheader>

          <!-- Create Alert -->
          <admin-create-banner />

          <!-- Create Fireworks -->
          <admin-create-fireworks />

        </div>
      </v-card>
    </div>
</template>

<script>
  import AdminCreateFireworks from '@/components/Admin/AdminChannelButton/AdminCreateFireworks';
  import AdminCreateBanner from '@/components/Admin/AdminChannelButton/AdminCreateBanner';
  import AdminStreamControl from '@/components/Admin/AdminChannelButton/AdminStreamControl';
  export default {
    name: 'AdminChannelMenu',

    components: {
      AdminStreamControl,
      AdminCreateBanner,
      AdminCreateFireworks,
    },

    props: {
      streamer: { type: String },
    },

    data() {
      return {};
    },

    methods: {
      closeMenu () {
        this.$emit( 'close' );
      },
    },
  };
</script>
