<template>
  <v-flex shrink>

    <v-menu
      v-if="isAuth"
      v-model="profileMenu"
      :close-on-content-click="true"
      :nudge-width="200"
      bottom
      offset-y
      left
      origin="top right"
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
          <v-avatar size="32">
            <img :src="avatar" :alt="username">
          </v-avatar>
        </v-btn>
      </template>

      <v-card>
        <v-sheet color="yellow" class="pa-2">
          <div class="d-flex align-center">
            <v-avatar class="mr-4" size="40">
              <img :src="avatar" :alt="username">
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

  </v-flex>
</template>

<script>
  import { auth } from '@/plugins/firebase.js';
  import LoginDialog from '~/components/LoginDialog';
  const BraintreeDropIn = () => import ( '~/components/Payment/braintree-drop-in' );


  import { mapGetters } from 'vuex';

  export default {

    name: 'User',

    components: {
      LoginDialog,
      BraintreeDropIn,
    },

    data() {
      return {
        unsubscribeUser: null,
        profileMenu: false,
        loading: false,
      }
    },

    methods: {
      async authenticated( user ) {
        if ( user ) { /* user logged in */ }
        this.loading = false;
      },

      async logout () {
        this.$ga.event({
          eventCategory : 'user',
          eventAction   : 'signout',
        });
        await this.$store.dispatch( 'logout' );
      },
    },

    computed: {
      ...mapGetters({
        isAuth   : 'isAuth',
        username : 'username',
        user     : 'user',
      }),

      avatar () {
        if ( this.user ) return this.user.avatar;
      },

      userType () {
        if ( !this.user )
          return 'Troll';

        if ( this.user.hasOwnProperty( 'streamkey' ) )
          return 'Streamer';

        else
          return 'Viewer'
      },

      userRank () {
        if ( !this.user )
          return 'Troll';

        if ( this.user.hasOwnProperty( 'rank' ) )
          return this.user.rank;

        else
          return 'Basic';
      },
    },

    created() {
      if ( !this.isAuth ) this.loading = true;
      auth.onAuthStateChanged ( async user => await this.authenticated( user ) );
    },

    beforeDestroy() {
      if ( this.unsubscribeUser ) this.unsubscribeUser();
    },
  };
</script>
