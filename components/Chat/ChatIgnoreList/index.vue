<template>
  <div class="ignore-list-dialog">

    <!-- Create Dialog -->
    <v-dialog
      :value="value"
      max-width="500"
      attach=".ignore-list-dialog"
      hide-overlay
      @input="close"
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
            Manage Ignore Lists
          </h4>
          <v-btn
            color="black"
            text
            icon
            small
            @click="close( false )"
          >
            <v-icon>close</v-icon>
          </v-btn>
        </v-sheet>

        <!-- Component to display on load -->
        <lazy-chat-ignore-list-content />

      </v-card>
    </v-dialog>

    <!-- Create limited Overlay -->
    <v-overlay
      v-if="value"
      absolute
    />

  </div>
</template>

<script>
  export default {
    name: 'ChatIgnoreList',

    props: {
      value: { type: Boolean, default: false },
    },

    data () {
      return {};
    },

    methods: {
      close ( val ) {
        console.log( val );
        if ( !val )  this.$emit( 'input', false );
      },
    },
  };
</script>

<style lang='scss'>
  .ignore-list-dialog {
    .v-dialog__content {
      position: absolute;
    }
  }
</style>
