<template>
  <v-card width="225">
    <v-sheet tile color="primary" class="px-2 py-1">
      <div class="d-flex align-center">

        <!-- Avatar with webp support -->
        <picture
          v-if="avatar"
          class="v-avatar ml-0 mr-4"
          style="height: 40px; min-width: 40px; width: 40px; background: #212121;"
          :title="username"
        >
          <source
            v-if="avatars"
            :srcset="`${avatars.webp}`"
            type="image/webp"
          >
          <img
            :src="`${avatar}`"
            :alt="username"
          >
        </picture>

        <!-- Fallback when we don't have a user avatar -->
        <v-avatar
          v-else
          class="mr-4"
          size="40"
          color="grey darken-4"
        >
          <!-- Troll Hazzy -->
          <img
            src="https://cdn.bitwave.tv/static/img/troll_hazzie.png?_bw"
            alt="hazmat suit trolll"
            crossorigin
          >
          <!--<v-icon v-else>person</v-icon>-->
        </v-avatar>

        <div>
          <div class="title black--text">{{ username }}</div>
          <div class="body-2 black--text">{{ userRank }} {{ userType }}</div>
        </div>
      </div>
    </v-sheet>

    <v-divider/>

    <v-sheet
      color="grey darken-4"
    >
      <v-list
        dense
        :style="{ background: 'transparent' }"
      >
        <!-- Profile -->
        <v-list-item to="/profile">
          <v-list-item-action>
            <v-icon>account_box</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>Profile</v-list-item-title>
          </v-list-item-content>
        </v-list-item>

        <!-- My Channel -->
        <v-list-item
          v-if="userType === 'Streamer'"
          :to="`/${username}`"
        >
          <v-list-item-action>
            <v-icon>live_tv</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>My Channel</v-list-item-title>
          </v-list-item-content>
        </v-list-item>

        <!-- Dashboard -->
        <v-list-item
          v-if="userType === 'Streamer'"
          :to="`/dashboard`"
        >
          <v-list-item-action>
            <v-icon>view_quilt</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>Dashboard</v-list-item-title>
          </v-list-item-content>
        </v-list-item>

        <!-- Live Chat -->
        <v-list-item :to="`/chat/${username}`">
          <v-list-item-action>
            <v-icon>forum</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>Live Chat</v-list-item-title>
          </v-list-item-content>
        </v-list-item>

        <!-- OBS Overlays -->
        <v-list-item
          v-if="userType === 'Streamer'"
          to="/overlay/chat"
        >
          <v-list-item-action>
            <v-icon>add_to_queue</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>OBS Overlay</v-list-item-title>
          </v-list-item-content>
        </v-list-item>

        <!-- Report -->
        <v-list-item to="/report">
          <v-list-item-action>
            <v-icon>flag</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>Report</v-list-item-title>
          </v-list-item-content>
        </v-list-item>

        <!-- Admin -->
        <v-list-item
          v-if="userRole === 'admin'"
          to="/admin"
        >
          <v-list-item-action>
            <v-icon>verified_user</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>Admin Panel</v-list-item-title>
          </v-list-item-content>
        </v-list-item>

        <!-- Buy Color -->
        <braintree-drop-in class="my-1" />

        <!-- Sign OUt -->
        <v-list-item @click="logout">
          <v-list-item-action>
            <v-icon>exit_to_app</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>Sign Out</v-list-item-title>
          </v-list-item-content>
        </v-list-item>

      </v-list>
    </v-sheet>
  </v-card>
</template>

<script>
  import BraintreeDropIn from '~/components/Payment/braintree-drop-in';

  import { mapGetters, mapActions } from 'vuex';
  import { VStore } from '@/store';

  export default {
    name: 'UserMenuContent',

    components: {
      BraintreeDropIn,
    },

    data() {
      return {};
    },

    methods: {
      ...mapActions({
        logoutStore: VStore.$actions.logout,
      }),

      async logout () {
        this.$ga.event({
          eventCategory : 'user',
          eventAction   : 'signout',
        });
        await this.logoutStore();
        this.$analytics.logEvent( 'logout', { method: 'bitwave' } );
      },
    },

    computed: {
      ...mapGetters({
        username : VStore.$getters.getUsername,
        user     : VStore.$getters.getUser,
      }),

      avatar () {
        if ( this.user ) return this.user.avatar;
        else return false;
      },

      avatars () {
        if ( this.user ) return this.user.avatars;
        else return false;
      },

      userType () {
        if ( !this.user ) return 'Troll';
        if ( this.user.hasOwnProperty( 'streamkey' ) ) return 'Streamer';
        else return 'Viewer'
      },

      userRank () {
        if ( !this.user ) return 'Troll';
        if ( this.user.hasOwnProperty( 'rank' ) ) return this.user.rank;
        else return 'Basic';
      },

      userRole () {
        if ( !this.user ) return 'Troll';
        if ( this.user.hasOwnProperty( 'role' ) ) return this.user.role;
        return 'user';
      },
    },
  };
</script>
