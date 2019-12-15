<template>
    <div>
      <div class="subtitle mb-5">
        Replays of streams will appear below if available.
      </div>

      <v-fade-transition>
        <v-alert
          :value="error || !loaded"
          outlined
          :type="errorType"
          prominent
          border="left"
          :color="errorColor"
        >
          {{ errorMessage }}
        </v-alert>
      </v-fade-transition>

      <v-fade-transition>
        <v-simple-table
          light
          v-if="!error && loaded"
          fixed-header
          height="300px"
        >
          <template v-slot:default>
            <thead>
              <tr>
                <th class="text-left">Title</th>
                <th class="text-left">Date</th>
                <th class="text-right">Download Link <v-icon small>open_in_new</v-icon></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="archive in archives" :key="archive.date">
                <td>{{ archive.title }}</td>
                <td class="text-truncate">{{ archive.timeAgo }}</td>
                <td class="text-right">
                  <a :href="archive.url" target="_blank" class="blue--text d-inline-block text-truncate" style="max-width: 300px">{{ archive.url }}</a>
                </td>
              </tr>
            </tbody>
          </template>
        </v-simple-table>
      </v-fade-transition>
    </div>
</template>

<script>
  import { db } from '@/plugins/firebase.js'

  // Epochs
  const epochs = [
    ['year', 31536000],
    ['month', 2592000],
    ['day', 86400],
    ['hour', 3600],
    ['minute', 60],
    ['second', 1]
  ];

  // Get duration
  const getDuration = (timeAgoInSeconds) => {
    for (let [name, seconds] of epochs) {
      const interval = Math.floor(timeAgoInSeconds / seconds);

      if (interval >= 1) {
        return {
          interval: interval,
          epoch: name
        };
      }
    }
  };

  // Calculate
  const timeAgo = (date) => {
    const timeAgoInSeconds = Math.floor((new Date() - new Date(date)) / 1000);
    const {interval, epoch} = getDuration(timeAgoInSeconds);
    const suffix = interval === 1 ? '' : 's';

    return `${interval} ${epoch}${suffix} ago`;
  };

  export default {
    name: 'StreamArchives',

    props: {
      streamer: { type: String },
    },

    data() {
      return {
        loaded: false,
        error: false,
        errorType: 'info',
        errorColor: 'blue',
        errorMessage: 'Loading data...',
        archives: [],
      };
    },

    methods: {
      async loadArchives () {
        const archiveRef = db.collection( 'archives' )
          .where( '_username', '==', this.streamer.toLowerCase() )
          .orderBy( 'date', 'desc' )
          .limit( 25 );

        try {
          const results = await archiveRef.get();

          if ( results.empty ) {
            this.loaded = true;
            this.error = true;
            this.errorMessage = 'No recent archives found.';
            this.errorType = 'warning';
            this.errorColor = 'yellow';
            return;
          }

          this.archives = results.docs.map( doc => {
            const data = doc.data();
            return {
              title: data.title,
              nsfw: data.nsfw,
              date: data.date,
              timeAgo: timeAgo( data.date ),
              url: `https://${data.server}/rec${data.url}`,
              type: data.type,
            }
          });
          this.loaded = true;
          this.error = false;
        } catch ( error ) {
          console.log( error );
          this.loaded = true;
          this.error = true;
          this.errorMessage = 'Failed to load database data!';
          this.errorType = 'error';
          this.errorColor = 'red';
        }
      },
    },

    computed: {},

    async mounted () {
      console.log( 'StreamArchives loading...' );
      await this.loadArchives();
    },
  };
</script>

<style lang='scss'>

</style>
