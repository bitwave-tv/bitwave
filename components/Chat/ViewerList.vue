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
        color="yellow"
        text-color="black"
      >
        {{ channelViewCount }}
        <v-icon right>account_circle</v-icon>
      </v-chip>
    </template>

    <v-card
      width="350px"
      class="mt-1"
    >
      <!-- Header -->
      <v-sheet
        tile
        color="yellow"
        class="d-flex align-center justify-space-between pl-2"
      >
        <h5 class="black--text body-2">Live Viewers ({{ getUserList.length }})</h5>
        <v-btn
          color="black"
          text
          icon
          pa-0
          @click="showViewers = false"
        >
          <v-icon color="black">close</v-icon>
        </v-btn>
      </v-sheet>

      <div class="elevation-3 pa-3" style="border-bottom: solid 1px #111;">
        <v-switch
          v-model="showAll"
          label="Show All Viewers"
          class="mt-0"
          color="yellow"
          hide-details
          dense
          flat
        />
      </div>

      <div style="max-height: 65vh; overflow: auto; overscroll-behavior: contain; will-change: transform;">
        <v-list
          dense
          class="py-0"
        >
          <template
            v-if="showViewers && userlist.length > 0"
            v-for="viewer in userlist"
          >
              <v-lazy
                min-height="56"
                :key="viewer.data.username"
              >
                <v-list-item
                  class="pl-3"
                  :to="`${viewer.data.page}`"
                >
                  <v-list-item-avatar class="mr-3">
                    <img
                      v-if="!!viewer.data.avatar"
                      :src="viewer.data.avatar+'?_bw'"
                      :alt="viewer.data.username"
                      crossorigin
                    >
                    <v-icon
                      v-else
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
          </template>
        </v-list>
      </div>
    </v-card>
  </v-menu>
</template>

<script>
  import { mapGetters } from 'vuex';
  import { VStore } from '@/store';

  export default {
    name: 'ViewerList',

    props: {
      page : { type : String },
    },

    data() {
      return {
        showViewers : false,
        showAll: true,
      }
    },

    methods: {},

    computed: {
      ...mapGetters({
        getChannelViews: VStore.$getters.getChannelViews,
        getUserList:     VStore.$getters.getUserList,
      }),

      channelViewCount () {
        return this.getChannelViews( this.page ) || 0;
      },

      userlist () {
        if ( !this.showViewers ) return [];
        return this.getUserList.filter( viewer => {
          return this.showAll
            ? viewer
            : viewer.watching.includes( this.page.toLowerCase() );
        });
      },
    },
  }
</script>
