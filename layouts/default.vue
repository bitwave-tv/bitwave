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
      :clipped-left="true"
      dark
      dense
      fixed
      color="accentwave"
    >
      <!--<v-btn
        icon
        @click.stop="drawer = !drawer"
      >
        <v-icon>menu</v-icon>
      </v-btn>-->

      <v-toolbar-title
        class="pl-0"
      >

        <v-btn
          :ripple="false"
          depressed
          icon
          exact
          id="logo_image"
          exact-active-class="app-title-active"
          class="text-none py-1 mx-0 px-0"
          @click.stop="drawer = !drawer"
        >
          <v-avatar tile size="32">
            <img
              :src="bwLogo"
              alt="bitwave.tv logo"
              title="bitwave.tv homepage"
            />
          </v-avatar>
        </v-btn>

        <v-btn
          :v-if="!mobile"
          :ripple="false"
          to="/"
          depressed
          text
          exact
          id="logo_text"
          exact-active-class="app-title-active"
          class="text-none title px-2"
        >{{ title }}</v-btn>
      </v-toolbar-title>

      <v-spacer />

      <stream-here-btn />

      <notifications v-if="isAuth" />

      <user-menu class="ml-2" />

    </v-app-bar>

    <!-- L-Nav Drawer -->
    <sidebar v-model="drawer" />

    <!-- Content -->
    <v-main>
      <nuxt />
    </v-main>

    <!-- Fireworks overlay -->
    <fireworks
      :fixed="true"
      ref="fireworks"
    />

  </v-app>
</template>

<script>
  import UserMenu from '@/components/SubLayout/UserMenu'
  import sidebar from '@/components/SubLayout/sidebar'
  import Notifications from '@/components/Notifications'
  import StreamHereBtn from '@/components/SubLayout/StreamHereBtn';
  import SystemAlert from '@/components/Alerts/SystemAlert';

  const Fireworks = async () => await import( '@/components/effects/fireworks' );

  import { mapGetters, mapMutations } from 'vuex';
  import { VStore } from '@/store';

  export default {

    components: {
      SystemAlert,
      UserMenu,
      sidebar,
      Notifications,
      StreamHereBtn,
      Fireworks,
    },

    data () {
      return {
        bwLogo: '/images/icon-2.png',
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
        try {
          this.systemAlertHidden = this.systemAlert.id;
          localStorage.setItem( 'hide-system-alert', this.systemAlert.id );
        } catch ( error ) {
          console.warn( `Failed to save 'hide-system-alert' to localStorage!`, error );
        }
      },

      async newVersionAvailable ( info ) {
        console.log( `New service worker available`, info );
      },

      onBeforeInstallPrompt ( prompt ) {
        if ( process.env.APP_DEBUG ) console.log( `Listening for PWA prompt...` );
        console.debug( `PWA Prompt:`, prompt );
        prompt.preventDefault();
        this.setPwaPrompt( prompt );
      },
    },

    computed: {
      ...mapGetters({
        isUpdateAvailable: VStore.$getters.isUpdateAvailable,
        getAlerts: VStore.$getters.getAlerts,
        isAuth: VStore.$getters.isAuth,
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

      mobile () {
        return this.mounted
          ? this.$vuetify.breakpoint.smAndDown
          : !this.$device.isDesktopOrTablet;
      },
    },

    watch: {
      showFireworks( val ) {
        if ( val ) this.$refs['fireworks'].start( this.fireworks.message, this.fireworks.subtext );
      }
    },

    async mounted () {
      this.ssr = false;

      try {
        this.systemAlertHidden = localStorage.getItem( 'hide-system-alert' );
      } catch ( error ) {
        this.systemAlertHidden = false;
        console.warn( `Failed to read 'hide-system-alert from localStorage'`, error.message );
      }

      const workbox = await window.$workbox;
      if ( workbox ) {
        workbox.addEventListener( 'waiting', async (event) => {
          console.log( event );
          await this.newVersionAvailable({ version: 'SW' });
        });
      }
    },

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
