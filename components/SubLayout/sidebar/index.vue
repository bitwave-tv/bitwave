<template>
  <v-navigation-drawer
    color="grey darken-4"
    :value="value"
    :mini-variant="collapsed"
    app
    @input="$emit( 'input', $event )"
  >

    <streamer-list />

    <!-- Minify Panel -->
    <template #append>
      <div class="pa-2">
        <v-btn
          color="yellow"
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

  export default {
    name: 'index.vue',

    components: {
      StreamerList,
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
