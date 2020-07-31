<template>
  <v-navigation-drawer
    :value="value"
    :mini-variant="collapsed"
    :mini-variant-width="64"
    :clipped="true"
    fixed
    color="accentwave"
    app
    @input="$emit( 'input', $event )"
  >
    <div class="d-flex flex-column fill-height">
      <v-divider />

      <!-- Site Navigation -->
      <navigation-list />

      <v-divider class="px-2" />

      <!-- Streamer List -->
      <streamer-list />
    </div>

    <!-- Minify Panel -->
    <template #append>
      <v-sheet color="blue-grey darken-4">
        <v-divider />
        <div class="py-2 px-2">
          <v-btn
            color="primary"
            class="px-0"
            block
            outlined
            x-small
            @click.stop="toggleCollapse"
          >
            <v-icon>{{ `chevron_${collapsed ? 'right' : 'left'}` }}</v-icon>
          </v-btn>
        </div>
      </v-sheet>
    </template>

  </v-navigation-drawer>
</template>

<script>
  import StreamerList from '@/components/SubLayout/sidebar/StreamerList';
  import NavigationList from '@/components/SubLayout/sidebar/NavigationList';

  export default {
    name: 'sidebar',

    components: {
      NavigationList,
      StreamerList,
    },

    props: {
      value: { type: Boolean },
    },

    data() {
      return {
        collapsed: true,
      };
    },

    methods: {
      toggleCollapse () {
        this.collapsed = !this.collapsed;
      },
    },
  };
</script>

<style lang='scss'>
  .hide-scrollbar {
    scrollbar-width: none; /* Firefox */
    -ms-overflow-style: none;  /* IE 10+ */

    &::-webkit-scrollbar {
      width: 0;
      height: 0;
    }
  }

  .offline {
    -webkit-filter: grayscale(60%);
    filter: grayscale(60%);
  }
</style>
