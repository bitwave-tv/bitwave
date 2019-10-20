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
        <v-col
          v-for="streamer in filteredStreamers"
          :key="streamer.name"
          cols="1"
          md="2"
          sm="6"
          xs="12"
        >
          <v-card
            :to="streamer.to.toString()"
          >
            <v-img :src="`${streamer.live ? streamer.thumbnail : streamer.avatar}`" :aspect-ratio="16/9" :class="{ 'blur': (streamer.live && streamer.nsfw) }"/>
            <v-card-text class="pa-2">
              <div class="body-2 font-weight-bold text-truncate text-no-wrap mb-0" style="color: #ffeb3b;">
                {{ streamer.title }}
              </div>
              <div class="body-1">
                {{ streamer.name }}
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
  export default {
    name: 'streamers',

    async asyncData ({ $axios }) {
      let { data } = await $axios.get( 'https://api.bitwave.tv/api/channels/list' );

      return {
        streamers: data.users,
        filteredStreamers: data.users,
      }
    },

    data() {
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
            text: s.name,
            value: s.name,
            avatar: s.avatar,
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

<style lang="scss">
  .blur > div {
    filter: blur(15px);
    -webkit-filter: blur(15px);
  }
</style>
