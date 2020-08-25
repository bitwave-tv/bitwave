<template>
  <v-card>
    <v-card-title>Trending Replays</v-card-title>
    <v-card-text>This only exists to trigger the algorithm of trending replays.</v-card-text>
    <v-card-actions>
      <v-btn
        color="primary"
        light
        :loading="updating"
        @click="updateTrending"
      >
        Update Replays
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
  import { mapGetters } from 'vuex';
  import { VStore } from '@/store';

  export default {
    name: 'UpdateTrending',

    data () {
      return {
        updating: false,
      };
    },

    methods: {
      async updateTrending () {
        this.updating = true;

        const endpoint = `https://api.bitwave.tv/v1/replays/update-trending`;
        const payload = {
          user: this.username,
        };

        try {
          const { data } = await this.$axios.post(
            endpoint,
            payload,
          );
          this.$toast.success( `Trending Replays Updated`, { icon: 'done', duration: 5000, position: 'top-center' } );
          console.log( data );
        } catch ( error ) {
          this.$toast.error( `Error: ${error.message}` );
        }
        this.updating = false;
      },
    },

    computed: {
      ...mapGetters( {
        username: VStore.$getters.getUsername,
      }),
    },
  };
</script>
