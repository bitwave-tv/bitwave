<template>
  <v-app :class="{ ssr: ssr, systemAlert: !!showSystemAlert }">
    <!-- System Bar -->
    <v-slide-y-transition>
      <system-alert
        v-if="showSystemAlert"
        :id="systemAlert.id"
        :scroll="systemAlert.scroll"
        :message="systemAlert.message"
        :icon="systemAlert.icon"
        :color="systemAlert.color"
        :text-color="systemAlert.textColor"
        @hide="hideSystemAlert"
      />
    </v-slide-y-transition>

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
      <nuxt />
    </v-content>

    <!-- Fireworks overlay -->
    <Fireworks ref="fireworks" />

  </v-app>
</template>

<script>
  import User from '@/components/User'
  import UserList from '@/components/UserList'
  import Notifications from '@/components/Notifications'
  import StreamInfo from '@/components/StreamInfo';
  import SystemAlert from '@/components/Alerts/SystemAlert';

  const Fireworks = async () => await import( '@/components/effects/fireworks' );

  import { mapGetters, mapMutations } from 'vuex';
  import { VStore } from '@/store';

  export default {

    components: {
      SystemAlert,
      User,
      UserList,
      Notifications,
      StreamInfo,
      Fireworks,
    },

    data () {
      return {
        title: '[bitwave.tv]',
        drawer: null,
        ssr: true,
        systemAlertHidden: null,
      }
    },

    methods: {
      ...mapMutations({
        setPwaPrompt: VStore.$mutations.setPwaPrompt
      }),

      hideSystemAlert () {
        this.systemAlertHidden = this.systemAlert.id;
        localStorage.setItem( 'hide-system-alert', this.systemAlert.id );
      },

      async newVersionAvailable ( info ) {
        console.log( `New service worker available`, info );
      },

      onBeforeInstallPrompt ( prompt ) {
        console.log( `PWA Prompt:`, prompt );
        prompt.preventDefault();
        this.setPwaPrompt( prompt );
      },
    },

    computed: {
      ...mapGetters({
        isUpdateAvailable: VStore.$getters.isUpdateAvailable,
        getAlerts: VStore.$getters.getAlerts,
      }),

      systemAlert () {
        return this.getAlerts.hasOwnProperty( 'systemAlert' )
          ? this.getAlerts.systemAlert
          : false;
      },

      showSystemAlert () {
        return this.systemAlert
          && this.systemAlert.display
          && this.systemAlertHidden !== this.systemAlert.id;
      },

      fireworks () {
        return this.getAlerts.hasOwnProperty( 'fireworks' )
          ? this.getAlerts.fireworks
          : false;
      },

      showFireworks () {
        return this.fireworks
          && this.fireworks.display;
      },
    },

    watch: {
      showFireworks( val ) {
        if ( val ) this.$refs['fireworks'].start( this.fireworks.message, this.fireworks.subtext );
      }
    },

    async mounted () {
      this.ssr = false;
      this.systemAlertHidden = localStorage.getItem( 'hide-system-alert' );

      const workbox = await $workbox;
      if ( workbox ) {
        workbox.addEventListener( 'waiting', async (event) => {
          console.log( event );
          await this.newVersionAvailable({ version: 'SW' });
        });
      }

      window.addEventListener( 'beforeinstallprompt', this.onBeforeInstallPrompt  );
    },

    beforeDestroy () {
      window.removeEventListener( 'beforeinstallprompt', this.onBeforeInstallPrompt  );
    }

  }
</script>

<style lang="scss">
  @import "~assets/style/bitwave-toast";

  #app .app-title-active {
    &:hover::before {
      opacity: 0.24;
    }

    &::before {
      opacity: 0;
    }
  }

  #app.ssr {
    .v-menu,
    .v-tooltip, {
      display: block !important;
    }
  }

</style>
