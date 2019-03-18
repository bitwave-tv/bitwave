<template>
  <v-app
    :dark="dark"
  >

    <!-- Nav Drawer -->
    <v-navigation-drawer
      v-model="drawer"
      :mini-variant="miniVariant"
      :clipped="clipped"
      stateless
      fixed
      app
    >
      <v-list>
        <v-list-tile
          v-for="(item, i) in items"
          :key="i"
          :to="item.to"
          router
          exact
        >
          <v-list-tile-action>
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title v-text="item.title" />
          </v-list-tile-content>
        </v-list-tile>
      </v-list>
    </v-navigation-drawer>

    <!-- Chat -->
    <v-navigation-drawer
      v-model="rightDrawer"
      :right="right"
      width="400px"
      clipped
      fixed
      flat
      app
    >
      <chat/>
    </v-navigation-drawer>

    <!-- Toolbar -->
    <v-toolbar
      :clipped-left="clipped"
      clipped-right
      dark
      dense
      fixed
      app
    >
      <v-toolbar-side-icon @click="drawer = !drawer" />
      <v-btn
        icon
        @click.stop="miniVariant = !miniVariant"
      >
        <v-icon>{{ `chevron_${miniVariant ? 'right' : 'left'}` }}</v-icon>
      </v-btn>
      <v-btn
        icon
        @click.stop="clipped = !clipped"
      >
        <v-icon>web</v-icon>
      </v-btn>
      <v-btn
        icon
        @click.stop="dark = !dark"
      >
        <v-icon>brightness_medium</v-icon>
      </v-btn>
      <v-toolbar-title v-text="title" />
      <v-spacer />
      <v-btn
        icon
        @click.stop="rightDrawer = !rightDrawer"
      >
        <v-icon>menu</v-icon>
      </v-btn>
    </v-toolbar>

    <!-- Content -->
    <v-content>
      <nuxt />
    </v-content>

    <!-- Footer -->
    <v-footer
      v-if="false"
      :fixed="fixed"
      class="px-2"
      app
    >
      <span>BitWave TV &copy; 2019</span>
    </v-footer>

  </v-app>
</template>

<script>
  import Chat from '~/components/Chat'

  export default {
    components: {
      Chat,
    },

    data() {
      return {
        clipped: true,
        drawer: true,
        fixed: false,
        dark: true,
        items: [
          {
            icon: 'home',
            title: 'Welcome',
            to: '/',
          },
          {
            icon: 'apps',
            title: 'Inspire',
            to: '/inspire',
          },
          {
            icon: 'ondemand_video',
            title: 'Dispatch',
            to: '/dispatch',
          },
          {
            icon: 'ondemand_video',
            title: 'Murderder',
            to: '/murderder',
          },
        ],
        miniVariant: true,
        right: true,
        rightDrawer: true,
        title: 'BitWave.tv',
      }
    },

    methods: {

    },

    mounted() {

    },
  }
</script>
