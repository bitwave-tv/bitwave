<template>
  <v-navigation-drawer
    :value="value"
    :mini-variant="collapsed"
    mini-variant-width="60px"
    color="accentwave"
    app
    @input="$emit( 'input', $event )"
  >

    <v-layout
      fill-height
      column
    >
      <!-- Site Navigation -->
      <navigation-list />

      <!-- Streamer List -->
      <streamer-list />

    </v-layout>

    <!-- Minify Panel -->
    <template #append>
      <div class="my-2 mx-2">
        <v-btn
          color="secondary"
          class="px-0"
          block
          outlined
          small
          @click.stop="toggleCollapse"
        >
          <v-icon>{{ `chevron_${collapsed ? 'right' : 'left'}` }}</v-icon>
        </v-btn>
      </div>
    </template>

  </v-navigation-drawer>
</template>

<script>
  import StreamerList from '@/components/SubLayout/sidebar/StreamerList';
  import NavigationList from '@/components/SubLayout/sidebar/NavigationList';

  export default {
    name: 'index.vue',

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
