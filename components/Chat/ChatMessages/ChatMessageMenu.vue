<template>
  <v-dialog
    :value="value"
    transition="slide-x-transition"
    :max-width="$vuetify.breakpoint.mdAndDown ? '95%' : '40%'"
    @input=" val => $emit('input', val )"
  >
    <v-card>
      <!-- Title Bar -->
      <v-sheet
        tile
        color="primary"
        class="d-flex align-center justify-space-between pl-2"
      >
        <h5 class="black--text body-2">Chat User</h5>
        <v-btn
          color="black"
          text
          icon
          pa-0
          @click="close"
        >
          <v-icon color="black">close</v-icon>
        </v-btn>
      </v-sheet>

      <div class="pa-3">

        <div class="d-flex align-center grey--text mb-4">
          <!-- Avatar -->
          <v-avatar size="32">
            <img
              v-if="avatar"
              :src="avatar"
              :alt="username"
              :key="username"
            >
            <img
              v-else
              src="https://cdn.bitwave.tv/static/img/troll_hazzie.png?_bw"
              alt="hazmat suit trolll"
              :style="{ background: color }"
              :key="username"
              crossorigin
            >
          </v-avatar>

          <!-- User Badge -->
          <div
            v-show="badge"
            class="badge pl-1 d-flex align-center"
            v-html="badge"
          ></div>

          <!-- Username -->
          <div
            class="username text-truncate flex-grow-1 subtitle-2 pl-1"
            :style="userStyling"
          >{{ username }}</div>

          <v-spacer></v-spacer>


          <!-- Action Buttons for user -->
          <!--<v-btn
            color="primary"
            class="mr-2"
            disabled
            small
          >Whisper</v-btn>-->

          <v-btn
            color="primary"
            :disabled="isTroll"
            :to="`/${username}`"
            small
          >Profile</v-btn>
        </div>

        <div class="body-2 mb-2">
          This menu is still in development, but the ignore and unignore button both work. Confirmation messages will appear in chat.
        </div>

        <div class="caption mb-2">
          Type <kbd>/ignorelist</kbd> to view a list of all users you currently ignore.<br>
          If you are still seeing messages in chat, ensure you have enabled "ignore messages" in chat settings.<br>
          Ignoring users without this setting enabled will block TTS from reading their messages.
        </div>

        <hr color="grey" />

        <!-- Action items -->
        <div class="mt-3">
          <div class="d-flex align-center">

            <!-- Report User Option -->
            <v-btn
              color="red darken-2"
              class=""
              text
              to="/report"
            >Report</v-btn>

            <v-spacer />

            <!-- Channel Owner Mute Settings -->
            <template
              v-if="isChannelOwner"
            >
              <v-btn
                color="error"
                class="mr-2"
                outlined
                small
                @click="banUser"
              >Mute</v-btn>
              <v-btn
                color="success"
                class="mr-2"
                outlined
                small
                @click="unbanUser"
              >Un-Mute</v-btn>

              <v-divider
                vertical
                class="mr-2"
              />
            </template>

            <!-- General Use Ignore Settings -->
            <v-btn
              color="error"
              class="mr-2"
              small
              @click="ignoreUser"
            >Ignore</v-btn>
            <v-btn
              color="success"
              class="mr-2"
              small
              @click="unIgnoreUser"
            >Unignore</v-btn>
          </div>
        </div>
      </div>
    </v-card>
  </v-dialog>
</template>

<script>
  export default {
    name: 'ChatMessageMenu',

    props: {
      value: { Boolean },
      avatar: {},
      badge: { type: String },
      color: {},
      message: { type: String, },
      username: { type: String, },
      displayName: { type: String, },
      userStyling: {},
      routePrefix: { type: String },
      channel: { type: String, },
      timestamp: {},
      global: {},
      attach: {},
      isChannelOwner: {
        type: Boolean,
        default: false,
      },
    },

    data() {
      return {};
    },

    methods: {
      close () {
        this.$emit( 'input', false );
      },

      ignoreUser () {
        this.$emit( 'ignore', ( this.username || this.displayName ).toLowerCase() );
      },

      unIgnoreUser () {
        this.$emit( 'unignore', ( this.username || this.displayName ).toLowerCase() );
      },

      async banUser () {
        const endpoint = `https://api.bitwave.tv/v1/chat/ban`;
        const payload =  {
          user: this.username,
          ban: this.username,
        }
        try {
          const { data } = await this.$axios.post(
            endpoint,
            payload,
          );
          if ( data.success )
            this.$toast.success( data.message, { icon: 'done', duration: 5000, position: 'top-center' } );
          else
            this.$toast.error( data.message, { icon: 'done', duration: 5000, position: 'top-center' } );
        } catch ( error ) {
          console.error( error );
          this.$toast.error( error.message, { icon: 'done', duration: 5000, position: 'top-center' } );
        }
      },

      async unbanUser () {
        const endpoint = `https://api.bitwave.tv/v1/chat/unban`;
        const payload =  {
          user: this.username,
          ban: this.username,
        }
        try {
          const { data } = await this.$axios.post(
            endpoint,
            payload,
          );
          if ( data.success )
            this.$toast.success( data.message, { icon: 'done', duration: 5000, position: 'top-center' } );
          else
            this.$toast.error( data.message, { icon: 'done', duration: 5000, position: 'top-center' } );
        } catch ( error ) {
          console.error( error );
          this.$toast.error( error.message, { icon: 'done', duration: 5000, position: 'top-center' } );
        }
      },
    },

    computed: {
      isTroll () {
        return this.username && this.username.startsWith( 'troll:' );
      },
    },

    mounted() {

    },
  };
</script>

<style lang='scss'>

</style>
