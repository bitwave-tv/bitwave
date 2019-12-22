<template>
  <v-app>

    <!-- Toolbar -->
    <v-app-bar
      app
      :clipped-left="false"
      dark
      dense
      fixed
      color="#212121"
    >
      <v-btn
        icon
        @click.stop="drawer = !drawer"
      >
        <v-icon>menu</v-icon>
      </v-btn>

      <v-toolbar-title class="pl-0">
        <v-btn
          to="/"
          depressed
          text
          exact
          id="logo"
          exact-active-class="app-title-active"
          class="text-none title px-2"
        >{{ title }}</v-btn>
      </v-toolbar-title>

      <v-spacer />

      <stream-info />

      <notifications />

      <user class="ml-2" />

    </v-app-bar>

    <!-- L-Nav Drawer -->
    <user-list v-model="drawer" />

    <!-- Content -->
    <v-content>
      <v-fade-transition>
        <nuxt />
      </v-fade-transition>
    </v-content>

  </v-app>
</template>

<script>
  import User from '~/components/User'
  import UserList from '~/components/UserList'
  import Notifications from '~/components/Notifications'
  import StreamInfo from '@/components/StreamInfo';

  import { mapGetters } from 'vuex';
  import { VStore } from '@/store';
  import { checkForUpdate } from '@/plugins/firebase';

  export default {
    components: {
      User,
      UserList,
      Notifications,
      StreamInfo,
    },

    data () {
      return {
        title: '[bitwave.tv]',
        drawer: undefined,
      }
    },

    computed: {
      ...mapGetters({
        isUpdateAvailable: VStore.$getters.isUpdateAvailable,
      }),
    },

    /*watch: {
      isUpdateAvailable: {
        immediate: false,
        handler( newVal, oldVal ) {
          console.log( newVal );
          if ( newVal ) this.$toast.global.update( { message: `[ v${newVal} ] A new version of bitwave is available` } );
          else this.$toast.clear();
        }
      },
    },*/

    async mounted () {
      console.log( 'mounted layout' );

      const workbox = await $workbox;
      if ( workbox ) {
        workbox.addEventListener( 'waiting', async (event) => {
          console.log( event );
          await this.newVersionAvailable({ version: 'SW' });
        });
      }

      /*
      const newVersion = await checkForUpdate();
      if ( newVersion ) {
        console.log( `New version available: ${newVersion}` );
        await this.$store.dispatch( VStore.$actions.newVersionAvailable, newVersion );
      }//*/
    },
  }
</script>

<style lang="scss">
  #app .app-title-active {
    &:hover::before {
      opacity: 0.24;
    }

    &::before {
      opacity: 0;
    }
  }

  #app {
    .v-menu,
    .v-tooltip, {
      display: block !important;
    }
  }

  @import "../assets/style/bitwave-toast";
</style>
