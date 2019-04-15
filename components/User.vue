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
  import { auth } from '@/plugins/firebase.js'

  import { mapGetters } from 'vuex'

  export default {

    name: 'User',

    data() {
      return {
        unsubscribeUser: null,
        loading: true,
      }
    },

    methods: {
      async authenticated(user) {
        if (user) {
          // await this.$store.dispatch('login', user);
          // if (process.client)
          //   console.log(`%cLogin.vue:%c Logged in! %o`, 'background: #2196f3; color: #fff; border-radius: 3px; padding: .25rem;', '', user);
        } else {
          if (process.client)
            console.log(`%cLogin.vue:%c Not logged in!`, 'background: #2196f3; color: #fff; border-radius: 3px; padding: .25rem;', '');
          if (this.unsubscribeUser) this.unsubscribeUser();
        }
        this.loading = false;
      },
    },

    computed: {
      ...mapGetters({
        isAuth: 'isAuth',
        username: 'username',
        user: 'user'
      }),
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
