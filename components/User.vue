<template>
  <div>
    <v-menu
      v-if="isAuth"
      v-model="profileMenu"
      :close-on-content-click="true"
      bottom
      offset-y
      left
      transition="slide-y-transition"
    >
      <template #activator="{ on }">
        <v-btn
          v-on="on"
          color="transparent"
          class="black--text"
          rounded
          fab
          small
          :loading="loading"
        >
          <v-avatar size="32" color="grey">
            <img v-if="avatar" :src="avatar" :alt="username">
            <v-icon v-else color="white">person</v-icon>
          </v-avatar>
        </v-btn>
      </template>

      <v-card width="225">
        <v-sheet color="yellow" class="pa-2">
          <div class="d-flex align-center">
            <v-avatar class="mr-4" size="40"  color="grey">
              <img v-if="avatar" :src="avatar" :alt="username">
              <v-icon v-else>person</v-icon>
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
            <v-list-item to="/profile">
              <v-list-item-action>
                <v-icon>account_box</v-icon>
              </v-list-item-action>
              <v-list-item-content>
                <v-list-item-title>Profile</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
            <v-list-item
              v-if="userType === 'Streamer'"
              :to="`/${username}`"
            >
              <v-list-item-action>
                <v-icon>live_tv</v-icon>
              </v-list-item-action>
              <v-list-item-content>
                <v-list-item-title>Channel</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
            <v-list-item :to="`/chat/${username}`">
              <v-list-item-action>
                <v-icon>forum</v-icon>
              </v-list-item-action>
              <v-list-item-content>
                <v-list-item-title>Live Chat</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
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
            <v-list-item to="/report">
              <v-list-item-action>
                <v-icon>flag</v-icon>
              </v-list-item-action>
              <v-list-item-content>
                <v-list-item-title>Report</v-list-item-title>
              </v-list-item-content>
            </v-list-item>

            <braintree-drop-in class="my-1" />

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
    </v-menu>

    <login-dialog v-else />

  </div>
</template>

<script>
  import { auth } from '@/plugins/firebase.js';
  import LoginDialog from '~/components/LoginDialog';
  const BraintreeDropIn = () => import ( '~/components/Payment/braintree-drop-in' );

  import { mapGetters, mapActions } from 'vuex';
  import { VStore } from '@/store';

  export default {

    name: 'User',

    components: {
      LoginDialog,
      BraintreeDropIn,
    },

    data () {
      return {
        unsubscribeUser: null,
        profileMenu: false,
        loading: false,
      }
    },

    methods: {
      ...mapActions({
        logoutStore: VStore.$actions.logout,
      }),

      async authenticated( user ) {
        if ( user ) { /* user logged in */ }
        this.loading = false;
      },

      async logout () {
        this.$ga.event({
          eventCategory : 'user',
          eventAction   : 'signout',
        });
        await this.logoutStore();
      },
    },

    computed: {
      ...mapGetters({
        isAuth   : VStore.$getters.isAuth,
        username : VStore.$getters.getUsername,
        user     : VStore.$getters.getUser,
      }),

      avatar () {
        if ( this.user ) return this.user.avatar;
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
    },

    mounted() {
      if ( !this.isAuth ) this.loading = true;
      this.unsubAuthChanged = auth.onAuthStateChanged ( async user => await this.authenticated( user ) );
    },

    beforeDestroy() {
      if ( this.unsubAuthChanged ) this.unsubAuthChanged();
      if ( this.unsubscribeUser ) this.unsubscribeUser();
    },
  };
</script>
