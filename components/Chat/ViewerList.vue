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
        <h5 class="black--text body-2">Live Viewers ({{ viewerCount }})</h5>
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
            v-if="showViewers && viewerList.length > 0"
            v-for="viewer in viewerList"
          >
              <v-lazy
                min-height="56"
                :key="viewer.username"
              >
                <v-list-item
                  :to="`${viewer.page}`"
                >
                  <v-list-item-avatar>
                    <img v-if="!!viewer.avatar" :src="viewer.avatar" :alt="viewer.username">
                    <v-icon v-else :style="{ background: viewer.color || 'radial-gradient( yellow, #ff9800 )', color: !viewer.color && 'black' }">person</v-icon>
                  </v-list-item-avatar>
                  <v-list-item-content>
                    <v-list-item-title>{{ viewer.username }}</v-list-item-title>
                    <v-list-item-subtitle>
                      Watching: {{ `${viewer.page} (${ getViewCount ( viewer.page) })` }}
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
  import { mapState, mapGetters } from 'vuex'
  import { Chat } from '@/store/chat';

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

    methods: {
      getViewCount ( channel ) {
        if ( this.streamViewerList ) {
          const viewers = this.streamViewerList.find( svl => svl.streamer.toLowerCase() === channel.toLowerCase() );
          return viewers ? viewers.viewCount : 0;
        } else {
          return 0;
        }
      },
    },

    computed: {
      ...mapState (Chat.namespace, {
        viewers: Chat.$states.viewerList,
        channelViews: Chat.$states.roomViewerList,
      }),

      ...mapGetters(Chat.namespace, {
        viewerCount: Chat.$getters.viewerCount,
        streamViewerList: Chat.$getters.getStreamViewerList,
      }),

      channelViewCount () {
        return this.getViewCount( this.page );
      },

      viewerList () {
        if ( !this.viewers || !this.showViewers ) return [];
        return this.viewers.filter( viewer => {
          if ( this.showAll ) {
            return viewer;
          } else {
            const page = (typeof(viewer.page) === 'object') ? viewer.page.watch : viewer.page;
            if ( page.toLowerCase() === this.page.toLowerCase() ) {
              return viewer;
            }
          }
        });
      },
    },
  }
</script>
