<template>
  <div>
    <v-container>
      <v-row class="stream-stats">

        <!-- Bitrate Graph -->
        <v-col
          cols="12"
          md="6"
        >
          <v-card color="grey darken-4">
            <div class="chart-val grey--text text-weight-thin overline text-center py-2">
              {{ streamer }}: Bitrate
            </div>
            <v-sparkline
              :value="graphValues1"
              :gradient="gradient"
              :smooth="radius || false"
              :padding="padding"
              :line-width="width"
              :type="type"
              stroke-linecap="round"
              gradient-direction="top"
            />
            <div class="chart-val d-flex justify-space-around white--text text-weight-thin caption text-center pa-2">
              <template
                v-for="( stat, name, index ) in bitrateStats[bitrateStats.length - 1]"
              >
                <!-- TODO: add click support -->
                <div>
                  <span class="grey--text mr-1">{{ name }}</span>
                  <span class="body-2">{{ stat }}</span>
                </div>
                <v-divider
                  v-if="index < 3"
                  color="orange"
                  vertical
                  class="mx-1"
                />
              </template>
            </div>
          </v-card>
        </v-col>

        <!-- Packet Size Graph -->
        <v-col
          cols="12"
          md="6"
        >
          <v-card color="grey darken-4">
            <div class="chart-val grey--text text-weight-thin overline text-center py-2">
              {{ streamer }}: Target Size per Frame
            </div>
            <v-sparkline
              :value="graphValues2"
              :gradient="gradient"
              :smooth="radius || false"
              :padding="padding"
              :line-width="width"
              :type="type"
              stroke-linecap="round"
              gradient-direction="top"
            />
            <div class="chart-val d-flex justify-space-around white--text text-weight-thin caption text-center pa-2">
              <template
                v-for="( stat, name, index ) in data[data.length - 1]"
              >
                <div>
                  <span class="grey--text mr-1">{{ name }}</span>
                  <span class="body-2">{{ stat }}</span>
                </div>
                <v-divider
                  v-if="index !== 5 - 1"
                  color="orange"
                  vertical
                  class="mx-1"
                />
              </template>
            </div>
          </v-card>
        </v-col>

        <!-- Dropped Frames Graph -->
        <v-col
          cols="12"
          md="6"
        >
          <v-card color="grey darken-4">
            <div class="chart-val grey--text text-weight-thin overline text-center py-2">
              Player: Dropped Frames %
            </div>
            <v-sparkline
              :value="graphVideoPlaybackQuality"
              :gradient="gradient"
              :smooth="radius || false"
              :padding="padding"
              :line-width="width"
              :type="type"
              stroke-linecap="round"
              gradient-direction="top"
            />
            <div class="chart-val d-flex justify-space-around white--text text-weight-thin caption text-center pa-2">
              <template
                v-if="videoPlaybackQuality.length > 2"
                v-for="( stat, name, index ) in videoPlaybackQuality[videoPlaybackQuality.length - 1]"
              >
                <div>
                  <span class="grey--text mr-1">{{ name }}</span>
                  <span class="body-2">{{ stat }}</span>
                </div>
                <v-divider
                  v-if="index !== Object.keys(videoPlaybackQuality[videoPlaybackQuality.length - 1]).length - 1"
                  color="orange"
                  vertical
                  class="mx-1"
                />
              </template>
            </div>
          </v-card>
        </v-col>

        <!-- Bandwidth Graph -->
        <v-col
          cols="12"
          md="6"
        >
          <v-card color="grey darken-4">
            <div class="chart-val grey--text text-weight-thin overline text-center py-2">
              Player: Detected Bandwidth (estimate)
            </div>
            <v-sparkline
              :value="graphHlsBandwidth"
              :gradient="gradient"
              :smooth="radius || false"
              :padding="padding"
              :line-width="width"
              :type="type"
              stroke-linecap="round"
              gradient-direction="top"
            />
            <div class="chart-val d-flex justify-space-around white--text text-weight-thin caption text-center pa-2">
              <template
                v-if="hlsGraphStats.length > 2"
                v-for="( stat, name, index ) in hlsGraphStats[hlsGraphStats.length - 1]"
              >
                <div>
                  <span class="grey--text mr-1">{{ name }}</span>
                  <span class="body-2">{{ stat }}</span>
                </div>
                <v-divider
                  v-if="index !== Object.keys(hlsGraphStats[hlsGraphStats.length - 1]).length - 1"
                  color="orange"
                  vertical
                  class="mx-1"
                />
              </template>
            </div>
          </v-card>
        </v-col>

        <!-- Chart.js Graph -->
        <v-col
          cols="12"
        >
          <v-card color="grey darken-4">
            <div class="chart-val grey--text text-weight-thin overline text-center py-2">
              NEW! Player: Detected Bandwidth (estimate)
            </div>

            <basic-line
              :chartData="chartData"
              :options="chartOptions"
            />

            <div class="chart-val d-flex justify-space-around white--text text-weight-thin caption text-center pa-2">
              <template
                v-if="hlsGraphStats.length > 2"
                v-for="( stat, name, index ) in hlsGraphStats[hlsGraphStats.length - 1]"
              >
                <div>
                  <span class="grey--text mr-1">{{ name }}</span>
                  <span class="body-2">{{ stat }}</span>
                </div>
                <v-divider
                  v-if="index !== Object.keys(hlsGraphStats[hlsGraphStats.length - 1]).length - 1"
                  color="orange"
                  vertical
                  class="mx-1"
                />
              </template>
            </div>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <v-alert
      class="my-3 mx-2"
      info
      dense
    >
      <div>This page is to help aid in debugging and diagnosing issues.</div>
      <div>The top 2 graphs represent stream health according to the ingestion server.</div>
      <div>The bottom 2 graphs help identify issues with client side playback errors.</div>
      <div class="overline mt-2">Note: this only works for streams on the bitwave / bitrave server.</div>
    </v-alert>

    <v-card class="mx-2 pa-3">
      <div class="white--text title">Experimental Player Settings</div>
      <div>
        Attempt to keep player as live as possible by preferring to <i>skip</i> to live
        content when we detect that the player is beginning to fall behind.<br>
        This will make it seems like streams are 'jumpy' or inconsistent, but will ensure
        that you are always watching the most recent stream.<br>
        Disabling this means streams will be <i>smoother</i>,but can sometimes fall up to
        a full minute behind the live broadcast due to netowrk or hardware lag.<br>
        This setting defaults to <kbd>disabled</kbd> when you refresh the page.
      </div>
      <v-switch
        v-model="pinToLive"
        label="Keep Stream Live"
        color="yellow"
        hide-details
        dense
        inset
      />
    </v-card>

  </div>
