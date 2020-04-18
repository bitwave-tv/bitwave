<template>
  <div>
    <!-- Replay Grid -->
    <transition-group
      tag="div"
      class="row flex-wrap"
      name="fade-transition"
    >
      <!-- Replay Cards -->
      <v-col
        v-for="replay in replays"
        :key="replay.id"
        :cols="cols"
        :sm="sm"
        :md="md"
        :lg="lg"
        :xl="xl"
      >
        <replay-card
          :key="replay.id"
          :id="replay.id"
          :link="replay.link"
          :duration="replay.duration"
          :thumbnails="replay.thumbnails"
          :thumbnail="getThumbnail( replay.thumbnails )"
          :nsfw="replay.nsfw"
          :title="replay.title"
          :username="replay.user && replay.user.name || replay.name"
          :comment-count="replay.commentCount"
          :views="replay.views || 0"
          :timestamp="replay.timestamp.toDate()"
          :time-ago="replay.timeAgo"
          :blur="blurNsfw && replay.nsfw"
        />
      </v-col>

      <!-- Skeleton loader -->
      <v-col
        v-if="processing"
        v-for="replayLoader in ( limit / 2 )"
        :key="replayLoader"
        :cols="cols"
        :sm="sm"
        :md="md"
        :lg="lg"
        :xl="xl"
      >
        <v-skeleton-loader type="card" />
      </v-col>
    </transition-group>

    <!-- Load more button -->
    <div class="d-flex justify-space-between mb-5 mt-2">
      <div class="grey--text align-self-end overline">
        {{ replays.length }} Replays Loaded
      </div>
      <v-btn
        color="secondary"
        outlined
        small
        :loading="loadingReplays"
        @click="loadMore"
      >Load More Replays</v-btn>
    </div>

  </div>
</template>

<script>
  import { db } from '@/plugins/firebase';
  import { timeAgo } from '@/assets/js/time-ago';
  import ReplayCard from '@/components/Replay/ReplayCard';


  // Create timecode
  const createTimecode = ( duration ) => {
    const hh = Math.floor( duration / 3600 ).toString().padStart( 2, '0' );
    const mm = Math.floor(( duration % 3600 ) / 60).toString().padStart( 2, '0' );
    const ss = Math.floor( duration % 60 ).toString().padStart( 2, '0' );
    return `${hh}:${mm}:${ss}`;
  };

  // Maps DB result to a common data structure
  const mapReplayDoc = ( doc ) => {
    const data = doc.data();
    const streamer = data.user && data.user.name || data.name;
    return {
      id: doc.id,
      title: data.title,
      nsfw: data.nsfw,
      timestamp: data.timestamp,
      timeAgo: timeAgo( data.timestamp.toDate() ),
      type: data.type,
      deleted: data.deleted,
      loading: false,
      link: `/${streamer}/replay/${doc.id}`,
      duration: createTimecode( data.duration ),
      commentCount: data.commentCount || 0,
      user: data.user,
      thumbnails: data.thumbnails,
      views: data.views,
    };
  };

  export default {
    name: 'ReplayGrid',
    components: { ReplayCard },
    props: {
      limit: { type: Number, default: 10 },
      blurNsfw: { type: Boolean },
      cols: { type: Number, default: 12 },
      sm:   { type: Number, default: 6 },
      md:   { type: Number, default: 4 },
      lg:   { type: Number, default: 3 },
      xl:   { type: Number, default: 2 },
    },

    data() {
      return {
        processing: true,
        loaded: false,
        replays: [],
        loadingReplays: false,
      };
    },

    methods: {
      // Load replays
      async loadReplays () {
        try {
          const results = await db
            .collection( 'archives' )
            .orderBy( 'timestamp', 'desc' )
            .where( 'deleted', '==', false )
            .limit( this.limit )
            .get();

          if ( results.empty ) {
            this.processing = false;
            this.loaded = true;
            this.replays = [];
            return;
          }

          this.processing = false;

          this.replays = results.docs.map( doc => mapReplayDoc( doc ) );

          this.loaded = true;
        } catch ( error ) {
          console.warn( error );
          this.processing = false;
          this.loaded = true;
        }
      },

      // Load more replays
      async loadMore () {
        if ( this.loadingReplays ) return console.log( `Already loading replays!` );
        this.loadingReplays = true;

        // Query and load more replays
        this.processing = true;

        try {
          const replayCount = this.replays.length;
          const offset = this.replays[ replayCount - 1 ].timestamp;

          const replayQuery = await db
            .collection( 'archives' )
            .orderBy( 'timestamp', 'desc' )
            .where( 'deleted', '==', false )
            .startAfter( offset )
            .limit( this.limit )
            .get();

          this.processing = false;

          replayQuery.docs.map( doc => {
            this.replays.push( mapReplayDoc( doc ) );
          });

          this.loadingReplays = false;

          this.$analytics.logEvent( 'load_more_replays' );
          this.$ga.event({
            eventCategory : 'replay',
            eventAction   : 'load more replays',
          });
        } catch ( error ) {
          console.warn( error );
          this.processing = false;
        }
      },

      // Get random replay thumbnail if available
      getThumbnail ( thumbnails ) {
        if ( !thumbnails || !thumbnails.length ) return 'https://cdn.bitwave.tv/static/img/Bitwave_Banner.jpg';
        return thumbnails[ Math.floor( Math.random() * thumbnails.length ) ];
      },

    },

    computed: {},

    async mounted() {
      await this.loadReplays();
    },
  };
</script>
