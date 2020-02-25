<template>
  <v-container fluid px-0>
    <transition-group
      tag="div"
      class="row flex-wrap"
      name="fade-transition"
    >
      <!-- Loading placeholder -->
      <v-col v-if="loading">
        <v-card>
          <v-card-text>
            <v-row align-center>
              <v-col shrink>
                <v-progress-circular
                  indeterminate
                  color="yellow"
                />
              </v-col>
              <v-flex>Loading...</v-flex>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Cards -->
      <v-col
        v-if="!loading"
        v-for="stream in streamerList"
        :key="stream.name"
        cols="12"
        sm="6"
        md="6"
        lg="4"
        xl="3"
      >
        <stream-card
          :to="stream.name"
          :image="stream.thumbnail"
          :nsfw="stream.nsfw"
          :title="stream.title"
          :name="stream.name"
          :viewers="stream.viewCount"
          live
        />
      </v-col>
    </transition-group>
  </v-container>
</template>

<script>
  import StreamCard from '@/components/StreamCard';
  import { db } from '@/plugins/firebase';
  import { mapGetters } from 'vuex';
  import { VStore } from '@/store';

  export default {
    name: 'StreamGrid',

    props: {
      streamers: {},
    },

    components: {
      StreamCard,
    },

    data () {
      return {
        streamDataListener: null,
        thumbnailInterval: null,
        streams: [],
        thumbnails: [],
        loading: true,
        imageIndex: 0,
      }
    },

    methods: {
      getData () {
        const streamRef = db
          .collection( 'streams' )
          .where( 'live', '==', true )
          .limit( 16 );
        this.streamDataListener = streamRef.onSnapshot( async res => await this.dataChanged( res.docs ), error => console.warn( error ) );
      },

      async dataChanged( docs ) {
        this.streams = docs.map( doc => {
          const stream = doc.data();
          const thumbnail = ( stream.live ? stream.thumbnail : stream.cover ) || stream.cover;
          return {
            title     : stream.title,
            live      : stream.live,
            nsfw      : stream.nsfw,
            owner     : stream.owner,
            thumbnail : thumbnail,
            name      : stream.user.name,
          }
        });
        this.thumbnails = this.streams.map( stream => stream.thumbnail );
        this.loading = false;
      },

      updateThumbnails () {
        if ( this.imageIndex < this.streams.length ) this.imageIndex++;
        if ( this.imageIndex === this.streams.length ) this.imageIndex = 0;

        const coeff = 1000 * 60; // ms * sec
        const timestamp = Math.round( Date.now() / coeff ) * coeff;

        const _thumbnail = this.thumbnails[this.imageIndex] || 'https://cdn.bitwave.tv/static/img/Bitwave_Banner.jpg';

        this.streams[this.imageIndex].thumbnail = `${_thumbnail}?${timestamp}`;
      },
    },

    computed: {
      ...mapGetters({
        getChannelViews: VStore.$getters.getChannelViews,
      }),

      streamerList () {
        const streams = this.streams.map( stream => {
          return { ...stream, viewCount: this.getChannelViews( stream.name ) || 0 };
        });
        return streams.sort( (a, b) => b.viewCount - a.viewCount );
      },
    },

    created () {
      this.loading = !this.streamers;
      this.streams = this.streamers;
    },

    mounted () {
      // Wait 30 seconds before attaching DB listener
      setTimeout( () => this.getData(), 30 * 1000 );
      this.thumbnailInterval = setInterval( () => this.updateThumbnails(), 10 * 1000 );
    },

    beforeDestroy() {
      if ( this.streamDataListener ) this.streamDataListener();
      if ( this.thumbnailInterval ) clearInterval( this.thumbnailInterval );
    },
  }
</script>
