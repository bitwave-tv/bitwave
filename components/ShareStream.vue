<template>
  <v-dialog
    v-model="showShare"
    bottom
    offset-y
    left
    :close-on-content-click="false"
    width="450px"
    transition="slide-x-transition"
  >
    <template #activator="{ on }">
      <v-btn
        v-on="on"
        small
        icon
        @click="openShare"
      >
        <v-icon>share</v-icon>
      </v-btn>
    </template>

    <v-card>

      <v-sheet color="yellow" class="pa-2 d-flex justify-space-between align-center">
        <h4 class="black--text body-1">
          Share Stream
        </h4>
        <v-btn
          color="black"
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
          This is probably a bad idea, but I'm not going to stop you.
        </div>

        <v-text-field
          class="mb-3"
          :value="streamlink"
          solo-inverted
          flat
          readonly
          disabled
          hide-details
          color="yellow"
          style="font-size: 14px;"
          @click="copyToClipboard(streamlink)"
        >
          <template #append>
            <v-btn
              small
              color="yellow"
              class="black--text"
              @click="copyToClipboard(streamlink)"
            >COPY</v-btn>
          </template>
        </v-text-field>

        <v-snackbar
          v-model="showAlert"
          :color="alertType"
          :timeout="5000"
          bottom
          right
          @click="showAlert = false"
        >{{ alertMessage }}</v-snackbar>

        <v-btn
          color="#1dcaff"
          :href="twitterLink"
          target="_blank"
          @click="shareToTwitter"
        >
          Share to Twitter
          <v-icon small class="ml-2">open_in_new</v-icon>
        </v-btn>

      </div>

    </v-card>
  </v-dialog>
</template>

<script>
  export default {
    name: 'ShareStream',

    props: {
      user: { type: String },
    },

    data() {
      return {
        showShare: false,
        showAlert: false,
        alertType: 'info',
        alertMessage: '',
        alertTimeout: 0,
      };
    },

    methods: {
      openShare () {
        this.$ga.event({
          eventCategory : 'share',
          eventAction   : 'show share stream',
          eventLabel    : this.user,
        });
      },

      shareToTwitter () {
        this.$ga.event({
          eventCategory : 'share',
          eventAction   : 'share to twitter',
          eventLabel    : this.user,
        });
      },

      copyToClipboard ( text ) {
        clearTimeout(this.alertTimeout);

        this.$ga.event({
          eventCategory : 'share',
          eventAction   : 'copy link',
          eventLabel    : this.user,
        });

        this.$copyText( text ).then( () => {
          this.alertMessage = 'Copied to clipboard';
          this.alertType = 'success';
          this.showAlert = true;
        }, ( error ) => {
          console.log( error );
          this.alertMessage = 'Failed to copy to clipboard';
          this.alertType = 'error';
          this.showAlert = true;
        });
      },
    },

    computed: {
      streamlink () {
        return `https://bitwave.tv/${this.user}`;
      },

      twitterLink () {
        const text = `Come watch ${this.user}'s stream!\n`;
        const url = this.streamlink;
        const hashtags = 'freespeech';
        const via = 'bitwavetv';
        const related = 'bitwavetv,dispatchcommit';
        const base = 'https://twitter.com/intent/tweet';

        return `${base}?text=${encodeURI(text)}&url=${url}&hashtags=${hashtags}&via=${via}&related=${related}`;
      },
    },
  };
</script>
