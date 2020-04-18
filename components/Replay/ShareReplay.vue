<template>
  <div class="text-center">
    <v-tooltip bottom>
      <template v-slot:activator="{ on }">
        <v-btn
          v-on="on"
          small
          color="primary"
          outlined
          @click="openShare"
        >
          share
          <v-icon small class="ml-1">share</v-icon>
        </v-btn>
      </template>
      <span>Share this replay!</span>
    </v-tooltip>

    <v-dialog
      v-model="showShare"
      bottom
      offset-y
      left
      :close-on-content-click="false"
      :max-width="$vuetify.breakpoint.mdAndDown ? '95%' : '60%'"
      transition="slide-x-transition"
    >
      <!-- Share replay dialog -->
      <v-card>
        <v-sheet
          tile
          color="secondary"
          class="pa-2 d-flex justify-space-between align-center"
        >
          <h4 class="body-1">
            Share Replay
          </h4>
          <v-btn
            text
            icon
            small
            @click="showShare = !showShare"
          >
            <v-icon>close</v-icon>
          </v-btn>
        </v-sheet>

        <div class="pa-3">
          <div class="mb-3">
            Share a link directly to this stream replay on twitter below!<br>
            <span class="caption grey--text">(you will be able to edit the tweet before posting)</span>
          </div>

          <!-- Display canonical link -->
          <v-text-field
            class="mb-3"
            :value="shareLink"
            solo
            readonly
            hide-details
            light
            style="font-size: 14px;"
          >
            <template #append v-if="!$vuetify.breakpoint.xsOnly">
              <v-btn
                color="secondary"
                depressed
                small
                @click="copyShareLink"
              >Copy Link</v-btn>
            </template>
          </v-text-field>

          <!-- Option to include timestamp -->
          <div class="mb-4">
            <v-switch
              v-model="shareAtTimestamp"
              label="Share at current timestamp?"
              color="secondary"
              hide-details
              dense
              inset
              @change="getCurrentPlayerTime"
            />
          </div>

          <div class="d-flex">
            <!-- Share to twitter -->
            <v-btn
              color="#1dcaff"
              :href="twitterLink"
              target="_blank"
              @click="shareToTwitter"
            >twitter</v-btn>

            <!-- Copy button for phones -->
            <template v-if="$vuetify.breakpoint.xsOnly">
              <v-spacer />
              <v-btn
                color="secondary"
                @click="copyShareLink"
              >Copy</v-btn>
            </template>
          </div>
        </div>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
  export default {
    name: 'ShareReplay',

    props: {
      user: { type: String },
      replayId: { type: String },
    },

    data() {
      return {
        showShare: false,
        shareAtTimestamp: false,
        currentTime: null,
      };
    },

    methods: {
      openShare () {
        this.showShare = true;

        this.$ga.event({
          eventCategory : 'share',
          eventAction   : 'show share replay',
          eventLabel    : this.user,
        });
      },

      getCurrentPlayerTime () {
        if ( !window.$bw || !window.$bw.player ) {
          console.warn( `Failed to get timestamp from global player` );
          this.currentTime = 0;
          return;
        }
        this.currentTime = window.$bw.player.currentTime();
      },

      shareToTwitter () {
        this.$ga.event({
          eventCategory : 'share',
          eventAction   : 'share to twitter',
          eventLabel    : this.user,
        });
      },

      async copyShareLink () {
        await this.copyToClipboard( this.shareLink );
      },

      async copyToClipboard ( text ) {
        try {
          await navigator.clipboard.writeText( text );
          // await this.$copyText( text );
          this.$toast.success( 'Copied to clipboard', { icon: 'done', duration: 5000 } );
        } catch ( error ) {
          console.log( error );
          this.$toast.error( `Copy Failed: ${error}`, { icon: 'error', duration: 5000 } );
        }

        this.$ga.event({
          eventCategory : 'share',
          eventAction   : 'copy link',
          eventLabel    : this.user,
        });
      },
    },

    computed: {
      timestamp () {
        return Math.round( this.currentTime );
      },

      timestampQuery () {
        if ( !this.timestamp || !this.shareAtTimestamp ) {
          // console.log( `Timestamp does not exist!` );
          return '';
        }
        return `?t=${this.timestamp}`;
      },

      streamlink () {
        return `https://bitwave.tv/${this.user}/${this.replayId}`;
      },

      shareLink () {
        return `${this.streamlink}${this.timestampQuery}`;
      },

      twitterLink () {
        const text = `Come watch ${this.user}'s stream!\n`;
        const url = this.shareLink;
        const hashtags = 'freespeech';
        const via = 'bitwavetv';
        const related = 'bitwavetv,dispatchcommit';
        const base = 'https://twitter.com/intent/tweet';

        return `${base}?text=${encodeURI(text)}&url=${url}&hashtags=${hashtags}&via=${via}&related=${related}`;
      },
    },
  };
</script>
