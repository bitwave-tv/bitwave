<template>
  <div>
    <v-card>
      <v-sheet color="yellow">
        <div class="title black--text pa-3">Create New OBS Chat Overlay</div>
      </v-sheet>

      <v-card-text>

        <v-text-field
          v-model="overlay.title"
          class="mb-3"
          label="Name"
          color="yellow"
          clearable
          outlined
          dense
          counter="240"
          :loading="saveLoading"
          :disabled="saveLoading"
          prepend-icon="event_note"
          @change="enableSave = true"
        ></v-text-field>

        <v-autocomplete
          v-model="overlay.channel"
          label="Choose channel..."
          no-data-text="No channels found"
          prepend-icon="search"
          hide-details
          single-line
          :items="streamers.names"
          :search-input.sync="streamers.filter"
          clearable
          return-object
          outlined
          dense
          @change="enableSave = true"
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

        <div class="d-flex justify-space-around">
          <v-switch
            v-model="overlay.global"
            :label="`${overlay.global ? 'Global' : 'Local'} Chat`"
            color="yellow"
            hide-details
            :loading="saveLoading"
            :disabled="saveLoading"
            @change="enableSave = true"
          ></v-switch>

          <v-switch
            v-model="overlay.showTimestamps"
            label="Show Timestamps"
            color="yellow"
            hide-details
            :loading="saveLoading"
            :disabled="saveLoading"
            @change="enableSave = true"
          ></v-switch>
        </div>

        <div class="mt-3">
          <div class="subtitle-1">Show {{ overlay.history }} messages.</div>

          <v-slider
            v-model="overlay.history"
            prepend-icon="remove"
            max="100"
            min="1"
            step="1"
            :thumb-label="false"
            hide-details
          >
            <template #prepend>
              <v-icon
                color="yellow"
                @click="overlay.history -= 5"
              >remove</v-icon>
            </template>
            <template #append>
              <v-icon
                color="yellow"
                @click="overlay.history += 5"
              >add</v-icon>
            </template>
          </v-slider>
        </div>

      </v-card-text>

      <v-card-actions class="justify-end">
        <v-btn
          class="mr-2"
          color="red"
          :disabled="saveLoading"
          @click="cancel"
        >
          cancel
        </v-btn>
        <v-btn
          color="yellow"
          light
          :loading="saveLoading"
          @click="createOverlay"
        >
          create
        </v-btn>
      </v-card-actions>
    </v-card>

    <!-- Exit Confirmation Dialog -->
    <v-dialog
      v-model="showExitConfirm"
      width="320"
    >
      <v-card>
        <v-sheet
          color="yellow"
          class="pa-2 d-flex justify-space-between align-center"
        >
          <h4 class="black--text body-1">
            You have unsaved changes!
          </h4>
          <v-icon light>warning</v-icon>
        </v-sheet>

        <v-card-title class="subtitle-1">
          Are you sure you want to exit?
        </v-card-title>
        <v-card-actions class="justify-end">
          <v-btn
            class="mr-2"
            color="yellow"
            outlined
            @click="showExitConfirm = false"
          >
            No
          </v-btn>
          <v-btn
            color="yellow"
            light
            @click="forceQuit"
          >
            Yes
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
  import { db } from '@/plugins/firebase.js';
  import { mapGetters } from 'vuex';

  export default {
    name: 'CreateOverlayDialog',

    model: {
      prop: 'value',
      event: 'change'
    },

    props: {
      count: { type: Number },
    },

    data() {
      return {
        enableSave: false,
        saveLoading: false,
        showExitConfirm: false,
        overlay: {
          title: '',
          channel: '',
          global: false,
          history: 25,
          showTimestamps: true,
          showTrolls: true,
          type: 'chat',
        },
        streamers: {
          names: [],
          filter: '',
        },
      };
    },

    methods: {
      async createOverlay () {
        this.saveLoading = true;

        const date = new Date ( Date.now() );
        const channel = this.overlay.channel ? this.overlay.channel.text.toLowerCase() : this.user._username;
        const title = this.overlay.title ? this.overlay.title : `Overlay ${this.count}`;

        const data = {
          _username: this.user._username,
          channel: channel,
          created: date,
          edited: date,
          global: this.overlay.global,
          history: this.overlay.history,
          owner: this.user.uid,
          showTimestamps: this.overlay.showTimestamps,
          showTrolls: true,
          title: title,
          type: 'chat',
        };

        const overlayRefs = db.collection( 'overlays' );
        await overlayRefs.add( data );

        this.saveLoading = false;

        this.forceQuit();
      },

      reset () {
        this.overlay.history = 25;
        this.overlay.global = false;
        this.overlay.showTimestamps = true;
        this.overlay.title = '';
      },

      cancel () {
        if ( this.enableSave )
          this.showExitConfirm = true;
        else
          this.forceQuit();
      },

      forceQuit () {
        this.reset();
        this.$emit( 'change', false );
      },

      async getStreamers () {
        let { data } = await this.$axios.get( 'https://api.bitwave.tv/api/channels/list' );
        this.streamers.names = data.users.map( s => ({
          text: s.name,
          value: s.name,
          avatar: s.avatar,
        }));
        this.streamers.filtered = this.streamers.names;
      },
    },

    computed: {
      ...mapGetters({
        user: 'user',
      }),
    },

    async created () {
      await this.getStreamers();
    },

    async mounted () {

    },

  };
</script>

<style lang='scss' scoped>

</style>
