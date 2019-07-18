<template>
  <v-flex shrink>

    <v-menu
      v-if="isAuth"
      v-model="profileMenu"
      :close-on-content-click="true"
      :nudge-width="200"
      offset-y
      left
      origin="top right"
      transition="slide-y-transition"
    >
      <template #activator="{ on }">
        <v-btn
          v-on="on"
          color="transparent"
          light
          round
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
        <v-list class="py-1" color="yellow">
          <v-list-tile avatar>

            <v-list-tile-avatar>
              <img :src="avatar" :alt="username">
            </v-list-tile-avatar>

            <v-list-tile-content>
              <v-list-tile-title>{{ username }}</v-list-tile-title>
              <v-list-tile-sub-title>basic user</v-list-tile-sub-title>
            </v-list-tile-content>

          </v-list-tile>
        </v-list>

        <v-divider/>

        <v-sheet
          color="#222"
        >
          <v-list dense :style="{ background: 'transparent' }">
            <v-list-tile to="/">
              <v-list-tile-action>
                <v-icon>home</v-icon>
              </v-list-tile-action>
              <v-list-tile-content>
                <v-list-tile-title>Home</v-list-tile-title>
              </v-list-tile-content>
            </v-list-tile>
            <v-list-tile to="/profile">
              <v-list-tile-action>
                <v-icon>account_box</v-icon>
              </v-list-tile-action>
              <v-list-tile-content>
                <v-list-tile-title>Profile</v-list-tile-title>
              </v-list-tile-content>
            </v-list-tile>
            <v-list-tile :to="`/chat/${username}`">
              <v-list-tile-action>
                <v-icon>forum</v-icon>
              </v-list-tile-action>
              <v-list-tile-content>
                <v-list-tile-title>Live Chat</v-list-tile-title>
              </v-list-tile-content>
            </v-list-tile>
            <v-list-tile to="/report">
              <v-list-tile-action>
                <v-icon>flag</v-icon>
              </v-list-tile-action>
              <v-list-tile-content>
                <v-list-tile-title>Report</v-list-tile-title>
              </v-list-tile-content>
            </v-list-tile>
            <v-list-tile @click="logout">
              <v-list-tile-action>
                <v-icon>exit_to_app</v-icon>
              </v-list-tile-action>
              <v-list-tile-content>
                <v-list-tile-title>Sign Out</v-list-tile-title>
              </v-list-tile-content>
            </v-list-tile>
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


  import { mapGetters } from 'vuex'

  export default {

    name: 'User',

    components: {
      LoginDialog,
    },

    data() {
      return {
        unsubscribeUser: null,
        loading: true,
        profileMenu: false,
      }
    },

    methods: {
      async authenticated(user) {
        if (user) { /* user logged in */ }
        this.loading = false;
      },

      async logout () {
        await this.$store.dispatch('logout');
      },
    },

    computed: {
      ...mapGetters({
        isAuth: 'isAuth',
        username: 'username',
        user: 'user'
      }),

      avatar () {
        if (this.user) return this.user.avatar;
      }
    },

    created() {
      auth.onAuthStateChanged( async user => await this.authenticated(user) );
    },

    beforeDestroy() {
      if (this.unsubscribeUser) this.unsubscribeUser();
    },
  };
</script>

<style lang='scss'>
  /*.profile-link {
      min-width: 100px;
    }*/
</style>
