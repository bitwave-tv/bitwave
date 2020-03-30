<template>
  <div class="text-center">
    <v-tooltip bottom>
      <template v-slot:activator="{ on }">
        <v-btn
          v-on="on"
          class="mr-3"
          small
          outlined
          color="primary"
          @click="showRestreamDialog = true"
        >
          restream
          <v-icon class="ml-1">call_split</v-icon>
        </v-btn>
      </template>
      <span>Restream</span>
    </v-tooltip>

    <v-dialog
      v-model="showRestreamDialog"
      width="500"
    >
      <v-card
        color="grey darken-4"
        :loading="savingData || showExitConfirm"
      >
        <v-sheet
          tile
          color="primary"
          class="pa-2 d-flex justify-space-between align-center"
        >
          <h4 class="black--text body-1">
            <v-icon color="black">call_split</v-icon>
            Restream
          </h4>
          <v-btn
            color="black"
            text
            icon
            small
            @click="cancel"
          >
            <v-icon>close</v-icon>
          </v-btn>
        </v-sheet>

        <div class="py-4 mt-3">

          <div class="px-3" v-if="restreamData">

            <v-select
              class="mb-5"
              :items="streamingPlatforms"
              color="primary"
              label="Streaming Services"
              outlined
              single-line
              dense
              hide-details
              clearable
              prepend-icon="rss_feed"
              @change="val => restreamData.server = val"
            />

            <v-text-field
              v-model="restreamData.server"
              color="primary"
              label="Stream Server"
              outlined
              clearable
              dense
              counter="300"
              id="new-stream-server"
              name="new-stream-server"
              autocomplete="new-stream-server"
              prepend-icon="router"
              :loading="savingData"
              :disabled="savingData"
              @change="enableSave = true"
            />

            <v-text-field
              v-model="restreamData.streamkey"
              color="primary"
              label="Stream Key"
              outlined
              clearable
              dense
              counter="300"
              id="new-stream-key"
              name="new-stream-key"
              autocomplete="new-stream-key"
              prepend-icon="https"
              :class="{ blur: showRestreamKey }"
              :loading="savingData"
              :disabled="savingData"
              @change="enableSave = true"
            />

            <div v-show="!live">
                <span class="red--text font-weight-bold">Not Live!</span>
              You must be live on bitwave in order to start restreaming.
            </div>
            <div v-show="live">
                <span class="blue--text font-weight-bold">READY</span>
              You can safely close this window at any time.
            </div>

            <div class="d-flex justify-space-between align-center mt-3">
              <div>
                Status:
                <v-chip
                  :color="statusColor"
                  small
                >
                  {{ restreamData.state }}
                </v-chip>
              </div>
              <div class="d-flex">
                <v-btn
                  class="mr-2"
                  color="green"
                  small
                  :disabled="!live"
                  @click="startRestreamer"
                >
                  Start
                </v-btn>
                <v-btn
                  color="red"
                  small
                  :disabled="!live"
                  @click="stopRestreamer"
                >
                  Stop
                </v-btn>
              </div>
            </div>

          </div>

          <div
            v-else
            class="px-3"
          >
            <div class="mb-3 d-flex justify-center">
              <v-btn
                class="mx-3"
                color="primary"
                light
                :loading="creatingRestreamer"
                @click="createRestreamer"
              >
                Create Restreamer
              </v-btn>
            </div>
            <div>
              By clicking "create restreamer" you acknlowdge that you agree to the terms below.
            </div>
          </div>

        </div>

        <v-card-text>
          <div class="grey--text caption">
            Disclaimer:
            Bitwave Media is not responsible for content streamed to other platforms.
            Content streamed to other platforms is subject to the Terms and Conditions
            of that platform. Use and access to restreamer may be restricted at will and
            without notice at any time. Restreaming is a premium service offered by Bitwave Media
            and is provided "as-is" and for free during intial beta testing of service.
            Future use and access is not guarenteed.
            <br>
            Additional Terms and Conditions may apply.
          </div>

          <div class="d-flex align-center mt-3">
            <v-btn
              class="mr-2 black--text"
              color="primary"
              small
              target="_blank"
              href="https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=JAN2HKQ9CTYZY&source=url"
            >
              PayPal
            </v-btn>
            <div class="white--text">
              Please consider donating to Bitwave Media to help cover bandwidth and server costs.
            </div>
          </div>

        </v-card-text>

        <v-divider />

        <v-card-actions>
          <v-spacer />
          <v-btn
            color="primary"
            text
            @click="close"
          >
            {{ restreamData ? 'save' : 'close' }}
          </v-btn>
        </v-card-actions>
      </v-card>

      <!-- Exit Confirmation Dialog -->
      <v-dialog
        v-model="showExitConfirm"
        width="320"
      >
        <v-card>

          <v-sheet
            color="primary"
            class="pa-2 d-flex justify-space-between align-center"
          >
            <h4 class="black--text body-1">
              You have unsaved changes!
            </h4>
            <v-icon light>warning</v-icon>
          </v-sheet>

          <v-card-title class="subtitle-1">
            Are you sure you want to exit?
          </v-card-title>


          <v-card-actions class="justify-end">

            <v-btn
              class="mr-2"
              color="primary"
              outlined
              @click="showExitConfirm = false"
            >
              No
            </v-btn>
            <v-btn
              color="primary"
              light
              @click="forceQuit"
            >
              Yes
            </v-btn>

          </v-card-actions>

        </v-card>
      </v-dialog>

    </v-dialog>
  </div>
