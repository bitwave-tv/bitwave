<template>
  <div>
    <div class="gradient-background">
      <!-- Stream Replay Cards-->
      <v-container fluid>

        <!-- Header -->
        <div class="text-center my-2">
          <div class="headline"><v-icon>restore</v-icon> Recent Stream Replays</div>
          <div class="subtitle grey--text">Catch up on recent streams you may have missed!</div>
        </div>


        <!-- Loading placeholder -->
        <div
          v-if="processing"
          class="my-3"
        >
          <div class="d-flex align-center">
            <v-progress-circular
              indeterminate
              color="primary"
              class="mr-3"
            />
            <div class="headline">Loading...</div>
          </div>
        </div>


        <!-- Content -->
        <transition-group
          tag="div"
          class="row flex-wrap"
          name="fade-transition"
        >
          <!-- Replay Cards -->
          <v-col
            v-for="replay in replays"
            :key="replay.id"
            cols="12"
            sm="6"
            md="6"
            lg="4"
            xl="3"
          >
            <replay-card
              :id="replay.id"
              :link="replay.link"
              :duration="replay.duration"
              :thumbnails="replay.thumbnails"
              :nsfw="replay.nsfw"
              :title="replay.title"
              :username="replay.user && replay.user.name || replay.name"
              :comment-count="replay.commentCount"
              :views="replay.views || 0"
              :timestamp="replay.timestamp.toDate()"
              :time-ago="replay.timeAgo"
            />
          </v-col>
        </transition-group>


        <!-- Load more button -->
        <div class="text-center mb-5">
          <v-btn
            color="secondary"
            outlined
            small
            :loading="loadingReplays"
            @click="loadMore"
          >Load More Replays</v-btn>
        </div>
      </v-container>

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
  </div>
</template>

<script>
  import { db } from '@/plugins/firebase';
  import { timeAgo } from '@/assets/js/time-ago';
  import ReplayCard from '@/components/Replay/ReplayCard';

  const title = `Stream Replays - [bitwave.tv]`;
  const description = `Browse the most recent stream replays available.`;
  const image = `https://cdn.bitwave.tv/static/img/Bitwave_Banner.jpg`;

  export default {
    name: 'replays',

    scrollToTop: true,

    head () {
      return {
        title: title,
        link: [
          { rel: 'canonical', href: `https://bitwave.tv/replays` },
        ],
        meta: [
          { name: 'og:title',       hid: 'og:title',       content: title },
          { name: 'og:description', hid: 'og:description', content: description },
          { name: 'og:image',       hid:'og:image',        content: image },
          { name: 'description',    hid: 'description',    content: description },
          { name: 'twitter:card',        content: 'summary_large_image' },
          { name: 'twitter:site',        content: '@BitwaveTV' },
          { name: 'twitter:title',       content: title },
          { name: 'twitter:description', content: description },
          { name: 'twitter:image',       content: image },
        ],
      }
    },

    components: {
      ReplayCard
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
        const replayRef = db
          .collection( 'archives' )
          .orderBy( 'timestamp', 'desc' )
          .where( 'deleted', '==', false )
          .limit( 16 );

        try {
          const results = await replayRef.get();

          if ( results.empty ) {
            this.processing = false;
            this.loaded = true;
            this.replays = [];
            return;
          }

          this.replays = results.docs.map( doc => {
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
              duration: this.createTimecode( data.duration ),
              commentCount: data.commentCount || 0,
              user: data.user,
              thumbnails: data.thumbnails,
            }
          });

          this.processing = false;
          this.loaded = true;
        } catch ( error ) {
          console.log( error );
          this.processing = false;
          this.loaded = true;
        }
      },

      // Load more replays
      async loadMore () {
        console.log( `Loading more replays` );

        if ( this.loadingReplays ) return console.log( `Already loading replays!` );
        this.loadingReplays = true;

        const replayCount = this.replays.length;
        const offset = this.replays[ replayCount - 1 ].timestamp;

        const replayQuery = await db
          .collection( 'archives' )
          .orderBy( 'timestamp', 'desc' )
          .where( 'deleted', '==', false )
          .startAfter( offset )
          .limit( 16 )
          .get();

        replayQuery.docs.map( doc => {
          const data = doc.data();
          const streamer = data.user && data.user.name || data.name;
          this.replays.push({
            id: doc.id,
            title: data.title,
            nsfw: data.nsfw,
            timestamp: data.timestamp,
            timeAgo: timeAgo( data.timestamp.toDate() ),
            type: data.type,
            deleted: data.deleted,
            loading: false,
            link: `/${streamer}/replay/${doc.id}`,
            duration: this.createTimecode( data.duration ),
            commentCount: data.commentCount || 0,
            user: data.user,
            thumbnails: data.thumbnails,
          });
        });

        this.loadingReplays = false;

        this.$analytics.logEvent( 'load_more_replays' );
        this.$ga.event({
          eventCategory : 'replay',
          eventAction   : 'load more replays',
        });
      },

      // Create timecode
      createTimecode ( duration ) {
        const hh = Math.floor( duration / 3600 ).toString().padStart( 2, '0' );
        const mm = Math.floor(( duration % 3600 ) / 60).toString().padStart( 2, '0' );
        const ss = Math.floor( duration % 60 ).toString().padStart( 2, '0' );
        return `${hh}:${mm}:${ss}`;
      },
    },

    computed: {
      version () {
        return `v${process.env.version}`;
      },
    },

    async mounted() {
      await this.loadReplays();
    },
  };
</script>
