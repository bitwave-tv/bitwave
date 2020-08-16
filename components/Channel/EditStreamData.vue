<template>
  <div class="text-center">
    <v-tooltip bottom>
      <template v-slot:activator="{ on }">
        <v-btn
          v-on="on"
          class="mr-3"
          small
          outlined
          color="accent"
          @click="editStreamData = true"
        >
          <!--<template v-if="$vuetify.breakpoint.smAndDown"><v-icon small class="ml-1">edit</v-icon></template>-->
          <!--<template v-else>Edit</template>-->
          Edit
        </v-btn>
      </template>
      <span>Edit your channel</span>
    </v-tooltip>

    <v-dialog
      v-model="editStreamData"
      transition="fade-transition"
      :max-width="$vuetify.breakpoint.mdAndDown ? '95%' : '60%'"
      @click:outside="cancel"
      persistent
    >
      <!-- Edit Dialog -->
      <v-card
        color="accentwave"
        :loading="saveLoading || showExitConfirm"
      >
        <!-- Title Bar -->
        <v-sheet
          tile
          color="primary"
          class="pa-2 d-flex justify-space-between align-center black--text"
        >
          <h4 class="body-1">
            Edit Channel
            <v-fade-transition>
              <span v-show="enableSave">(unsaved changes)</span>
            </v-fade-transition>
          </h4>
          <v-btn
            color="black"
            text
            icon
            small
            @click="cancel"
          >
            <v-icon>close</v-icon>
          </v-btn>
        </v-sheet>

        <!-- Content -->
        <div class="py-3">
          <div class="d-flex justify-space-between align-center mb-3  px-3">
            <v-scroll-y-transition mode="out-in">
              <v-switch
                v-if="!previewData"
                v-model="streamData.nsfw"
                class="my-0"
                label="NSFW (Not Safe For Work)"
                color="primary"
                hide-details
                inset
                :loading="saveLoading"
                :disabled="saveLoading"
                @change="enableSave = true"
              >

                <template #label>
                  <div>
                    NSFW <span class="caption">(Not Safe For Work)</span>
                    <v-btn
                      title="More info about NSFW setting"
                      class="ml-2"
                      icon
                      x-small
                      @click.stop="showNSFWNote = !showNSFWNote"
                    >
                      <v-icon>help_outline</v-icon>
                    </v-btn>
                  </div>
                </template>
              </v-switch>
              <div
                v-else
                class="d-flex align-center"
              >
                <v-chip
                  v-show="this.streamData.nsfw"
                  color="red"
                  class="mr-2"
                  small
                  outlined
                >NSFW</v-chip>
                {{ this.streamData.title }}
              </div>
            </v-scroll-y-transition>

            <!-- Edit / Preview Button -->
            <v-btn
              color="accent"
              outlined
              small
              @click="previewData = !previewData"
            >
              {{ previewData ? 'Edit' : 'preview' }}
            </v-btn>
          </div>

          <!-- NSFW note -->
          <v-expand-transition>
            <div v-show="showNSFWNote" class="mb-4 px-3">
              <v-alert
                type="info"
                transition="expand-transition"
                dismissible
                dense
              >
                <div class="caption">
                  <span class="font-weight-bold">Note:</span> This setting <strong>can</strong> be safely modified mid-stream as needed.<br>
                  Changes to this setting will apply immediately upon saving.<br>
                  Additionally, NSFW streams will appear in <strong>red</strong> on sidebar, and have their thumbnail blurred on the homepage.<br>
                  NSFQ streams are additionally prohibited from being selected as the homepage autoplay stream.
                </div>

                <template #close>
                  <v-btn
                    icon
                    small
                    @click="showNSFWNote = false"
                  >
                    <v-icon>close</v-icon>
                  </v-btn>
                </template>
              </v-alert>
            </div>
          </v-expand-transition>

          <v-slide-x-transition mode="out-in">
            <div
              v-if="!previewData"
              class="px-3"
            >
              <v-switch
                v-if="!previewData"
                v-model="streamData.archive"
                class="mb-4"
                label="Archives"
                color="primary"
                hide-details
                inset
                :loading="saveLoading"
                :disabled="saveLoading"
                @change="enableSave = true"
              >
                <template #label>
                  <div>
                    Stream Replays
                    <v-btn
                      title="More info about replay setting"
                      class="ml-2"
                      icon
                      x-small
                      @click.stop="showArchiveNote = !showArchiveNote"
                    >
                      <v-icon>help_outline</v-icon>
                    </v-btn>
                  </div>
                </template>
              </v-switch>

              <!-- Archive note -->
              <v-expand-transition>
                <div v-show="showArchiveNote" class="mb-4">
                  <v-alert
                    type="info"
                    transition="expand-transition"
                    dismissible
                    dense
                  >
                    <div class="caption">
                      <span class="font-weight-bold">Note:</span>
                      modifying the archive setting will affect an in progress stream.<br>
                      Replays can be enabled / disabled mid stream.
                    </div>

                    <template #close>
                      <v-btn
                        icon
                        small
                        @click="showArchiveNote = false"
                      >
                        <v-icon>close</v-icon>
                      </v-btn>
                    </template>
                  </v-alert>
                </div>
              </v-expand-transition>

              <!-- Stream Cover Image -->
              <template
                v-if="isPremium"
              >
                <div class="my-5">
                  <div
                    v-if="streamData.cover"
                    class="d-flex justify-space-around mb-5"
                  >
                    <v-img
                      :src="streamData.cover"
                      max-width="50%"
                      width="100%"
                    ></v-img>
                  </div>

                  <div class="d-flex align-center">
                    <v-file-input
                      ref="image"
                      color="blue"
                      label="Select new stream cover"
                      solo
                      light
                      filled
                      hide-details
                      prepend-icon=""
                      prepend-inner-icon="$file"
                      background-color="white"
                      truncate-length="30"
                      :loading="uploadingCoverImage"
                      @change="onFilePicked"
                    />
                    <v-btn
                      large
                      class="flex-shrink-1 ml-2"
                      :loading="uploadingCoverImage"
                      color="primary"
                      outlined
                      :disabled="!imageFile"
                      @click="uploadFile"
                    >Upload</v-btn>
                  </div>
                </div>
              </template>

              <!-- Stream Title -->
              <div class="body-1 mb-1">Stream Title</div>
              <v-text-field
                v-model="streamData.title"
                color="primary"
                outlined
                clearable
                dense
                counter="240"
                :loading="saveLoading"
                :disabled="saveLoading"
                @change="enableSave = true"
              />

              <!-- Stream Description -->
              <div class="body-1 mb-1 d-flex">
                Stream Description
                <v-btn
                  title="Formatting cheat sheet"
                  class="ml-2"
                  icon
                  x-small
                  href="https://github.com/adam-p/markdown-here/wiki/Markdown-Cheatsheet"
                  target="_blank"
                >
                  <v-icon>help_outline</v-icon>
                </v-btn>
              </div>
              <v-textarea
                v-model="streamData.description"
                hint="markdown supported"
                color="primary"
                outlined
                rows="13"
                counter
                dense
                :loading="saveLoading"
                :disabled="saveLoading"
                @change="enableSave = true"
              />

            </div>

            <v-sheet
              v-else
              color="grey darken-3"
              class="markdown-content"
            >
              <vue-markdown
                style="overflow-y: auto; max-height: 60vh;"
                class="pa-3"
                :source="streamData.description"
              />
            </v-sheet>
          </v-slide-x-transition>

          <div class="d-flex justify-end mt-3 px-3">
            <v-btn
              class="mr-2"
              color="cyan"
              outlined
              small
              :disabled="!enableSave"
              @click="resetValues"
            >
              reset
            </v-btn>
            <v-spacer/>
            <v-btn
              class="mr-2"
              color="error"
              small
              :disabled="saveLoading"
              @click="cancel"
            >
              cancel
            </v-btn>
            <v-btn
              color="primary"
              small
              :loading="saveLoading"
              @click="updateStreamData"
            >
              save
            </v-btn>
          </div>
        </div>
      </v-card>

      <!-- Exit Confirmation Dialog -->
      <v-dialog
        v-model="showExitConfirm"
        width="320"
      >
        <v-card>

          <v-sheet
            color="error"
            class="pa-2 d-flex justify-space-between align-center"
          >
            <h4 class="body-1">
              You have unsaved changes!
            </h4>
            <v-icon>warning</v-icon>
          </v-sheet>

          <!-- Exit confirmation Text -->
          <v-card-title class="subtitle-1 justify-space-around">Are you sure you want to cancel?</v-card-title>

          <!-- Exit confirmation Action Buttons -->
          <v-card-actions class="justify-end">
            <v-btn
              color="red"
              @click="forceQuit"
              outlined
              small
            >
              yes
            </v-btn>
            <v-btn
              class="mr-2"
              color="primary"
              outlined
              small
              @click="showExitConfirm = false"
            >
              no
            </v-btn>

          </v-card-actions>

        </v-card>
      </v-dialog>

    </v-dialog>
  </div>
