<template>
  <!-- Viewer List -->
  <v-menu
    v-model="showViewers"
    :close-on-content-click="false"
    offset-y
    bottom
  >
    <template #activator="{ on }">
      <v-chip
        v-on="on"
        color="primary black--text"
      >
        {{ channelViewCount }}
        <v-icon right>account_circle</v-icon>
      </v-chip>
    </template>

    <v-fade-transition>
      <viewers
        v-if="showViewers"
        :page="page"
        @close="showViewers = false"
      />
    </v-fade-transition>

  </v-menu>
</template>

<script>
  import { mapGetters } from 'vuex';
  import { VStore } from '@/store';

  import Viewers from '@/components/Chat/ViewerList/viewers';

  export default {
    name: 'ViewerList',

    components: {
      viewers: Viewers
    },

    props: {
      page : { type : String },
    },

    data() {
      return {
        showViewers : false,
      }
    },

    methods: {},

    computed: {
      ...mapGetters({
        getChannelViews: VStore.$getters.getChannelViews,
      }),

      channelViewCount () {
        return this.getChannelViews( this.page ) || 0;
      },
    },
  }
</script>