</template>

<script>
  import { db } from '@/plugins/firebase.js';
  import { auth } from '@/plugins/firebase';

  // 'STARTING'|'ACTIVE'|'ERROR'|'STOPPING'|'STOPPED'

  const colormap = new Map([
    ['STARTING', 'blue'],
    ['ACTIVE', 'green'],
    ['ERROR', 'red'],
    ['STOPPED', 'grey'],
  ]);

  export default {
    name: 'RestreamDialog',

    props: {
      username: { type: String },
      owner: { type: String },
      live: { type: Boolean },
    },

    data () {
      return {
        mounted: false,
        showRestreamDialog: false,
        dataListener: null,
        loadingData: true,
        savingData: false,
        dataChanged: false,
        showExitConfirm: false,
        restreamData: null,
        showKey: false,
        creatingRestreamer: false,
        streamerRef: null,

        streamingPlatforms: [
          { text: 'Custom Server', value: 'rtmp://' },
          { text: 'Twitch', value: 'rtmp://live-sfo.twitch.tv/app' },
          { text: 'Dlive', value: 'rtmp://stream.dlive.tv/live' },
          { text: 'YouTube', value: 'rtmp://a.rtmp.youtube.com/live2' },
        ],
      };
    },

    methods: {
      cancel () {
        if ( this.dataChanged ) {
          this.showExitConfirm = true;
        } else {
          this.showRestreamDialog = false;
        }
      },

      forceQuit () {
        this.resetComponent();
        this.showRestreamDialog = false;
      },

      resetComponent () {
        this.showExitConfirm = false;
        this.savingData = false;
        this.dataChanged = false;
      },

      async onRestreamClick () {
        try {
          switch ( this.restreamData.state ) {
            case 'inactive':
              await this.startRestreamer();
              break;
            case 'active':
              await this.stopRestreamer();
              break;
            default:
              console.log( 'Invalid state!', this.restreamData.state );
              break;
          }
        } catch ( error ) {
          console.log(error);
        }
      },

      onUpdate ( snapshot ) {
        if ( snapshot.size > 0 ) {
          const data = snapshot.docs[0].data();
          this.streamerRef = snapshot.docs[0].ref;
          this.restreamData = data;
          this.showKey = false;
        }
      },

      createEndpoint ( mode ) {
        return `https://api.bitwave.tv/v1/streamer/restream/${mode}`;
      },

      createPayload () {
        return {
          user: this.username,
          server: this.restreamData.server,
          key: this.restreamData.streamkey,
        };
      },

      async getFreshIdToken () {
        const token = await auth.currentUser.getIdToken( true );
        console.log( `Fresh ID token:\n${token}` );
        return token;
      },

      async startRestreamer () {
        const token = await this.getFreshIdToken();
        this.$axios.setToken( token, 'Bearer' );
        const payload = this.createPayload();
        console.log(payload);
        try {
          await this.updateRestreamer();
          const { data } = await this.$axios.post(
            this.createEndpoint( 'start' ),
            payload,
          );
          console.log( data );
          this.$toast.success( `Attempting to start restream.`, { icon: 'done', duration: 3000 } );
        } catch (error) {
          this.$toast.error( `Failed to start restreamer.`, { icon: 'warning', duration: 3000 } );
        }
      },

      async stopRestreamer () {
        try {
          const token = await this.getFreshIdToken();
          this.$axios.setToken( token, 'Bearer' );
          const payload = this.createPayload();
          const { data } = await this.$axios.post(
            this.createEndpoint( 'stop' ),
            payload,
          );
          console.log(data);
          this.$toast.success( `Attempting to start restream.`, { icon: 'done', duration: 3000 } );
        } catch (error) {
          this.$toast.error( `Failed to start restreamer.`, { icon: 'warning', duration: 3000 } );
        }
      },

      async createRestreamer () {
        if ( this.creatingRestreamer ) return;
        this.creatingRestreamer = true;
        await db
          .collection('restreamers')
          .add({
            _username: this.username.toLowerCase(),
            owner: this.owner,
            server: '',
            streamkey: '',
            state: 'inactive',
          });
        this.creatingRestreamer = true;
      },

      async updateRestreamer () {
        if ( !this.streamerRef ) {
          this.$toast.error( `Missing reference to resreamer config`, { icon: 'warning', duration: 3000 } );
          return;
        }
        try {
          await this.streamerRef.update({
            server: this.restreamData.server,
            streamkey: this.restreamData.streamkey,
          });
        } catch (error) {
          console.log(error);
          this.$toast.error( `Failed to save restreamer config`, { icon: 'warning', duration: 3000 } );
        }
      },

      async close () {
        await this.updateRestreamer();
        this.showRestreamDialog = false;
      },
    },

    computed: {
      showRestreamKey () {
        return this.showKey;
      },

      statusColor () {
        if ( this.restreamData )
          return colormap.get( this.restreamData.state ) || 'grey';
        else
          return 'grey';
      },
    },

    mounted () {
      if ( this.owner )
        this.dataListener = db
          .collection( 'restreamers' )
          .where( 'owner', '==', this.owner )
          .onSnapshot( data => this.onUpdate( data ) );
      else
        this.showError = true;
      this.mounted = true;
    },

    beforeDestroy () {
      if ( this.dataListener ) {
        this.dataListener();
        this.dataListener = null;
      }
    },
  };
</script>

<style lang='scss'>
.blur {
  filter: blur(50px);
  -webkit-filter: blur(50px);
}
</style>
