<template>
    <div class="px-3 mb-4 mt-3">

      <!-- Banner Message -->
      <div class="d-flex flex-shrink-0 align-center flex-wrap mt-0 ml-5">
        <div class="d-inline-block subtitle">
          Replays will be available for up to <strong class="title">7</strong> days.
          <div class="overline grey--text">unless we start to run out of server space</div>
        </div>
        <v-spacer/>
      </div>

      <!-- Stream Replay Cards-->
      <div>
        <transition-group
          tag="div"
          class="row flex-wrap"
          name="fade-transition"
        >
          <v-col
            v-for="replay in replayCards"
            :key="replay.id"
            cols="12"
            sm="6"
            md="6"
            lg="4"
            xl="3"
          >
            <replay-card
              :id="replay.id"
              :link="replay.link"
              :duration="replay.duration"
              :thumbnails="replay.thumbnails"
              :nsfw="replay.nsfw"
              :title="replay.title"
              :username="replay.user && replay.user.name || streamer"
              :comment-count="replay.commentCount"
              :views="replay.views || 0"
              :timestamp="replay.timestamp.toDate()"
              :time-ago="replay.timeAgo"
            />
          </v-col>
        </transition-group>
      </div>

      <!-- Stream Replays Data Table -->
      <div class="mt-5">
        <div class="title ml-5 mb-3">Replay List</div>
        <v-card>
          <v-data-table
            light
            :headers="smartHeader"
            :items="archives"
            :loading="processing && !loaded"
            loading-text="Loading... Please wait"
            no-data-text="No replays found"
            :footer-props="footerProps"
            :page.sync="page"
            @pagination="onPaginate"
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

            <!-- Action Buttons header -->
            <template v-slot:header.action="{ header }">
              <div class="text-center">{{ header.text }}</div>
            </template>

            <!-- Stream Date -->
            <template v-slot:item.timeAgo="{ item }">
              <div class="overline text-no-wrap">{{ item.timeAgo }}</div>
            </template>

            <!-- Replay Link -->
            <template v-slot:item.url="{ item }">
              <v-btn
                :to="item.link"
                class="text-truncate text-none font-weight-regular my-1"
                text
                tile
                small
                color="blue"
                :style="{ textDecoration: item.deleted ? 'line-through' : 'none' }"
                :disabled="item.deleted"
              >
                {{ item.id }}
              </v-btn>
            </template>

            <!-- Edit Stream Title -->
            <template
              v-if="channelOwner"
              v-slot:item.title="{ item }"
            >
              <v-edit-dialog
                :return-value.sync="item.title"
                @save="saveArchiveEdit( item )"
                @cancel="cancelArchiveEdit"
              >
                <span class="overline">[{{ item.duration }}]</span>
                <span class="">{{ item.title }}</span>
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

            <!-- Stream Title -->
            <template
              v-if="!channelOwner"
              v-slot:item.title="{ item }"
            >
              <div>
                <span class="overline">[{{ item.duration }}]</span>
                <span class="">{{ item.title }}</span>
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
                <span>Delete Replay</span>
              </v-tooltip>
            </template>

            <!-- Switch Visibility of Deleted Replays -->
            <template v-slot:body.append>
              <v-switch
                v-model="showDeletedArchives"
                label="Show Deleted Replays"
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
      </div>


      <div class="mt-4">
        <div class="grey--text caption">
          <strong>Warning:</strong>
          Once a replay has been deleted, it <em>cannot</em> be recovered.
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
            color="primary"
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
              Are you sure you want to delete this replay?
            </div>
          </v-card-text>

          <v-card-actions class="justify-end pa-3">
            <v-btn
              class="mr-2"
              color="primary"
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
  import ReplayCard from '@/components/Replay/ReplayCard';


  export default {
    name: 'StreamArchives',

    components: {
      ReplayCard
    },

    props: {
      streamer: { type: String },
    },

    data() {
      return {
        processing: true,
        loaded: false,

        page: 0,
        pagination: null,

        archives: [],
        showDeletedArchives: false,

        footerProps: {
          itemsPerPageOptions: [ 5, 10 ],
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
            width: '100%',
          },
          {
            text: 'Streamed',
            align: 'right',
            sortable: true,
            value: 'timeAgo',
            // width: '100%',
          },
          {
            text: 'Replay Link',
            align: 'center',
            sortable: false,
            value: 'url',
            width: '1%',
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
        this.processing = true;
        this.loaded     = false;

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
              duration: this.createTimecode( data.duration ),
            }
          });

          this.archives = [ ...this.archives, ...newData ];

        } catch ( error ) {
          console.log( error );
        }

        setTimeout(() => {
          this.processing = false;
          this.loaded     = true;
        }, 2000 );
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
            this.archives = [];
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
              link: `/${this.streamer}/replay/${doc.id}`,
              duration: this.createTimecode( data.duration ),
              commentCount: data.commentCount || 0,
              user: data.user,
              thumbnails: data.thumbnails,
            }
          });
          this.processing = false;
          this.loaded = true;
        } catch ( error ) {
          console.log( error );
          this.processing = false;
          this.loaded = true;
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

          // Remove archive from UI
          if ( this.showDeletedArchives ) {
            archive.deleted = true;
          } else {
            this.archives = this.archives.filter( a => a.id !== archive.id );
            // Refresh archive list
            if ( this.archives.length <= 10 ) await this.loadArchives();
          }

          // await this.loadArchives(); // Refresh archive list

          this.processing = false;
          archive.loading = false;

          this.$ga.event({
            eventCategory : 'archives',
            eventAction   : 'delete',
          });

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
        let saveToast = this.$toast.success( `Saving title...`, { icon: 'done', position: 'bottom-center' } );
        await archive.ref.update({ title: archive.title });
        saveToast.goAway( 1000 );
        saveToast = this.$toast.success( `Archive updated`, { duration: 2500, icon: 'done', position: 'bottom-center' } );
        try {
          this.$ga.event({
            eventCategory : 'archives',
            eventAction   : 'renamee',
          });
        } catch ( error ) {
          console.log( error );
        }
      },

      cancelArchiveEdit () {
        this.$toast.error( `Cancel edit`, { duration: 2500, icon: 'done', position: 'bottom-center' } );
      },

      async toggleShowDeletedArchives () {
        this.page = 1;
        this.$nextTick( async () => {
          this.processing = true;
          this.loaded     = false;
          await this.loadArchives();
          this.processing = false;
          this.loaded     = true;
          try {
            this.$ga.event({
              eventCategory : 'archives',
              eventAction   : this.showDeletedArchives ? 'show deleted' : 'hide deleted',
            });
          } catch ( error ) {
            console.log( error );
          }
        });
      },

      async updateToken () {
        if ( !auth.currentUser ) return;
        const token = await auth.currentUser.getIdToken( true );
        this.$axios.setToken( token, 'Bearer' );
      },

      createTimecode ( duration ) {
        // Create timecode
        const hh = Math.floor( duration / 3600 ).toString().padStart( 2, '0' );
        const mm = Math.floor(( duration % 3600 ) / 60).toString().padStart( 2, '0' );
        const ss = Math.floor( duration % 60 ).toString().padStart( 2, '0' );
        return `${hh}:${mm}:${ss}`;
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

      replayCards () {
        return this.archives
          .filter( a => !a.deleted )
          .slice( 0, 10 );
      },
    },

    async mounted () {
      console.log( 'StreamArchives loading...' );
      this.showDeletedArchives = this.channelOwner;
      await this.updateToken();
      setTimeout( async () => await this.loadArchives(), 500 );
      try {
        this.$ga.event({
          eventCategory : 'archives',
          eventAction   : 'view',
        });
      } catch ( error ) {
        console.log( error );
      }
    },
  };
</script>
