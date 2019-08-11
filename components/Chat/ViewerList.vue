<template>
  <!-- Viewer List -->
  <v-menu
    v-model="showViewers"
    :close-on-content-click="false"
    :nudge-width="250"
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

    <v-card>
      <v-sheet color="yellow">
        <v-layout class="pl-2" align-center>
          <v-flex>
            <h5 class="black--text body-1">Live Viewers ({{ viewerCount }})</h5>
          </v-flex>
          <v-flex shrink>
            <v-btn
              color="black"
              flat
              icon
              pa-0
              @click="showViewers = false"
            ><v-icon color="black">close</v-icon></v-btn>
          </v-flex>
        </v-layout>
      </v-sheet>

      <v-layout style="max-height: 75vh; overflow: auto; overscroll-behavior: contain;">
        <v-list
          dense
          two-line
        >
          <v-list-tile
            avatar
            v-for="viewer in viewers"
            :key="viewer.username"
          >
            <template v-if="viewers.length > 0">
              <v-list-tile-avatar>
                <img v-if="!!viewer.avatar" :src="viewer.avatar" :alt="viewer.username">
                <v-icon v-else :style="{ background: viewer.color || 'radial-gradient( yellow, #ff9800 )', color: !viewer.color && 'black' }">person</v-icon>
              </v-list-tile-avatar>
              <v-list-tile-content>
                <v-list-tile-title>{{ viewer.username }}</v-list-tile-title>
                <v-list-tile-sub-title
                  v-if="viewer.page && viewer.page.watch && channelViews[ viewer.page.watch.toLowerCase() ]"
                >
                  Chatting in: {{ `${viewer.page.watch} (${ channelViews[ viewer.page.watch.toLowerCase() ].total })` }}
                </v-list-tile-sub-title>
                <v-list-tile-sub-title
                  v-else-if="viewer.page && channelViews[ viewer.page.toLowerCase() ]"
                >
                  Just Watching {{`${viewer.page} (${ channelViews[ viewer.page.toLowerCase() ].total })` }}
                </v-list-tile-sub-title>
                <v-list-tile-sub-title v-else>Getting Soda</v-list-tile-sub-title>
              </v-list-tile-content>
            </template>
          </v-list-tile>
        </v-list>
      </v-layout>

    </v-card>
  </v-menu>
</template>

<script>
  import { mapState, mapGetters } from 'vuex'

  export default {
    name: 'ViewerList',

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
      ...mapState ('chat', {
        viewers: 'viewerList',
        channelViews: 'roomViewerList',
      }),

      ...mapGetters('chat', {
        viewerCount: 'viewerCount',
      }),

      channelViewCount () {
        return this.channelViews[ this.page.toLowerCase() ] ? this.channelViews[ this.page.toLowerCase() ].total : 0;
      }
    },
  }
</script>
