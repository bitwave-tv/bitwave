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
          <div class="overline my-2 px-0">
            Channel Admin Tools
          </div>

          <!-- Stream Admin Control -->
          <admin-stream-control
            :streamer="streamer"
            @close="closeMenu"
          />

          <!-- Platform Admin Tools -->
          <div class="overline my-2 px-0">
            Platform Admin Tools
          </div>

          <!-- Create Alert -->
          <admin-create-banner
            @cclose="closeMenu"
          />

          <!-- Create Fireworks -->
          <admin-create-fireworks
            @cclose="closeMenu"
          />

        </div>
      </v-card>
    </div>
</template>

<script>
  export default {
    name: 'AdminChannelMenu',

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