</template>

<script>
  import VueMarkdown from '@/components/VueMarkdown';
  import { db } from '@/plugins/firebase.js';
  import { mapGetters } from 'vuex'
  import { VStore } from '@/store';
  import { auth } from '@/plugins/firebase';

  export default {
    name: 'EditStreamData',

    components: {
      VueMarkdown,
    },

    props: {
      username: { type: String, },
      title: { type: String, },
      description: { type: String, },
      nsfw: { type: Boolean, },
    },

    data() {
      return {
        archive: false,
        editStreamData: false,
        previewData: false,
        live: false,
        streamData : {
          title: this.title,
          description: this.description,
          nsfw: this.nsfw,
          archive: false,
          cover: null,
        },
        saveLoading: false,
        enableSave: false,
        showArchiveNote: false,
        showNSFWNote: false,
        showExitConfirm: false,

        // TODO: move elsewhere
        imageFile: null,
        uploadingCoverImage: false,
      };
    },

    methods: {
      async getStreamData () {
        const stream = this.username.toLowerCase();
        try {
          const doc = await db
            .collection( 'streams' )
            .doc( stream )
            .get();
          const data = doc.data();
          this.archive = data.archive;
          this.streamData.archive = data.archive;
          this.oldCoverImage = data.cover;
          this.live = data.live;
        } catch ( error ) {
          this.$toast.error( error.message, { icon: 'error', duration: 5000 } );
          this.editStreamData = false;
        }
      },

      resetValues () {
        this.streamData = {
          archive: this.archive,
          title: this.title,
          description: this.description,
          nsfw: this.nsfw,
          cover: this.cover,
        };
        this.live = false;
        this.saveLoading = false;
        this.enableSave = false;
        this.showArchiveNote = false;
        this.showNSFWNote = false;
      },

      cancel () {
        if ( this.enableSave ) {
          this.showExitConfirm = true;
          return;
        }
        // Reset Form
        this.resetValues();
        // Close dialog
        this.previewData = false;
        this.editStreamData = false;
      },

      forceQuit() {
        // Reset exit confirmation
        this.showExitConfirm = false;
        // Reset Form
        this.resetValues();
        // Close dialog
        this.previewData = false;
        this.editStreamData = false;
      },

      async updateStreamData () {
        // Bail early if no data changed
        if ( !this.enableSave ) {
          this.previewData = false;
          this.editStreamData = false;
        }

        this.$ga.event({
          eventCategory : 'profile',
          eventAction   : 'update stream',
          eventLabel    : this.username.toLowerCase(),
        });

        this.saveLoading = true;
        const stream     = this.username.toLowerCase();
        const streamRef  = db.collection( 'streams' ).doc( stream );


        // Trigger Start / Stop Archiving
        if ( this.live && this.archive !== this.streamData.archive ) {
          const endpoint = `https://api.bitwave.tv/v1/streamer/recorder/${this.streamData.archive ? 'start' : 'stop' }`;
          const payload = { user: this.username.toLowerCase(), };
          try {
            const result = await this.$axios
              .post(
                endpoint,
                payload,
              );
            console.log( result );
            this.$toast.error(
              `Failed to ${this.streamData.archive ? 'start' : 'stop'} recording`,
              { icon: 'error', duration: 5000, position: 'top-center' }
            );
          } catch ( error ) {
            console.error( error.message );
            this.$toast.success(
              `Successfully ${this.streamData.archive ? 'started' : 'stopped'} recording!`,
              { icon: 'done', duration: 5000, position: 'top-center' }
            );
          }
        }


        await streamRef.update({
          archive: !!this.streamData.archive,
          nsfw: this.streamData.nsfw,
          title: this.streamData.title,
          description: this.streamData.description,
        });

        this.saveLoading = false;
        this.enableSave    = false;

        setTimeout( () => {
          this.previewData = false;
          this.editStreamData = false;
        }, 100 );
      },

      /* Stream Cover Upload */
      onFilePicked ( file ) {
        if ( !!file ) {
          this.imageName = file.name;
          if( this.imageName.lastIndexOf('.') <= 0 ) return;

          const fr = new FileReader ();
          fr.readAsDataURL( file );
          fr.addEventListener('load', () => {
            this.streamData.cover  = fr.result;
            this.imageFile = file; // this is an image file that can be sent to server...
          });
        }
      },

      /* Upload Cover Image */
      async uploadFile () {
        if ( !this.imageFile ) return false;
        this.uploadingAvatar = true;
        const formData = new FormData();
        formData.append( 'image', this.imageFile );
        try {
          const { data } = await this.$axios.post(
            'https://api.bitwave.tv/v1/upload/cover',
            formData,
            { headers: { 'content-type': 'multipart/formdata', }, }
          );
          console.log( `Upload successfull.` );
          this.$toast.success( 'Upload successful', { icon: 'done', duration: 5000 } );
          console.log( data );

          if ( data.hasOwnProperty( 'key' ) ) {
            const imgURL = data.location;
            await this.saveCoverImage( imgURL );
          }

        } catch ( error ) {
          console.log( `Upload failed!` );
          this.$toast.error( `Failed to upload image: ${error.response.data}`, { icon: 'error', duration: 5000 } );
          console.error( error.message );
        }
        this.uploadingAvatar = false;
      },

      async saveCoverImage ( url ) {
        const stream      = this.username.toLowerCase();
        const streamRef   = db.collection( 'streams' ).doc( stream );
        await streamRef.update({
          cover: url,
        });

        this.imageFile = null;
        this.imageName = '';
        this.streamData.cover = url;

        await this.deleteOldCover();
      },

      async deleteOldCover () {
        try {
          const { data } = await this.$axios.delete(
            'https://api.bitwave.tv/v1/upload',
            {
              data: { key: this.oldCoverImage },
            }
          );
          console.log( `Deleted old cover? ${data ? 'Yes' : 'No'}` );
        } catch ( error ) {
          console.error( `Failed to delete old cover: `, error.message );
          this.$toast.error( `Failed to delete old cover image: ${error.response.data}`, { icon: 'error', duration: 5000 } );
        }
        this.oldCoverImage = this.streamData.cover;
      },
    },

    computed: {
      ...mapGetters({
        isPremium : VStore.$getters.isPremium,
      }),
    },

    async mounted () {
      await this.getStreamData();
    },
  };
</script>

<style lang="scss">
  .markdown-content {
    text-overflow: ellipsis;
    word-break: break-word;
    max-width: 100%;

    img {
      max-width: 100%;
    }
  }
</style>
