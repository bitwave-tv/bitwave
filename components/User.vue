<template>
  <v-flex ml-3 shrink>

    <v-menu
      v-if="isAuth"
      v-model="profileMenu"
      :close-on-content-click="true"
      :nudge-width="200"
      offset-y
      offset-x
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
          <v-avatar size="40">
            <img :src="avatar" :alt="username">
          </v-avatar>
        </v-btn>
      </template>

      <v-card>
        <v-list
          class="py-1"
          color="yellow"
        >
          <v-list-item>

            <v-list-item-avatar class="my-0">
              <img :src="avatar" :alt="username">
            </v-list-item-avatar>

            <v-list-item-content class="px-0">
              <v-list-item-title class="black--text">{{ username }}</v-list-item-title>
              <v-list-item-subtitle class="black--text">basic user</v-list-item-subtitle>
            </v-list-item-content>

          </v-list-item>
        </v-list>

        <v-divider/>

        <v-sheet
          color="#222"
        >
          <v-list dense :style="{ background: 'transparent' }">
            <v-list-item to="/">
              <v-list-item-action>
                <v-icon>home</v-icon>
              </v-list-item-action>
              <v-list-item-content>
                <v-list-item-title>Home</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
            <v-list-item to="/profile">
              <v-list-item-action>
                <v-icon>account_box</v-icon>
              </v-list-item-action>
              <v-list-item-content>
                <v-list-item-title>Profile</v-list-item-title>
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

            <braintree-drop-in />

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
  import { auth } from '@/plugins/firebase.js'
  import LoginDialog from '~/components/LoginDialog'
  import BraintreeDropIn from '~/components/Payment/braintree-drop-in'


  import { mapGetters } from 'vuex'

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
        loading: true,
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
      }
    },

    created() {
      auth.onAuthStateChanged( async user => await this.authenticated( user ) );
    },

    beforeDestroy() {
      if ( this.unsubscribeUser ) this.unsubscribeUser();
    },
  };
</script>

<style lang='scss'>
  /*.profile-link {
      min-width: 100px;
    }*/
</style>
