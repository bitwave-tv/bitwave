<template>
    <div class="px-3 mb-4 mt-3">
      <div class="d-flex flex-shrink-0 align-center flex-wrap mb-5 mt-0 ml-5">
        <div class="d-inline-block subtitle">
          Replays will be available for up to <strong class="title">7</strong> days.
          <div class="overline grey--text">unless we start to run out of server space</div>
        </div>
        <v-spacer/>
      </div>

      <v-card>
        <v-data-table
          light
          :headers="smartHeader"
          :items="archives"
          :loading="processing && !loaded"
          loading-text="Loading... Please wait"
          :footer-props="footerProps"
          :page.sync="page"
          @pagination="onPaginate"
        >
          <!-- Progress Bar -->
          <template v-slot:progress>
            <v-progress-linear
              color="blue"
              indeterminate
            />
          </template>

          <!-- Action Buttons header -->
          <template v-slot:header.action="{ header }">
            <div class="text-center">{{ header.text }}</div>
          </template>

          <!-- Download Link -->
          <template v-slot:item.url="{ item }">
            <v-btn
              :href="item.url"
              target="_blank"
              class="text-truncate text-none font-weight-regular px-0"
              text
              small
              color="blue"
              :style="{ textDecoration: item.deleted ? 'line-through' : 'none' }"
              :disabled="item.deleted"
            >
              {{ item.url }}
            </v-btn>
          </template>

          <!-- Edit Stream Title -->
          <template v-slot:item.title="{ item }">
            <v-edit-dialog
              :return-value.sync="item.title"
              @save="saveArchiveEdit( item )"
              @cancel="cancelArchiveEdit"
            >
              {{ item.title }}
              <template v-slot:input>
                <v-text-field
                  v-model="item.title"
                  label="Edit Stream Title"
                  single-line
                  counter
                />
              </template>
            </v-edit-dialog>
          </template>

          <!-- Action Items -->
          <template v-slot:item.action="{ item }">

            <!--<v-tooltip
              open-delay="1000"
              left
              transition="slide-x-reverse-transition"
            >
              <template v-slot:activator="{ on }">
                <v-btn
                  v-on="on"
                  class="mr-3"
                  icon
                  color="grey"
                  dark
                  :loading="item.updating"
                  :disabled="item.deleted"
                  @click="editArchive( item )"
                >
                  <v-icon>edit</v-icon>
                </v-btn>
              </template>
              <span>Edit Archive</span>
            </v-tooltip>-->

            <v-tooltip
              open-delay="1000"
              left
              transition="slide-x-transition"
            >
              <template v-slot:activator="{ on }">
                <v-btn
                  v-on="on"
                  class="mr-3"
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

          <template v-slot:body.append>
            <v-switch
              v-model="showDeletedArchives"
              label="Show Deleted Archives"
              class="pa-3 mt-0"
              hide-details
              dense
              inset
              color="blue"
              @change="toggleShowDeletedArchives"
            />
          </template>

        </v-data-table>
      </v-card>

      <div class="mt-4">
        <div class="grey--text caption">
          <strong>Warning:</strong>
          Once an archive has been deleted, it <em>cannot</em> be recovered.
          All data is immediately removed.
          <br>
          No efforts will be made to recover lost streams due to incompetence.
        </div>
      </div>

      <!-- Delete Confirmation Dialog -->
      <v-dialog
        v-model="showConfirmDelete"
        width="320"
        @click:outside="confirm( false )"
      >
        <v-card>
          <v-sheet
            color="yellow"
            class="pa-2 d-flex justify-space-between align-center"
          >
            <h4 class="black--text body-1 font-weight-bold">
              Are you sure?
            </h4>
            <v-icon color="black">warning</v-icon>
          </v-sheet>

          <v-card-title class="subtitle-1">
            <div>
              This cannot be undone.
            </div>
          </v-card-title>

          <v-card-text class="pb-0">
            <div>
              Are you sure you want to delete this archive?
            </div>
          </v-card-text>

          <v-card-actions class="justify-end pa-3">
            <v-btn
              class="mr-2"
              color="yellow"
              outlined
              small
              @click="confirm( false )"
            >
              Cancel
            </v-btn>
            <v-btn
              color="red"
              small
              @click="confirm( true )"
            >
              Delete
            </v-btn>
          </v-card-actions>

        </v-card>
      </v-dialog>

    </div>
</template>

