<template>
  <div>
    <v-container>
      <v-row>
        <v-col>
          <v-toolbar>
            <v-autocomplete
              v-model="model"
              label="Search streamers..."
              no-data-text="No streamers found"
              prepend-icon="search"
              hide-details
              single-line
              :items="streamerNames"
              :search-input.sync="search"
              @update:search-input="filterStreamers"
              clearable
              return-object
            >
              <template v-slot:item="data">
                <v-list-item-avatar>
                  <img :src="data.item.avatar" :alt="data.item.name">
                </v-list-item-avatar>
                <v-list-item-title>
                  {{ data.item.text }}
                </v-list-item-title>
              </template>
            </v-autocomplete>
          </v-toolbar>
        </v-col>
      </v-row>

      <v-row>
        <template v-for="streamer in filteredStreamers">
          <v-col
            lg="2"
            md="4"
            sm="6"
            cols="12"
          >
            <v-lazy
              min-height="150px"
              :key="streamer.name"
              :options="{ threshold: 0.9 }"
            >
              <stream-card
                :to="streamer.to.toString()"
                :image="`${streamer.live ? streamer.thumbnail : streamer.avatar}`"
                :live="streamer.live"
                :nsfw="streamer.nsfw"
                :title="streamer.title"
                :name="streamer.name"
              />
            </v-lazy>
          </v-col>
        </template>
      </v-row>
    </v-container>
  </div>
</template>

<script>
  import StreamCard from '@/components/StreamCard';

  export default {
    name: 'streamers',

    scrollToTop: true,

    components: {
      StreamCard,
    },

    async asyncData ({ $axios }) {
      try {
        let { data } = await $axios.get( 'https://api.bitwave.tv/api/channels/list' );

        return {
          streamers: data.users,
          filteredStreamers: data.users,
        }
      } catch ( error ) {
        console.log( `ERROR: Failed to hydrate page:\n`, error );
      }
    },

    data () {
      return {
        model: null,
        search: '',
        streamers: [],
        filteredStreamers: [],
      }
    },

    methods: {
      filterStreamers () {
        if ( this.model && this.search ) {
          this.filteredStreamers = this.streamers.filter( s => {
            return s.name.toLowerCase().indexOf( this.search.toLowerCase() ) > -1;
          });
        } else {
          this.filteredStreamers = this.streamers;
        }
      },
    },

    computed: {
      streamerNames () {
        return this.streamers.map( s => {
          return {
            text   : s.name,
            value  : s.name,
            avatar : s.avatar,
          }
        });
      },

      results () {
        if ( this.model ) {
          this.filteredStreamers = [ this.model ];
        } else {
          this.filteredStreamers = this.streamers;
        }
      },
    },
  }
</script>
