<template>
  <v-container
    grid-list-md
  >
    <div
      class="mb-4 d-flex justify-space-around"
    >
      <img
        style="max-width: 90%"
        src="https://cdn.bitwave.tv/static/img/bitwavetv.png"
        alt="bitwave live streaming platform"
        crossorigin
      />
    </div>

    <!-- Add Pre-built Login Form  -->
    <v-layout
      row
      justify-space-around
    >
      <lazy-login-dialog style="max-width: 450px;" />
    </v-layout>

  </v-container>
</template>

<script>
  import { auth } from '@/plugins/firebase.js'

  export default {

    name: 'login',

    middleware: 'not-auth',

    data() {
      return {
        unsubAuthChanged: null,
      }
    },

    methods: {
      async authenticated ( user ) {
        if ( user ) {
          if ( process.client )
            console.log(`%cLogin.vue:%c Logged in! %o`, 'background: #2196f3; color: #fff; border-radius: 3px; padding: .2rem .5rem;', '', user);

          setTimeout( () => this.$router.push( this.redirect ), 750 );
        } else {
          if ( process.client )
            console.log(`%cLogin.vue:%c Not logged in!`, 'background: #2196f3; color: #fff; border-radius: 3px; padding: .2rem .5rem;', '');
        }
      },
    },

    computed: {
      redirect () {
        return this.$route.query.redirect
          ? this.$route.query.redirect
          : '/profile';
      },
    },

    mounted () {
      this.unsubAuthChanged = auth.onAuthStateChanged( async user => await this.authenticated( user ) );
    },

    beforeDestroy () {
      if ( this.unsubAuthChanged ) {
        this.unsubAuthChanged();
        console.log(`%cLogin.vue:%c Unsubscribed!`, 'background: #2196f3; color: #fff; border-radius: 3px; padding: .2rem .5rem;', '');
      }
    },
  }
</script>
