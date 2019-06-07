<template>
  <v-container
    fluid
    grid-list-lg
    px-0
  >
    <v-layout row wrap>
      <v-flex
        v-for="stream in streams"
        :key="stream.owner"
        xs12
        md4
        xl3
      >
        <n-link :to="stream.user">
          <v-card>
            <v-img :src="stream.thumbnail" :aspect-ratio="16/9"/>
            <v-flex>
              <div class="body-2 font-weight-bold mb-0" style="color: #ffeb3b;">{{ stream.title }}</div>
              <div class="body-1">{{ stream.user }}</div>
            </v-flex>
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

    beforeDestroy() {
      if (this.streamDataListener) this.streamDataListener();
    },
  }
</script>