</template>

<script>
  import socketio from 'socket.io-client';

  import { mapState, mapMutations } from 'vuex';
  import { VStore } from '@/store';

  import BasicLine from '@/assets/js/Charts/BasicLine';

  const APIServer = 'https://api.bitwave.tv';

  let minBandwidth = null;

  const formatDataSize = sizeInKb => {
    if ( !sizeInKb ) return `Error`;
    if ( sizeInKb < 512 ) return `${sizeInKb.toFixed(2)}kb`;
    sizeInKb /= 1024;
    if ( sizeInKb < 512 ) return `${(sizeInKb).toFixed(2)}mb`;
    sizeInKb /= 1024;
    if ( sizeInKb < 512 ) return `${(sizeInKb).toFixed(2)}gb`;
    sizeInKb /= 1024;
    if ( sizeInKb < 512 ) return `${(sizeInKb).toFixed(2)}tb`;
  };

  export default {
    name: 'DebugStream',

    props: {
      streamer: { type: String },
    },

    components: {
      BasicLine
    },

    data() {
      return {
        socket: null,

        gradient: [ '#f72047', '#ff9800', '#ffd200', '#03a9f4', 'blue' ],
        radius: 5,
        padding: 5,
        width: 2,
        type: 'trend',

        maxHistory: 60 * 2, // 2 minutes of history

        data: [],
        graphData1: 'currentKbps',
        graphData2: 'targetSize',

        hlsStats: [],
        hlsGraph: 'bandwidth',

        chartOptions: {
          xAxisID: 'Time',
          responsive: true,
        },

        chartData: {
          labels: 'I really dunno',
          datasets: [
            {
              label: 'Data One',
              backgroundColor: 'blue',
              data: [],
            }
          ]
        },
      };
    },

    methods: {
      async connect () {
        const socketOptions = { transports: [ 'websocket' ] };

        this.socket = socketio( APIServer, socketOptions );

        this.socket.on( 'connect',    async () => await this.onConnect() );
        this.socket.on( 'disconnect', async data  => await this.socketError( `Connection Lost`, data ) );
        this.socket.on( 'error',      async error => await this.socketError( `Connection Failed`, error ) );

        this.socket.on( 'live',    async ( data ) => await this.onStreamerLive( data ) );
        this.socket.on( 'update',  async ( data ) => await this.onStreamerUpdate( data ) );
        this.socket.on( 'offline', async ( data ) => await this.onStreamerOffline( data ) );
      },

      async socketError ( error, reason ) {
        this.loading = true;
        this.$toast.error( `${error}${reason ? `: ${reason}` : '' }`, { icon: 'error', duration: 2000, position: 'top-right' } );
      },

      async onConnect () {
        this.socket.emit( 'user.streamer.connect', { streamer: this.streamer.toLowerCase() } );
      },

      async onStreamerLive( { live, streamer, server } ) {
        console.log( `${streamer} has gone live on the ${server} server` );
        this.$toast.success( `${streamer} is now live`, { icon: 'error', duration: 2000, position: 'top-right' } );
      },

      async onStreamerUpdate( { streamer, data } ) {
        // Data will be: frames / currentFps / currentKbps / targetSize / timemark
        // console.log( `${streamer}:`, data );

        this.data.push( data );
        this.data = this.data.splice( -this.maxHistory );
        // this.data[ 0 ].currentKbps = 0;

        this.hlsStats.push( JSON.parse(JSON.stringify($bw.hls.stats)) );
        this.hlsStats = this.hlsStats.splice( -this.maxHistory );

        minBandwidth = minBandwidth === null ? $bw.hls.stats.bandwidth : Math.min($bw.hls.stats.bandwidth, minBandwidth);

        // this.data.push(data.targetSize / data.frames);
        const newDatasets = this.chartData.datasets;
        newDatasets[0].data.push(data.targetSize / data.frames);

        this.chartData = {
          labels: 'I really dunno',
          datasets: [ newDatasets.splice(-120) ],
        };

      },

      async onStreamerOffline( { live, streamer, server } ) {
        console.log( `${streamer} has gone offline on the ${server} server` );
        this.$toast.error( `${streamer} is now offline`, { icon: 'error', duration: 2000, position: 'top-right' } );
      },

      ...mapMutations({
        setPinToLive: VStore.$mutations.setPinToLive,
      }),
    },

    computed: {
      bitrateStats () {
        return this.data.map( data => {
          return {
            bitrate: formatDataSize( data.currentKbps ) + '/s',
            fps: data.currentFps,
            totalData: formatDataSize( data.targetSize ),
            time: data.timemark,
          };
        });
      },

      graphValues1 () {
        return this.data.map( datapoint => datapoint[ this.graphData1 ] );
      },

      graphValues2 () {
        return this.data.map( datapoint => datapoint[ this.graphData2 ] / datapoint.frames );
      },

      videoPlaybackQuality () {
        return this.hlsStats.map( hlsStats => {
          return {
            // ...hlsStats.videoPlaybackQuality,
            dropped: hlsStats.videoPlaybackQuality.droppedVideoFrames,
            total: ( hlsStats.videoPlaybackQuality.totalVideoFrames / 1000 ).toFixed(1) + 'k',
            percentDropped: (hlsStats.videoPlaybackQuality.droppedVideoFrames / hlsStats.videoPlaybackQuality.totalVideoFrames * 100).toFixed(2) + '%',
          }
        });
      },

      graphVideoPlaybackQuality () {
        return this.videoPlaybackQuality
          .map( quality => (quality.dropped / quality.total) || 0 );
      },

      hlsGraphStats () {
        return this.hlsStats.map( hlsStats => {
          return {
            bandwidth: formatDataSize( hlsStats.bandwidth / 1024 ) + '/s',
            min: formatDataSize( minBandwidth / 1024 ) + '/s',
            requests: hlsStats.mediaRequests,
            aborted: hlsStats.mediaRequestsAborted,
            errored: hlsStats.mediaRequestsErrored,
            timedout: hlsStats.mediaRequestsTimedout,
          }
        });
      },

      graphHlsBandwidth () {
        return this.hlsStats
          .map( hlsStats => hlsStats.bandwidth );
      },

      ...mapState({
        getPinToLive: VStore.$states.pinToLive,
      }),

      pinToLive: {
        set ( val ) { this.setPinToLive( val ) },
        get () { return this.getPinToLive }
      },
    },

    mounted() {
      this.connect();
    },

    beforeDestroy() {
      if ( this.socket ) {
        this.socket.off();
        this.socket.disconnect();
      }
    },

    destroyed() {
      if ( this.socket ) {
        this.socket.off();
        this.socket.disconnect();
      }
    },

  };
</script>

<style lang='scss'>
  .stream-stats {
    z-index: 2;

    .graph {
      background: rgba(0,0,0,.85);
      top: 0;
      left: 0;
      right: 0;
      z-index: 2;
    }

    .chart-val {
      z-index: 2;
    }
  }
</style>
