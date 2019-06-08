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

<style lang="scss">
  .blur {
    filter: blur(8px);
    -webkit-filter: blur(8px);
  }
</style>