<script>
  import { mapGetters } from 'vuex';
  import { VStore } from '@/store';

  import { auth, db } from '@/plugins/firebase.js';
  import { timeAgo } from '@/assets/js/time-ago';


  export default {
    name: 'StreamArchives',

    props: {
      streamer: { type: String },
    },

    data() {
      return {
        processing: true,
        loaded: false,
        error: false,
        errorType: 'info',
        errorColor: 'blue',
        errorMessage: 'Loading data...',

        page: 0,
        pagination: null,

        archives: [],
        showDeletedArchives: false,

        footerProps: {
          itemsPerPageOptions: [ 2, 5, 10 ],
        },

        showConfirmDelete: false,
        confirmDelete: null,

        // Data table setup
        headers: [
          {
            text: 'Stream Title',
            align: 'left',
            sortable: true,
            value: 'title',
          },
          {
            text: 'Streamed',
            align: 'right',
            sortable: true,
            value: 'timeAgo',
          },
          {
            text: 'Download Link',
            align: 'right',
            sortable: false,
            value: 'url',
          },
        ],

      };
    },

    methods: {
      async onPaginate ( { page, pageCount } ) {
        console.log( `Page ${page}/${pageCount}` );
        if ( page === pageCount ) await this.paginate();
      },

      async paginate () {
        const offset = this.archives[ this.archives.length - 1 ].timestamp;

        const archiveRef = db
          .collection( 'archives' )
          .orderBy( 'timestamp', 'desc' )
          .where( '_username', '==', this.streamer.toLowerCase() )
          .startAfter( offset )
          .limit( 20 );

        try {
          const results = await (
            this.showDeletedArchives
              ? archiveRef
              : archiveRef.where( 'deleted', '==', false )
          ).get();

          const newData = results.docs.map( doc => {
            const data = doc.data();
            return {
              id: doc.id,
              ref: doc.ref,
              title: data.title,
              nsfw: data.nsfw,
              timestamp: data.timestamp,
              timeAgo: timeAgo( data.timestamp.toDate() ),
              url: `https://${ data.server }/rec${ data.url }`,
              type: data.type,
              deleted: data.deleted,
              loading: false,
            }
          });

          this.archives = [ ...this.archives, ...newData ];

        } catch ( error ) {
          console.log( error );
        }

      },

      async loadArchives () {
        const archiveRef = db
          .collection( 'archives' )
          .orderBy( 'timestamp', 'desc' )
          .where( '_username', '==', this.streamer.toLowerCase() )
          .limit( 20 );

        try {
          const results = await (
            this.showDeletedArchives
              ? archiveRef
              : archiveRef.where( 'deleted', '==', false )
          ).get();

          if ( results.empty ) {
            this.processing = false;
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
              id: doc.id,
              ref: doc.ref,
              title: data.title,
              nsfw: data.nsfw,
              timestamp: data.timestamp,
              timeAgo: timeAgo( data.timestamp.toDate() ),
              url: `https://${data.server}/rec${data.url}`,
              type: data.type,
              deleted: data.deleted,
              loading: false,
            }
          });
          this.processing = false;
          this.loaded = true;
          this.error = false;
        } catch ( error ) {
          console.log( error );
          this.processing = false;
          this.loaded = true;
          this.error = true;
          this.errorMessage = 'Failed to load database data!';
          this.errorType = 'error';
          this.errorColor = 'red';
        }
      },

      async deleteArchive ( archive ) {
        if ( this.processing ) return;
        
        this.processing = true;
        archive.loading = true;
        this.showConfirmDelete = true;

        // Wait for user confirmation
        const confirmedDelete = await new Promise( resolve => this.confirmDelete = resolve );

        // User canceled delete
        if ( !confirmedDelete ) {
          console.log( `User canceled delete` );
          setTimeout(() => {
            this.processing = false;
            archive.loading = false;
          }, 500 );
          return;
        }

        const endpoint = `https://api.bitwave.tv/v1/archives/${archive.id}`;
        const options = {
          data: {
            user: this.username,
          },
        };

        try {
          const { data } = await this.$axios.delete( endpoint, options );

          if ( data.success ) this.$toast.success( data.message, { duration: 2500, icon: 'done', position: 'bottom-center' } );
          else this.$toast.error( data.message, { duration: 2500, icon: 'error', position: 'bottom-center' } );

          await this.loadArchives(); // Refresh archive list

          this.processing = false;
          archive.loading = false;

        } catch ( error ) {
          console.log( error );
          this.$toast.error( error.message, { duration: 2500, icon: 'error', position: 'bottom-center' } );

          setTimeout(() => {
            this.processing = false;
            archive.loading = false;
          }, 1000 );
        }
      },

      confirm ( confirm ) {
        this.showConfirmDelete = false; // Close dialog
        this.confirmDelete( confirm );  // Resolve promise
      },

      async saveArchiveEdit ( archive ) {
        const saveToast = this.$toast.success( `Saving title...`, { icon: 'done', position: 'bottom-center' } );
        await archive.ref.update({ title: archive.title });
        console.log( saveToast );
        saveToast.text('Title updated');
        saveToast.goAway(1000);
      },

      cancelArchiveEdit () {
        this.$toast.error( `Cancel edit`, { duration: 2500, icon: 'done', position: 'bottom-center' } );
      },

      async toggleShowDeletedArchives () {
        this.page = 1;
        this.$nextTick( async () => {
          this.processing = true;
          await this.loadArchives();
          this.processing = false;
        });
      },

      async updateToken () {
        const token = await auth.currentUser.getIdToken( true );
        this.$axios.setToken( token, 'Bearer' );
      },

    },

    computed: {
      ...mapGetters({
        username: VStore.$getters.getUsername,
        uid: VStore.$getters.getUID,
      }),

      smartHeader () {
        if ( this.channelOwner ) {
          return [ ...this.headers, { width: '0', value: 'action', sortable: false, align: 'center' } ];
        } else {
          return this.headers;
        }
      },

      channelOwner () {
        if ( !this.username ) return false;
        return this.streamer.toLowerCase() === this.username.toLowerCase();
      },
    },

    async mounted () {
      console.log( 'StreamArchives loading...' );
      setTimeout( async () => await this.loadArchives(), 2500 );
      await this.updateToken();
    },
  };
</script>
