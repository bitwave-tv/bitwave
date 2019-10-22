<template>
  <v-container
    fluid
    grid-list-lg
    px-0
  >
    <v-layout row wrap>
      <v-flex v-if="loading">
        <v-card>
          <v-card-text>
            <v-layout row align-center>
              <v-flex shrink>
                <v-progress-circular
                  indeterminate
                  color="yellow"
                />
              </v-flex>
              <v-flex>Loading...</v-flex>
            </v-layout>
          </v-card-text>
        </v-card>
      </v-flex>

      <v-flex
        v-else
        v-for="stream in streams"
        :key="stream.name"
        xs12
        md4
        xl3
      >
        <stream-card
          :to="stream.name"
          :image="stream.thumbnail"
          live
          :nsfw="stream.nsfw"
          :title="stream.title"
          :name="stream.name"
        ></stream-card>
      </v-flex>
    </v-layout>
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

<style lang="scss">
  .blur > div {
    filter: blur(15px);
    -webkit-filter: blur(15px);
  }
</style>
