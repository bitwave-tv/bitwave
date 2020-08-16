<template>
  <v-container>
    <v-layout justify-center class="text-xs-center">
      <v-flex
        class="my-3"
        xs12
        sm10
        md8
        lg6
      >
        <h1 class="ml-2">Your Account</h1>
      </v-flex>
    </v-layout>

    <account-details />

    <!-- Get a stream key -->
    <v-layout
      v-if="!showStreamInfo"
      justify-center
    >
      <v-flex
        xs12
        sm10
        md8
        lg6
      >
        <v-card class="mb-4 pa-3">
          <h2 class="mb-3">Want to stream?</h2>
          <v-btn
            to="/streamkey"
            color="primary"
          >Get A Streamkey</v-btn>
        </v-card>
      </v-flex>
    </v-layout>

    <!-- Stream Key -->
    <v-layout justify-center>
      <v-flex
        v-if="showStreamInfo"
        xs12
        sm10
        md8
        lg6
      >
        <v-card class="mb-4 pa-3">
          <v-layout column>
            <v-flex class="mb-3">
              <h2>Stream Server Configuration</h2>


              <div class="my-3">
                <v-btn
                  color="accent"
                  outlined
                  small
                  @click="showStreamkeyHelp = !showStreamkeyHelp"
                >
                  {{ showStreamkeyHelp ? 'Hide' : 'Show' }} Help
                </v-btn>

                <v-expand-transition>
                  <div
                    v-show="showStreamkeyHelp"
                    class="my-2 body-2"
                  >
                    <div class="mb-4">
                      <div class="title secondary--text">Getting Started</div>
                      To get started, first copy and paste a <strong>Server URL</strong> and your <strong>Stream Key</strong> from below into your livestreaming software (such as OBS).<br>
                      You may need to choose "Custom RTMP Server" in your software in order to do this.<br>
                      We currently offer 2 stream ingestion servers that you may connect to: <br>
                      US West ( Primary ), and US East ( Backup / Auxillary capacity ).<br>
                      A European server is planned dependant on finances & demand.<br>
                      It is suggested you try connecting to both servers in order to determine which server provides a more stable connection.
                    </div>
                    <div class="mb-2">
                      <div class="title secondary--text">Choose a Bitrate</div>
                      We recommend a bitrate of 2,500kb/s (2.5mb/s) CBR for most streamsers (if their net supports it).<br>
                      Please do not exceed 8,000kb/s (8.0mb/s). While our servers <i>are</i> capable of managing numerous high bitrate
                      streams with ease, it is unlikely that all viewers will be able to smoothly watch a stream at rates above 8.0mb/s.
                    </div>
                    <div class="mb-2">
                      <div class="title secondary--text">Set Your Keyframes</div>
                      Lastly, ensure your keyframes are set to either 1 or 2 in your streaming software.<br>
                      <strong>DO NOT FORGET THIS.</strong><br>
                      Using other rates may result in unstable streams, loss of connection, increased stream delays, frequent buffering, and can even cause your stream's video to freeze entirely.
                    </div>
                    <div class="mb-2">
                      <div class="title secondary--text">Asking For Help</div>
                      If you are having issues setting up or connecting your stream, try asking for help in chat. There are many knowledgeable users with streaming experience who will likely
                      offer to help resolve any issues. There are also links on the homepage in case you need to get in touch with a developer.
                    </div>
                  </div>
                </v-expand-transition>
              </div>


            </v-flex>
            <v-flex>
              <v-text-field
                class="mb-3"
                value="rtmp://stream.bitwave.tv/live"
                label="Primary Server URL (US West)"
                color="primary"
                readonly
                outlined
                hide-details
                :loading="streamDataLoading"
              />
              <v-text-field
                class="mb-3"
                value="rtmp://stream.bitrave.tv/live"
                label="Backup Server URL (US East)"
                color="primary"
                readonly
                outlined
                hide-details
                :loading="streamDataLoading"
              />
            </v-flex>
            <v-flex>
              <v-text-field
                v-model="streamData.key"
                ref="streamkeyinput"
                label="Stream Key"
                color="primary"
                readonly
                outlined
                :messages="keyMessage"
                :loading="streamDataLoading || keyLoading"
                :type="showKey ? 'text' : 'password'"
                :append-icon="showKey ? 'visibility' : 'visibility_off'"
                @click:append="showKey = !showKey"
                @click="showKey = !showKey"
                @focus="showKey = !showKey"
              />
            </v-flex>
            <v-layout>
              <v-spacer/>
              <v-btn
                color="primary"
                outlined
                :loading="keyLoading"
                @click="resetStreamKey"
                class="mr-2"
              >Reset</v-btn>
              <v-btn
                color="primary"
                class="black--text"
                :loading="keyLoading"
                @click="copyToClipboard"
              >Copy</v-btn>
            </v-layout>
          </v-layout>
        </v-card>
      </v-flex>
    </v-layout>

    <!-- Stream Info -->
    <v-layout justify-center>
      <v-flex
        v-if="showStreamInfo"
        xs12
        sm10
        md8
        lg6
      >
        <v-card class="mb-4 pa-3">
          <v-layout column>
            <v-flex class="mb-3">
              <h2>Stream Info</h2>
            </v-flex>
            <v-flex class="mb-3">
              <v-text-field
                v-model="streamData.title"
                label="Stream Title"
                color="primary"
                outlined
                hide-details
                :loading="streamDataLoading || saveLoading"
                @input="showSave = true"
              />
            </v-flex>
            <v-flex>
              <v-textarea
                v-model="description"
                name="input-7-1"
                outlined
                hide-details
                color="primary"
                label="Stream Description (markdown supported)"
                auto-grow
                @input="showSave = true"
              />
            </v-flex>
            <v-flex shrink>
              <v-switch
                v-model="streamData.nsfw"
                label="NSFW"
                color="primary"
                hide-details
                dense
                inset
                @change="showSave = true"
              />
            </v-flex>
            <v-flex shrink>
              <v-switch
                v-model="streamData.archive"
                label="Archive"
                color="primary"
                hide-details
                dense
                inset
                @change="showSave = true"
              />
            </v-flex>
            <v-layout>
              <v-spacer/>
              <v-btn
                :disabled="!showSave"
                :loading="saveLoading"
                color="primary"
                outlined
                @click="updateStreamData"
              >save</v-btn>
            </v-layout>
          </v-layout>
        </v-card>
      </v-flex>
    </v-layout>

    <!-- Webhooks -->
    <v-layout justify-center>
      <v-flex
        v-if="showStreamInfo"
        xs12
        sm10
        md8
        lg6
      >
        <v-card class="mb-4 pa-3">
          <v-flex class="mb-3">
            <h2>Discord Webhooks</h2>
          </v-flex>
          <div>
            <manage-webhooks />
          </div>
        </v-card>
      </v-flex>
    </v-layout>

  </v-container>
