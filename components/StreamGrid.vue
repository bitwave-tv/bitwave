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
        :key="stream.owner"
        xs12
        md4
        xl3
      >
          <v-card>
            <n-link :to="stream.user">
              <v-img :src="stream.thumbnail" :aspect-ratio="16/9" :class="{ 'blur': stream.nsfw }"/>
            </n-link>
            <v-flex>
              <n-link :to="stream.user">
                <div class="body-2 font-weight-bold text-truncate text-no-wrap mb-0" style="color: #ffeb3b;">{{ stream.title }}</div>
              </n-link>
              <div class="body-1">{{ stream.user }}</div>
            </v-flex>
          </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
  import { db } from '@/plugins/firebase';

  export default {
    name: 'StreamGrid',

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
            user      : stream.user.name,
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
