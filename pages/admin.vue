<template>
  <v-container fluid>
    <div class="display-1 font-weight-thin yellow--text">Bitwave Admin Portal</div>
    <div class="overline">Welcome to hell</div>
    <v-row>

      <v-col
        cols="12"
        md="6"
      >
        <update-trending />
      </v-col>

      <v-col
        cols="12"
        md="6"
      >
        <add-emote />
      </v-col>

      <v-col
        cols="12"
      >
        <archive-manager />
      </v-col>

      <v-col
        cols="12"
        md="6"
      >
        <stream-manager />
      </v-col>

      <v-col
        cols="12"
        md="6"
      >
        <reports />
      </v-col>

    </v-row>

    <div>Not <i>everything</i> here works yet. In case you didn't notice...</div>
  </v-container>
</template>

<script>
  import Reports from '@/components/Admin/Reports';
  import StreamManager from '@/components/Admin/StreamManager';
  import ArchiveManager from '@/components/Admin/ArchiveManager';
  import UpdateTrending from '@/components/Admin/UpdateTrending';
  import { auth } from '@/plugins/firebase';

  export default {
    name: 'admin',

    middleware: [ 'auth', 'admin' ],

    components: {
      UpdateTrending,
      ArchiveManager,
      StreamManager,
      Reports,
    },

    data () {
      return {};
    },

    methods: {
      async authenticated ( user ) {
        if ( !user ) {
          // User logged out, redirect back to login page.
          await this.$router.push( '/login' );
        }
      },
    },

    computed: {},

    mounted () {
      this.unsubAuthChanged = auth.onAuthStateChanged( user => this.authenticated( user ) );
    },

    beforeDestroy () {
      if ( this.unsubAuthChanged ) {
        this.unsubAuthChanged();
        console.log( `%cAdmin:%c Unsubscribed!`, 'background: #2196f3; color: #fff; border-radius: 3px; padding: .2rem .5rem;', '' );
      }
    },
  };
</script>
