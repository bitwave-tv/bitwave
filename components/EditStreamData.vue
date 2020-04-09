<template>
  <v-dialog
    v-model="editStreamData"
    transition="fade-transition"
    :max-width="$vuetify.breakpoint.mdAndDown ? '95%' : '60%'"
    @click:outside="cancel"
    persistent
  >
    <template #activator="{ on }">
      <v-btn
        v-on="on"
        class="mr-3"
        outlined
        small
        color="primary"
      >
        <template v-if="$vuetify.breakpoint.smAndDown">
          <v-icon small class="ml-1">edit</v-icon>
        </template>
        <template v-else>
          Edit
        </template>
      </v-btn>
    </template>

    <v-card
      color="accentwave"
      :loading="saveLoading || showExitConfirm"
    >
      <!-- Title -->
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
                NSFW streams are additionally prohibited from being selected as the homepage autoplay stream.
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
                    <span class="font-weight-bold">Note:</span> modifying the archive setting will <strong>not</strong> affect an in progress stream.<br>
                    A stream must be fully restarted in order to apply changes.<br>
                    Archives cannot be enabled / disabled mid stream.
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
</template>

<script>
  import VueMarkdown from '~/components/VueMarkdown';
  import { db } from '@/plugins/firebase.js';

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
        streamData : {
          title: this.title,
          description: this.description,
          nsfw: this.nsfw,
          archive: false,
        },
        saveLoading: false,
        enableSave: false,
        showArchiveNote: false,
        showNSFWNote: false,
        showExitConfirm: false,
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
        };
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

        this.saveLoading  = true;
        const stream      = this.username.toLowerCase();
        const streamRef   = db.collection( 'streams' ).doc( stream );

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
    },

    computed: {},

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
