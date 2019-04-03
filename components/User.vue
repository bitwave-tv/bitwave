<template>
  <v-flex shrink>
    <v-btn
      v-if="isAuth"
      to="/profile"
      color="yellow"
      light
      small
      :loading="loading"
    >
      {{ username }}
      <v-icon class="ml-1">person</v-icon>
    </v-btn>
    <v-btn
      v-else
      to="/login"
      color="yellow"
      light
      small
      :loading="loading"
    >
      Log In
      <v-icon class="ml-1">input</v-icon>
    </v-btn>
  </v-flex>
</template>

<script>
  import { auth, db } from '@/plugins/firebase.js'

  export default {

    name: 'User',

    data() {
      return {
        unsubscribeUser: null,
        loading: true,
      }
    },

    methods: {
      authenticated(user) {
        if (user) {
          this.subscribeToUser(user.uid);
        } else {
          if (this.unsubscribeUser) this.unsubscribeUser();
        }
        this.loading = false;
      },

      subscribeToUser(uid) {
        const userdocRef = db.collection('users').doc(uid);
        this.unsubscribeUser = userdocRef.onSnapshot( doc => {
          this.$store.commit('setUser', doc.data());
        });
      },
    },

    computed: {
      username () {
        return this.user.username;
      },
      isAuth() {
        return this.$store.getters.isAuth;
      },
      user() {
        return this.$store.state.user;
      },
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
  .profile-link {
      min-width: 100px;
    }
</style>
