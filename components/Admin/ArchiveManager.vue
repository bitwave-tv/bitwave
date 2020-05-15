<template>
  <v-card>
    <v-data-table
      light
      :headers="headers"
      :items="archives"
      :loading="processing || loading"
      :search="search"
      loading-text="Loading... Please wait"
      no-data-text="No archives found"
      dense
    >

      <!-- Progress Bar -->
      <template v-slot:progress>
        <v-expand-transition>
          <v-progress-linear
            color="blue"
            indeterminate
          />
        </v-expand-transition>
      </template>

      <!-- Archive Top Bar -->
      <template v-slot:top>
        <div class="d-flex flex-wrap align-start pa-2">
          <div>
            <div class="title">Stream Archive Manager</div>
            <img
              src="https://netdata.stream.bitwave.tv/api/v1/badge.svg?chart=disk_space._mnt_bitwave_archives&alarm=disk_space_usage&refresh=auto"
              alt="Remaining archive storage space"
            >
          </div>
          <v-spacer/>
          <v-text-field
            v-model="search"
            color="blue"
            append-icon="search"
            label="Search"
            single-line
            hide-details
          >
            <template v-slot:append-outer>
              <v-btn
                class="black--text"
                color="blue"
                outlined
                small
                @click="getArchives"
              >
                Refresh
              </v-btn>
            </template>
          </v-text-field>
        </div>
      </template>

      <!-- Action Items -->
      <template v-slot:item.action="{ item }">
        <v-tooltip
          open-delay="1000"
          left
          transition="slide-x-transition"
        >
          <template v-slot:activator="{ on }">
            <v-btn
              v-on="on"
              icon
              color="red"
              :loading="item.loading"
              :disabled="item.deleted"
              @click="deleteArchive( item )"
            >
              <v-icon>delete</v-icon>
            </v-btn>
          </template>
          <span>Delete Archive</span>
        </v-tooltip>
      </template>
    </v-data-table>
  </v-card>
</template>

<script>
  import { auth } from '@/plugins/firebase';
  import { mapGetters } from 'vuex';
  import { VStore } from '@/store';

  export default {
    name: 'ArchiveManager',

    data () {
      return {
        loading: true,
        processing: false,

        search: '',

        headers: [
          {
            text: 'Title',
            align: 'left',
            sortable: true,
            value: 'title',
          },
          {
            text: 'Streamer',
            align: 'right',
            sortable: true,
            value: 'name',
          },
          {
            text: 'Date',
            width: 150,
            align: 'right',
            sortable: true,
            value: 'timeAgo',
          },
          {
            text: 'Delete',
            value: 'action',
            sortable: false,
            align: 'center'
          },
        ],

        archives: [],
      };
    },

    methods: {
      async getFreshIdToken () {
        const token = await auth.currentUser.getIdToken( true );
        this.$axios.setToken( token, 'Bearer' );
      },

      async getArchives () {
        this.loading = true;
        const { data } = await this.$axios.get('https://api.bitwave.tv/v1/archives/old');

        this.archives = data.data
          .map( archive => ({ ...archive.data, timeAgo: archive.timeAgo, id: archive.id }) )
          .reverse();

        this.loading = false;
      },

      async deleteArchive ( archive ) {
        const endpoint = `https://api.bitwave.tv/v1/replays/${archive.id}`;
        const options = { data: { user: this.username } };

        try {
          const { data } = await this.$axios.delete( endpoint, options );
          if ( data.success ) this.$toast.success( data.message, { duration: 2500, icon: 'done', position: 'bottom-center' } );
          else this.$toast.success( data.message, { duration: 2500, icon: 'error', position: 'bottom-center' } );
          this.archives = this.archives.filter( a => a.id !== archive.id );
        } catch ( error ) {
          await this.getFreshIdToken();
          console.log( error );
          this.$toast.error( error.message, { duration: 2500, icon: 'error', position: 'bottom-center' } );
        }
      },
    },

    computed: {
      ...mapGetters( {
        username: VStore.$getters.getUsername,
      }),
    },

    async mounted () {
      await this.getArchives();
    },

  };
</script>
