<template>
  <div>
    <!-- Stream Title, Status -->
    <v-toolbar
      class="elevation-2"
      color="grey darken-4"
      dense
    >
      <!-- Live Indicator -->
      <v-chip
        class="flex-shrink-0"
        :class="{ blink: live }"
        :color="live ? 'red' : 'grey'"
        label
        outlined
        small
      >
        <v-icon
          v-show="live"
          left
          size="10"
          class="mr-2"
        >lens</v-icon>
        {{ live ? 'LIVE' : 'offline' }}
      </v-chip>

      <!-- Stream Title -->
      <h3 class="mx-2 flex-grow-1 subtitle-1 font-weight-medium text-truncate">
        {{ title }}
      </h3>

      <!-- Bottom Tabs -->
      <template #extension>
        <v-tabs
          v-model="tabData"
          background-color="transparent"
          class="no-focus"
          show-arrows
        >

          <v-tab>
            <div>
              Description
            </div>
          </v-tab>

          <v-tab>
            <div>
              Archives
            </div>
          </v-tab>

          <v-tab
            v-if="featureFlag"
          >
            <div>
              Stream Stats
            </div>
          </v-tab>

        </v-tabs>
      </template>
    </v-toolbar>

    <!-- Stream Actions -->
    <div class="d-flex flex-shrink-0 align-center flex-wrap px-3 py-2">
      <div class="caption grey--text my-2">
        <div class="d-inline-block">{{ live ? 'Started Streaming: ' : 'Last Streamed: ' }}</div>
        <v-fade-transition mode="out-in">
          <div
            class="d-inline-block"
            :key="lastStreamed"
          >
            {{ lastStreamed }}
          </div>
        </v-fade-transition>
      </div>
      <v-spacer />
      <div class="d-flex">
        <restream-dialog
          v-if="channelOwner"
          :username="name"
          :owner="uid"
          :live="live"
        />
        <edit-stream-data
          v-if="channelOwner"
          :username="username"
          :title="title"
          :description="description"
          :nsfw="nsfw"
        />
        <v-btn
          v-if="false"
          color="yellow"
          class="mr-2"
          outlined
          small
          @click="showStreamStats = !showStreamStats"
        >
          <v-icon>timeline</v-icon>
        </v-btn>
      </div>
      <ShareStream :user="name" />
    </div>

    <v-divider />

    <!-- Stream Data -->
    <v-tabs-items
      v-model="tabData"
      style="background: transparent"
      touchless
    >
      <!-- Description -->
      <v-tab-item>
        <div
          id="description"
          ref="description"
          class="pa-3"
          style="min-height: 750px"
        >
          <!-- Stream Description -->
          <vue-markdown
            v-if="description"
            :source="description"
          />
        </div>
      </v-tab-item>

      <!-- Archives -->
      <v-tab-item>
        <div
          style="min-height: 500px"
        >
          <stream-archives
            :streamer="name"
          />
        </div>
      </v-tab-item>

      <!-- Debug Stream -->
      <v-tab-item
        v-if="featureFlag"
      >
        <div
          style="min-height: 500px"
        >
          <debug-stream
            :streamer="name"
          />
        </div>
      </v-tab-item>

    </v-tabs-items>


    <!-- Footer -->
    <v-sheet
      class="pa-2"
      color="grey darken-4"
      tile
    >
      <div class="overline">
        Powered by Bitwave Media
        <span class="grey--text">{{ version }}</span>
      </div>
    </v-sheet>

  </div>
</template>

<script>
  import { mapGetters } from 'vuex';
  import { VStore } from '@/store';

  import VueMarkdown from '@/components/VueMarkdown';
  import { timeAgo } from '@/assets/js/time-ago';

  // Async Components - We don't expect these components to be required frequently
  const ShareStream    = async () => await import ( '@/components/ShareStream' );
  const EditStreamData = async () => await import ( '@/components/EditStreamData' );
  const StreamArchives = async () => await import ( '@/components/Channel/StreamArchives' );
  const RestreamDialog = async () => await import ( '@/components/Restream/RestreamDialog' );

  const DebugStream = async () => await import ( '@/components/Analytics/DebugStream' );

  export default {
    name: 'StreamInfo',

    components: {
      StreamArchives,
      VueMarkdown,
      ShareStream,
      EditStreamData,
      RestreamDialog,
      DebugStream,
    },

    props: {
      name:  { type: String },
      live:  { type: Boolean },
      title: { type: String },
      nsfw:  { type: Boolean },
      description: { type: String },
      timestamp: { type: Date },
    },

    data () {
      return {
        tabData: null,
        lastStreamed: 'Unknown',
        updateInterval: null,
      };
    },

    methods: {
      updateLasteStreamed () {
        if ( this.timestamp ) {
          try {
            this.lastStreamed = timeAgo( this.timestamp );
          } catch {
            this.lastStreamed = 'now';
          }
        } else {
          this.lastStreamed = 'Unknown';
        }
      },
    },

    computed: {
      ...mapGetters({
        username: VStore.$getters.getUsername,
        uid: VStore.$getters.getUID,
        isStreamer : VStore.$getters.isStreamer,
        isAdmin  : VStore.$getters.isAdmin,
        getFeatureFlag : VStore.$getters.getFeatureFlag,
      }),

      featureFlag () {
        const flags = this.getFeatureFlag( 'streamStats' );
        if ( flags._disabled ) return false;
        if ( flags._enabled ) return true;
        if ( flags.users && this.uid ) return true;
        if ( flags.streamers && this.isStreamer ) return true;
        if ( flags.owner && this.channelOwner ) return true;
        if ( flags.admin && this.isAdmin ) return true;
        return false;
      },

      channelOwner () {
        if ( !this.username ) return false;
        return this.name.toLowerCase() === this.username.toLowerCase();
      },

      version () {
        return `v${process.env.version}`;
      },
    },

    watch: {
      timestamp: function ( val, oldVal ) {
        this.updateLasteStreamed();
      }
    },

    mounted () {
      this.updateLasteStreamed();
      this.updateInterval = setInterval( this.updateLasteStreamed, 60 * 1000 );
    },

    beforeDestroy() {
      if ( this.updateInterval ) clearInterval( this.updateInterval );
    }
  };
</script>

<style lang="scss">
  .v-tabs.no-focus {
    .v-tab--active:hover::before,
    .v-tab--active::before {
      opacity: 0;
    }
  }
</style>
