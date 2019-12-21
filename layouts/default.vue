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

  import { mapActions } from 'vuex';
  import { VStore } from '@/store';

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

    methods: {
      ...mapActions({
        checkForNewVersion: VStore.$actions.checkForNewVersion,
      }),
    },

    async mounted () {
      const workbox = await $workbox;
      if ( workbox ) {
        workbox.addEventListener('waiting', (event) => {
          console.log( event );
          this.$toast.global.update( { message: '[SW] A new version of bitwave is available' } );
        });
      }
      await this.checkForNewVersion();
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

  @import "../assets/style/bitwave-toast";
</style>
