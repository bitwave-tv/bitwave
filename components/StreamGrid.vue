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
        v-for="stream in streams"
        :key="stream.name"
        cols="12"
        md="6"
        lg="4"
        xl="3"
      >
        <stream-card
          :to="stream.name"
          :image="stream.thumbnail"
          live
          :nsfw="stream.nsfw"
          :title="stream.title"
          :name="stream.name"
        ></stream-card>
      </v-col>
    </transition-group>
  </v-container>
</template>

<script>
  import StreamCard from '@/components/StreamCard';
  import { db } from '@/plugins/firebase';

  export default {
    name: 'StreamGrid',

    props: {
      streamers: {},
    },

    components: {
      StreamCard,
    },

    data() {
      return {
        streamDataListener: null,
        streams: [],
        thumbnailInterval: null,
        loading: true,
      }
    },

    methods: {
      getData () {
        const streamRef = db.collection( 'streams' ).where( 'live', '==', true ).limit( 16 );
        this.streamDataListener = streamRef.onSnapshot( async res => await this.dataChanged( res.docs ), error => console.warn( error ) );
      },

      async dataChanged( docs ) {
        this.streams = docs.map( doc => {
          const stream = doc.data();
          const thumbnail = ( stream.live ? stream.thumbnail || stream.cover : stream.cover ) || stream.cover;
          return {
            title     : stream.title,
            live      : stream.live,
            nsfw      : stream.nsfw,
            owner     : stream.owner,
            thumbnail : thumbnail,
            name      : stream.user.name,
          }
        });
        this.loading = false;
      },

      updateThumbnails () {
        this.streams.forEach( stream => {
          stream.thumbnail = `${stream.thumbnail}?${Date.now()}`
        });
      },
    },

    computed: {},

    created () {
      this.loading = !this.streamers;
      this.streams = this.streamers;
    },

    mounted () {
      this.getData();
      this.thumbnailInterval = setInterval( () => this.updateThumbnails(), 60 * 1000 );
    },

    beforeDestroy() {
      if ( this.streamDataListener ) this.streamDataListener();
    },
  }
</script>
