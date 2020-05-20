<template>
  <v-card
    width="350px"
    class="mt-2"
  >
    <!-- Header -->
    <v-sheet
      tile
      color="primary"
      class="d-flex align-center justify-space-between pl-2"
    >
      <h5 class="black--text body-2">Live Viewers</h5>
      <v-btn
        color="black"
        text
        icon
        pa-0
        @click="close"
      >
        <v-icon color="black">close</v-icon>
      </v-btn>
    </v-sheet>

    <div class="elevation-3 pa-3 grey darken-4">
      <!-- Filter viewers -->
      <v-text-field
        label="Filter..."
        color="primary"
        single-line
        outlined
        hide-details
        dense
        clearable
        @input="filterViewerList"
      />

      <!-- Show all viewers toggle -->
      <v-switch
        v-model="showAll"
        :label="`Show all viewers (${showAll ? getUserList.length : getChannelViews( page )})`"
        color="primary"
        hide-details
        dense
        inset
        class="px-2"
        @change="filterViewerList"
      />
    </div>

    <hr class="primary">

    <!-- removed -> will-change: transform; -->
    <div style="max-height: 65vh; overflow: auto; overscroll-behavior: contain;">
      <v-list
        dense
        class="py-0"
      >
        <v-lazy
          min-height="56"
          v-for="viewer in filteredViewerList"
          :key="viewer.data.username"
        >
          <v-list-item
            class="pl-3"
            :to="`${viewer.data.page}`"
          >
            <picture
              v-if="!!viewer.data.avatar"
              class="v-avatar v-list-item__avatar ml-0 mr-3"
              style="height: 40px; min-width: 40px; width: 40px; background: #212121;"
            >
              <source
                v-if="viewer.data.avatars"
                :srcset="`${viewer.data.avatars.webp}`"
                type="image/webp"
              >
              <img
                :src="`${viewer.data.avatar}`"
                :alt="viewer.data.username"
              >
            </picture>
            <v-list-item-avatar
              v-else
              class="mr-3"
            >
              <v-icon
                :style="{ background: viewer.data.color || 'radial-gradient( yellow, #ff9800 )', color: !viewer.data.color && 'black' }"
              >person</v-icon>
            </v-list-item-avatar>
            <v-list-item-content>
              <v-list-item-title>{{ viewer.data.username }}</v-list-item-title>
              <v-list-item-subtitle>
                <span>Watching: {{ viewer.data.page }}</span>
                <span class="yellow--text">{{ getChannelViews( viewer.data.page).toString().padStart(2, '0') }}</span>
                <span v-if="viewer.watching.length > 1" >{{ `and ${viewer.watching.length - 1} other${viewer.watching.length - 1 > 1 ? 's' : ''}` }}</span>
              </v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
        </v-lazy>

        <v-sheet
          v-if="!showViewers"
          v-for="i in 5"
          :key="i"
          color="grey darken-4"
          class="mx-3 mt-3 mb-3 pa-2"
        >
          <v-skeleton-loader
            ref="skeleton"
            :boilerplate="false"
            type="avatar, sentences"
            class="d-flex"
            dark
          ></v-skeleton-loader>
        </v-sheet>

      </v-list>
    </div>
  </v-card>
</template>

<script>
  import { mapGetters, mapMutations, mapState } from 'vuex';
  import { VStore } from '@/store';

  export default {
    name: 'viewers',

    props: {
      page : { type : String },
    },

    data() {
      return {
        showViewers: false,
        filter: '',
        filteredViewerList: [],
      };
    },

    methods: {
      ...mapMutations ({
        setShowAll  : VStore.$mutations.setShowAll,
      }),

      close () {
        this.$emit( 'close' );
      },

      filterViewerList ( filter ) {
        this.filteredViewerList = this.viewerList.filter( viewer => {
          // Filter by username
          if ( filter && filter.length > 0 )
            return viewer.data.username.toLowerCase().includes( filter.toLowerCase() );

          // Hide users in different channels
          if ( !this.getShowAll )
            return viewer.watching.includes( this.page.toLowerCase() );

          // Default true
          return true;
        });
      },
    },

    computed: {
    ...mapGetters({
        getUserList:     VStore.$getters.getUserList,
        getChannelViews: VStore.$getters.getChannelViews,
      }),

    ...mapState({
        getShowAll:      VStore.$states.showAll,
      }),

      viewerList () {
        if ( !this.showViewers ) return [];
        return this.getUserList;
      },

      showAll: {
        set ( val ) {
          this.setShowAll( val );
        },
        get () { return this.getShowAll; }
      },

    },

    mounted() {
      setTimeout( () => {
        this.showViewers = true;
        this.filterViewerList();
      }, 500 );
    },

    beforeDestroy() {
      this.showViewers = false;
    },

  };
</script>