</template>

<script>
  import { auth, db } from '@/plugins/firebase.js'

  import { mapGetters } from 'vuex';
  import { VStore } from '@/store';

  import AccountDetails from '@/components/profile/AccountDetails';
  import ManageWebhooks from '@/components/profile/ManageWebhooks';

  export default {

    name: 'profile',

    components: {
      ManageWebhooks,
      AccountDetails,
    },

    middleware: 'auth',

    data () {
      return {
        unsubAuthChanged: null,
        currentTab: 0,

        allowEdit: false,

        showError: false,
        error: {
          message: '',
        },

        showSuccess: false,
        success: {
          message: '',
        },

        streamDocListener: null,

        streamData: {
          archive: false,
          title: '',
          nsfw: false,
          url: '',
          key: '',
        },

        streamDataLoading: true,
        profileDataLoading: true,
        showStreamInfo: false,
        showKey: false,
        showSave: false,
        saveLoading: false,
        keyLoading: false,
        keyMessage: 'Click to reveal key',

        description: '',

        showStreamkeyHelp: false,
      }
    },

    methods: {

      async authenticated ( user ) {
        if ( user ) {
          console.log( `[profile] User:`, user );
        } else {
          await this.$router.push( '/login' );
        }
      },

      getStreamData () {
        this.streamDataLoading = true;

        const stream = this.username.toLowerCase();
        const streamRef = db.collection( 'streams' ).doc( stream );
        return streamRef.onSnapshot( async doc => {
          this.showStreamInfo = doc.exists;
          if (this.showStreamInfo) await this.streamDataChanged( doc.data() );
        }, () => this.showStreamInfo = false );
      },

      getProfileData () {
        this.profileDataLoading = true;
        const userId = this.uid;
        const profileRef = db.collection( 'users' ).doc( userId );
        return profileRef.onSnapshot( async doc => {
          await this.profileDataChanged( doc.data() );
        }, error => console.log( error ) );
      },

      async profileDataChanged ( data ) {
        this.streamkey = data.streamkey;
        this.streamData.key = `${this.username}?key=${this.streamkey}`;
        this.profileDataLoading = false;
      },

      async streamDataChanged ( data ) {
        this.streamData.archive = !!data.archive;
        this.streamData.title   = data.title;
        this.streamData.nsfw    = data.nsfw;
        this.description        = data.description;
        this.streamDataLoading  = false;
      },

      async updateStreamData () {
        this.$ga.event({
          eventCategory : 'profile',
          eventAction   : 'update stream',
          eventLabel    : this.username.toLowerCase(),
        });
        this.saveLoading  = true;
        const archive     = this.streamData.archive;
        const title       = this.streamData.title;
        const nsfw        = this.streamData.nsfw;
        const description = this.description;
        const stream      = this.username.toLowerCase();
        const streamRef   = db.collection( 'streams' ).doc( stream );
        await streamRef.update({
          archive,
          nsfw,
          title,
          description
        });
        this.saveLoading = false;
        this.showSave    = false;
      },

      async resetStreamKey () {
        this.$ga.event({
          eventCategory : 'profile',
          eventAction   : 'reset key',
          eventLabel    : this.username.toLowerCase(),
        });
        this.keyLoading = true;
        const key    = Math.random().toString( 16 ).substr( 2, 9 );
        const userId = this.uid;
        const docRef = db.collection( 'users' ).doc( userId );
        await docRef.update({
          streamkey: key,
        });
        this.keyLoading = false;
        await this.kickStream ();
      },

      async kickStream () {
        const token    = await auth.currentUser.getIdToken( true );
        const user     = this.username;
        const server   = 'api.bitwave.tv';
        const apiVer   = 'v1';
        const endpoint = '/streamer/stream/kick';
        const url      = `https://${server}/${apiVer}${endpoint}?token=${token}&reset=${false}`;
        await this.$axios.$post( url, { streamer: user } );
      },

      copyToClipboard () {
        const initialState = this.showKey;
        this.$copyText( this.streamData.key ).then( () => {
          this.keyMessage = ['Copied to clipboard'];
          this.$toast.success( 'Copied to clipboard', { icon: 'done', duration: 5000 } );
          this.$refs['streamkeyinput'].focus();
        }, ( error ) => {
          console.log( error );
          this.keyMessage = 'Failed to copy to clipboard';
          this.$toast.error( 'Failed to copy to clipboard', { icon: 'error', duration: 5000 } );
        });

        setTimeout ( () => {
          this.showKey = initialState;
          this.keyMessage = 'Click to reveal key';
          this.$refs['streamkeyinput'].blur();
        }, 3000);
      },

    },

    computed: {
      ...mapGetters({
        uid      : VStore.$getters.getUID,
        user     : VStore.$getters.getUser,
        username : VStore.$getters.getUsername,
      }),
    },

    mounted () {
      this.unsubAuthChanged   = auth.onAuthStateChanged( user => this.authenticated( user ) );
      this.streamDocListener  = this.getStreamData();
      this.profileDocListener = this.getProfileData();
    },

    beforeDestroy () {
      if ( this.unsubAuthChanged ) {
        this.unsubAuthChanged();
        console.log( `%cProfile.vue:%c Unsubscribed!`, 'background: #2196f3; color: #fff; border-radius: 3px; padding: .2rem .5rem;', '' );
      }
      if ( this.streamDocListener ) this.streamDocListener();
      if ( this.profileDocListener ) this.profileDocListener();
    },
  }
</script>
