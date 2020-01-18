<template>
  <div class="chart-data">

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

    <div class="mb-3">
      <div class="chart-val grey--text text-weight-thin overline text-center my-2">
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
      <div class="chart-val d-flex justify-space-around white--text text-weight-thin caption text-center ma-2">
        <template
          v-for="( stat, name, index ) in bitrateStats[bitrateStats.length - 1]"
        >
          <div @click="graphData1 = name">
            <span class="grey--text mr-1">{{ name }}</span>
            <span class="body-2">{{ stat }}</span>
          </div>
          <v-divider
            v-if="index < 3"
            color="orange"
            vertical
          />
        </template>
      </div>
    </div>

    <div class="mb-3">
      <div class="chart-val grey--text text-weight-thin overline text-center my-2">
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
      <div class="chart-val d-flex justify-space-around white--text text-weight-thin caption text-center ma-2">
        <template
          v-for="( stat, name, index ) in data[data.length - 1]"
        >
          <div @click="graphData2 = name">
            <span class="grey--text mr-1">{{ name }}</span>
            <span class="body-2">{{ stat }}</span>
          </div>
          <v-divider
            v-if="index !== 5 - 1"
            color="orange"
            vertical
          />
        </template>
      </div>
    </div>

    <div class="mb-3">
      <div class="chart-val grey--text text-weight-thin overline text-center my-2">
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
      <div class="chart-val d-flex justify-space-around white--text text-weight-thin caption text-center ma-2">
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
          />
        </template>
      </div>
    </div>

    <div class="mb-3">
      <div class="chart-val grey--text text-weight-thin overline text-center my-2">
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
      <div class="chart-val d-flex justify-space-around white--text text-weight-thin caption text-center ma-2">
        <template
          v-if="hlsGraphStats.length > 2"
          v-for="( stat, name, index ) in hlsGraphStats[hlsGraphStats.length - 1]"
        >
          <div @click="hlsGraph1 = name">
            <span class="grey--text mr-1">{{ name }}</span>
            <span class="body-2">{{ stat }}</span>
          </div>
          <v-divider
            v-if="index !== Object.keys(hlsGraphStats[hlsGraphStats.length - 1]).length - 1"
            color="orange"
            vertical
          />
        </template>
      </div>
    </div>

  </div>
</template>

<script>
  import socketio from 'socket.io-client';

  const APIServer = 'https://api.bitwave.tv';

  let minBandwidth = null;

  export default {
    name: 'DebugStream',

    props: {
      streamer: { type: String },
    },

    data() {
      return {
        socket: null,

        gradient: [ '#f72047', 'orange', '#ffd200', '#03a9f4', 'blue' ],
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
        this.data[ 0 ].currentKbps = 0;

        this.hlsStats.push( JSON.parse(JSON.stringify($bw.hls.stats)) );
        this.hlsStats = this.hlsStats.splice( -this.maxHistory );

        minBandwidth = minBandwidth === null ? $bw.hls.stats.bandwidth : Math.min($bw.hls.stats.bandwidth, minBandwidth);
      },

      async onStreamerOffline( { live, streamer, server } ) {
        console.log( `${streamer} has gone offline on the ${server} server` );
        this.$toast.error( `${streamer} is now offline`, { icon: 'error', duration: 2000, position: 'top-right' } );
      },

    },

    computed: {
      bitrateStats () {
        return this.data.map( data => {
          return {
            bitrate: ( data.currentKbps / 1024 ).toFixed(1) + 'mb/s',
            fps: data.currentFps,
            totalData: ( data.targetSize / 1024 / 1024 ).toFixed(1) + 'mb',
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
            total: hlsStats.videoPlaybackQuality.totalVideoFrames,
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
            bandwidth: ( hlsStats.bandwidth / 1024 / 1024 ).toFixed(2) + 'mb/s',
            min: ( minBandwidth / 1024 / 1024 ).toFixed(2) + 'mb/s',
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
  .chart-data {
    position: relative;
    pointer-events: none;
    z-index: 2;

    .graph {
      background: rgba(0,0,0,.85);
      position: absolute;
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
