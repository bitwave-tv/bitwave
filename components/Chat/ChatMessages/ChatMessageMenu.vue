<template>
  <div>
    <v-card tile raised elevation="24">
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

        <div class="d-flex align-center grey--text mb-3">
          <!-- Avatar -->
          <v-avatar
            size="32"
            class="mr-2"
          >
            <img
              v-if="avatar"
              :src="avatar"
              :alt="username"
              :key="username"
            >
            <img
              v-else
              src="https://cdn.bitwave.tv/static/img/troll_hazzie.png?_bw"
              alt="hazmat suit bitwave troll"
              :style="{ background: color }"
              :key="username"
              crossorigin
            >
          </v-avatar>

          <!-- User Badge -->
          <div
            v-show="badge"
            class="badge mr-1 d-flex align-center"
            v-html="badge"
          ></div>

          <!-- Username -->
          <div
            class="username text-truncate flex-grow-1 subtitle-2 pl-1"
            :style="userStyling"
          >{{ username }}</div>

          <v-btn
            color="primary"
            :disabled="isTroll"
            :to="`/${username}`"
            small
          >Profile</v-btn>
        </div>

        <div class="mb-4">
          <div class="body-2 mb-2">
            This menu is still in development, but the ignore and unignore button both work. Confirmation messages will appear in chat.
          </div>

          <div class="caption mb-2">
            Type <kbd>/ignorelist</kbd> to view a list of all users you currently ignore.<br>
          </div>
        </div>

        <!-- Admin Purge Commands -->
        <div
          v-if="isAdmin"
          class="d-flex align-center mb-2"
        >
          <div class="mb-2">Admin Purging</div>
          <v-spacer />
          <div>
            <v-btn
              v-if="!isIgnored"
              color="error"
              class="mr-2"
              small
              @click="purgeLocal"
            >Local Purge</v-btn>

            <v-btn
              v-if="!isIgnored"
              color="error"
              class="mr-2"
              small
              @click="purgeGlobal"
            >Global Purge</v-btn>
          </div>
        </div>

        <v-divider />

        <!-- Action items -->
        <div class="mt-2">
          <div class="d-flex align-center">
            <v-btn
              color="red darken-2"
              class=""
              text
              small
              to="/report"
            >Report</v-btn>

            <v-spacer />

            <!-- Sorry -->
            <template
              v-if="isChannelOwner"
            >
              <!-- v-if="both || !isBanned" -->
              <!-- :loading="loading" -->
              <!-- :disabled="bannedUsers === null" -->
              <v-btn
                color="error"
                class="mr-2"
                outlined
                small
                @click="banUser"
              >Mute</v-btn>

              <!-- v-if="both || isBanned" -->
              <!-- :loading="loading" -->
              <!-- :disabled="bannedUsers === null" -->
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

            <v-btn
              v-if="!isIgnored"
              color="error"
              class="mr-2"
              small
              @click="ignoreUser"
            >Ignore</v-btn>
            <v-btn
              v-if="isIgnored"
              color="success"
              class="mr-2"
              small
              @click="unIgnoreUser"
            >Unignore</v-btn>
          </div>
        </div>
      </div>
    </v-card>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex';
  import { Chat } from '@/store/chat';
  import { auth } from '@/plugins/firebase';
import { VStore } from '@/store';

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
      return {
        bannedUsers: null,
        loading: false,
      };
    },

    methods: {
      close () {
        this.$emit( 'close' );
      },

      ignoreUser () {
        this.$emit( 'ignore', ( this.username || this.displayName ).toLowerCase() );
      },

      unIgnoreUser () {
        this.$emit( 'unignore', ( this.username || this.displayName ).toLowerCase() );
      },

      async getBans () {
        this.loading = true;

        const endpoint = `https://api.bitwave.tv/v1/chat/bans`;

        try {
          const { data } = await this.$axios.get( endpoint );
          console.log( `Banned users:`, data );

          this.bannedUsers = data.users;
        } catch ( error ) {
          console.error( error )
          this.bannedUsers = null;
        }
        this.loading = false;
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
          if ( data.success ) {
            this.$toast.success( data.message, { icon: 'done', duration: 5000, position: 'top-center' } );
            this.close();
          } else {
            this.$toast.error( data.message, { icon: 'done', duration: 5000, position: 'top-center' } );
          }
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

      async purgeLocal () {
        // Run command
        const endpoint = `https://api.bitwave.tv/v1/admin/chat/local-purge`;
        const payload =  {
          username: this.username,
          channel: this.channel,
        }
        try {
          const { data } = await this.$axios.post(
            endpoint,
            payload,
          );
          if ( data.success ) {
            this.$toast.success( data.message, { icon: 'done', duration: 5000, position: 'top-center' } );
            this.close();
          } else {
            this.$toast.error( data.message, { icon: 'done', duration: 5000, position: 'top-center' } );
          }
        } catch ( error ) {
          console.error( error );
          this.$toast.error( error.message, { icon: 'done', duration: 5000, position: 'top-center' } );
        }
      },

      async purgeGlobal () {
        const endpoint = `https://api.bitwave.tv/v1/admin/chat/local-purge`;
        const payload =  {
          username: this.username,
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
      ...mapState ( Chat.namespace, {
        ignoreList: Chat.$states.ignoreList,
      }),

      ...mapGetters({
        isAdmin  : VStore.$getters.isAdmin,
      }),

      isTroll () {
        return this.username && this.username.startsWith( 'troll:' );
      },

      isIgnored () {
        return this.ignoreList.includes( this.$utils.normalize( this.username ) );
      },

      isBanned () {
        return this.bannedUsers?.includes( this.$utils.normalize( this.username ) );
      },

      both () {
        return this.bannedUsers === null;
      },
    },

    async mounted() {
      // await this.getBans();
    },
  };
</script>
