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
                  <img
                    :src="`${data.item.avatar}?_bw`"
                    :alt="data.item.name"
                    crossorigin
                  >
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
          <v-col
            cols="12"
            sm="6"
            md="4"
            lg="2"
            v-for="streamer in filteredStreamers"
            :key="streamer.name"
          >
            <v-lazy
              min-height="150px"
              :options="{ threshold: 0.5 }"
            >
              <stream-card
                :to="streamer.to.toString()"
                :image="`${streamer.live ? streamer.thumbnail : streamer.avatar}`"
                :live="streamer.live"
                :nsfw="streamer.nsfw"
                :title="streamer.title"
                :name="streamer.name"
                :viewers="getChannelViews( streamer.name )"
              />
            </v-lazy>
          </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
  import StreamCard from '@/components/StreamCard';

  import { mapGetters } from 'vuex';
  import { VStore } from '@/store';

  export default {
    name: 'streamers',

    scrollToTop: true,

    components: {
      StreamCard,
    },

    async asyncData ({ $axios }) {
      try {
        let { data } = await $axios.get( 'https://api.bitwave.tv/api/channels/list', { timeout: 5000 } );

        return {
          streamers: data.users,
          filteredStreamers: data.users,
        }
      } catch ( error ) {
        console.log( `ERROR: Failed to hydrate page:\n`, error );
        error( { statusCode: 500, message: 'Server under heavy load.<br>lease try again later.' } );
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
      ...mapGetters({
        getChannelViews: VStore.$getters.getChannelViews,
      }),

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
