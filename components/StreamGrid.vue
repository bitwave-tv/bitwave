<template>
  <v-container
    fluid
    grid-list-lg
    text-xs-center
    px-0
  >
    <v-layout row wrap>
      <v-flex
        v-for="stream in streams"
        :key="stream.owner"
        xs3
      >
        <n-link :to="stream.user">
          <v-card>
            <v-img :src="stream.thumbnail" aspect-ratio="1.777"/>
            <v-card-title>{{ stream.title }}</v-card-title>
          </v-card>
        </n-link>
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
      }
    },

    methods: {
      getData () {
        const streamRef = db.collection('streams').where('live', '==', true).limit(16);
        this.streamDataListener = streamRef.onSnapshot( async res => await this.dataChanged( res.docs ), error => console.warn(error) );
      },

      async dataChanged( docs ) {
        this.streams = docs.map( doc => {
          const stream = doc.data();
          const thumbnail = (stream.live ? stream.thumbnail || stream.cover : stream.cover) || stream.cover;
          return {
            title: stream.title,
            live: stream.live,
            nsfw: stream.nsfw,
            owner: stream.owner,
            thumbnail: thumbnail,
            user: stream.user.name,
          }
        });
      },
    },

    computed: {},

    mounted () {
      this.getData();
    },
  }
</script>
