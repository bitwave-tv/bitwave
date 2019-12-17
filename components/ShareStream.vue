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
        color="blue"
        outlined
        @click="openShare"
      >
        share
        <v-icon small class="ml-1">share</v-icon>
      </v-btn>
    </template>

    <v-card>

      <v-sheet
        tile
        color="yellow"
        class="pa-2 d-flex justify-space-between align-center"
      >
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
          <!-- Info about cache busting:
          <br>
          Note: When sharing to social media sites, if you want the thumbnail and description to be updated
          you have to use a 'new' URL. In order to do this, a timestamp is added to the URL when copying and sharing. -->
        </div>

        <v-text-field
          class="mb-3"
          :value="streamlink"
          solo
          readonly
          hide-details
          light
          style="font-size: 14px;"
        >
          <template #append>
            <v-btn
              color="blue"
              depressed
              small
              dark
              @click="copyShareLink"
            >Copy</v-btn>
          </template>
        </v-text-field>

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
      cacheBust () {
        const coeff = 1000 * 60 * 10; // Ten minute cache buster
        const timestamp = Math.round( Date.now() / coeff ) * coeff;
        return `?shareid=${timestamp}`;
      },

      streamlink () {
        return `https://bitwave.tv/${this.user}`;
      },

      shareLink () {
        return `${this.streamlink}${this.cacheBust}`;
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
