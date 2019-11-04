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

    <v-card>
      <v-sheet color="yellow">
        <v-layout class="pl-2" align-center>
          <v-flex>
            <h5 class="black--text body-2">Live Viewers ({{ viewerCount }})</h5>
          </v-flex>
          <v-flex shrink>
            <v-btn
              color="black"
              text
              icon
              pa-0
              @click="showViewers = false"
            >
              <v-icon color="black">close</v-icon>
            </v-btn>
          </v-flex>
        </v-layout>
      </v-sheet>

      <v-layout style="max-height: 75vh; overflow: auto; overscroll-behavior: contain; will-change: transform;">
        <v-list
          dense
          class="py-0"
        >
          <v-list-item
            v-for="viewer in viewerList"
            :key="viewer.username"
            :to="`${viewer.page.watch || viewer.page}`"
          >
            <template v-if="viewerList.length > 0">
              <v-list-item-avatar>
                <img v-if="!!viewer.avatar" :src="viewer.avatar" :alt="viewer.username">
                <v-icon v-else :style="{ background: viewer.color || 'radial-gradient( yellow, #ff9800 )', color: !viewer.color && 'black' }">person</v-icon>
              </v-list-item-avatar>
              <v-list-item-content>
                <v-list-item-title>{{ viewer.username }}</v-list-item-title>
                <v-list-item-subtitle
                  v-if="viewer.page && viewer.page.watch && channelViews[ viewer.page.watch.toLowerCase() ]"
                >
                  Chatting in: {{ `${viewer.page.watch} (${ channelViews[ viewer.page.watch.toLowerCase() ].total })` }}
                </v-list-item-subtitle>
                <v-list-item-subtitle
                  v-else-if="viewer.page && channelViews[ viewer.page.toLowerCase() ]"
                >
                  Just Watching {{ `${viewer.page} (${ channelViews[ viewer.page.toLowerCase() ].total })` }}
                </v-list-item-subtitle>
                <v-list-item-subtitle v-else>Getting Soda</v-list-item-subtitle>
              </v-list-item-content>
            </template>
          </v-list-item>
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
      },

      viewerList () {
        return this.showViewers ? this.viewers : [];
      },
    },
  }
</script>
