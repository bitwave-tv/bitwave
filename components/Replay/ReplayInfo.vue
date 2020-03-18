<template>
  <div>
    <!-- Stream Title, Status -->
    <v-toolbar
      class="elevation-2"
      color="grey darken-4"
      dense
    >
      <!-- Live / Replay / Offline Indicator -->
      <v-chip
        class="flex-shrink-0"
        :class="{ blink: live }"
        :color="live ? 'red' : replay ? 'blue' : 'grey'"
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
        {{ live ? 'LIVE' : replay ? 'REPLAY' : 'offline' }}
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
          <v-tab>{{ replay ? 'Summary' : 'Description' }}</v-tab>
          <v-tab>Replays</v-tab>
          <v-tab v-if="featureFlag && !replay">Stream Stats</v-tab>
        </v-tabs>
      </template>
    </v-toolbar>

    <!-- Replay Actions -->
    <div class="d-flex flex-shrink-0 align-center flex-wrap px-3 py-2">
      <div
        class="caption grey--text my-2"
        :title="timestamp"
      >
        <v-icon
          v-show="replay"
          size="16"
          color="grey"
        >restore</v-icon>
        <div class="d-inline-block">
          {{ live ? 'Started Streaming: ' : replay ? 'Streamed: ' : 'Last Streamed: ' }}
        </div>
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
        <edit-replay-button
          v-if="channelOwner"
          :archive-id="archiveId"
          @update="replayUpdated"
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

    <!-- Replay Data -->
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
          <!-- Replay Info Alert -->
          <v-alert
            class="mt-2"
            color="blue darken-2"
            dark
            icon="important_devices"
            prominent
          >
            <div class="headline"><span class="font-weight-light">hi,</span> Stream Replays are in <b>beta</b>.</div>
            <div>additional data and functionality coming soon™</div>
          </v-alert>

          <!-- Replay Comments -->
          <replay-comments
            :archive-id="archiveId"
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
        v-if="featureFlag && !replay"
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
      class="pa-2 d-flex justify-space-between align-center flex-wrap"
      color="grey darken-4"
      tile
    >
      <div class="overline">
        Powered by Bitwave Media
        <span class="grey--text">{{ version }}</span>
      </div>
      <div class="d-flex overline">
        <a href="https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=JAN2HKQ9CTYZY&source=url" target="_blank">Donate</a>
        <v-divider vertical class="mx-2" color="white"/>
        <a href="https://twitter.com/BitWaveTV" target="_blank">Twitter</a>
        <v-divider vertical class="mx-2" color="white"/>
        <a href="https://github.com/bitwave-tv/bitwave" target="_blank">Github</a>
        <v-divider vertical class="mx-2" color="white"/>
        <a href="https://bitwave.tv/tos" target="_blank">ToS</a>
      </div>
    </v-sheet>

  </div>
</template>

<script>
  import { timeAgo } from '@/assets/js/time-ago';

  import { mapGetters } from 'vuex';
  import { VStore } from '@/store';

  import VueMarkdown from '@/components/VueMarkdown';
  import ReplayComments from '@/components/Replay/ReplayComments';

  // Async Components - We don't expect these components to be required frequently
  const ShareStream    = async () => await import ( '@/components/ShareStream' );
  const EditReplayButton = async () => await import ( '@/components/Replay/EditReplayButton' );
  const StreamArchives = async () => await import ( '@/components/Channel/StreamArchives' );
  const RestreamDialog = async () => await import ( '@/components/Restream/RestreamDialog' );

  const DebugStream = async () => await import ( '@/components/Analytics/DebugStream' );

  export default {
    name: 'StreamInfo',

    components: {
      ReplayComments,
      VueMarkdown,
      StreamArchives,
      ShareStream,
      EditReplayButton,
      RestreamDialog,
      DebugStream,
    },

    props: {
      archiveId: { type: String },
      name:  { type: String },
      live:  { type: Boolean },
      title: { type: String },
      nsfw:  { type: Boolean },
      description: { type: String },
      timestamp: { type: Date },
      replay: { type: Boolean },
    },

    data () {
      return {
        tabData: null,
        lastStreamed: '• • •',
        updateInterval: null,
      };
    },

    methods: {
      updateLastStreamedAt () {
        if ( this.timestamp ) {
          try {
            this.lastStreamed = timeAgo( this.timestamp );
          } catch {
            this.lastStreamed = 'now';
          }
        } else {
          this.lastStreamed = '• • •';
        }
      },

      replayUpdated ( replayData ) {
        this.$emit( 'update', replayData );
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
        if ( !this.username || !this.name ) return false;
        return this.name.toLowerCase() === this.username.toLowerCase();
      },

      version () {
        return `v${process.env.version}`;
      },
    },

    watch: {
      timestamp: function ( val, oldVal ) {
        this.updateLastStreamedAt();
      }
    },

    mounted () {
      this.updateLastStreamedAt();
      this.updateInterval = setInterval( this.updateLastStreamedAt, 60 * 1000 );
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
