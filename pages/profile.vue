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
        <h1 class="ml-2">My Account</h1>
      </v-flex>
    </v-layout>

    <v-layout justify-center>
      <v-flex
        xs12
        sm10
        md8
        lg6
      >
        <v-card class="mb-4 pa-3">
          <v-layout column>
            <v-flex>
              <v-layout
                justify-space-around
                align-center
                row
              >
                <v-flex shrink class="ma-3">
                  <v-avatar color="white" size="100">
                    <v-img
                      :src="imageUrl || 'https://cdn.bitwave.tv/static/img/shield.png'"
                      alt="avatar" />
                  </v-avatar>
                </v-flex>
                <v-flex shrink class="text-xs-center my-1">
                  <h3>THE REST OF THIS SHIT IS COMING SOON</h3>
                  <p>send complaints for $5/issue via paypal.</p>
                  <v-btn
                    color="red"
                    href="https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=JAN2HKQ9CTYZY&source=url"
                    target="_blank"
                  >COMPLAINTS</v-btn>
                </v-flex>
              </v-layout>
            </v-flex>
            <v-flex v-if="user" class="my-2">
              <v-layout column>

                <h2 class="mb-2">Profile</h2>

                <v-layout
                  class="mb-4"
                  align-center
                >
                  <v-flex>
                    <v-file-input
                      ref="image"
                      label="Select new profile photo"
                      solo
                      light
                      filled
                      hide-details
                      prepend-icon=""
                      prepend-inner-icon="$file"
                      background-color="white"
                      truncate-length="30"
                      @change="onFilePicked"
                    />
                  </v-flex>
                  <v-flex shrink>
                    <v-btn
                      large
                      class="ml-2"
                      :loading="uploadingAvatar"
                      color="yellow"
                      outlined
                      :disabled="!imageFile"
                      @click="uploadFile"
                    >SAVE</v-btn>
                  </v-flex>
                </v-layout>

                <v-flex class="mt-4">
                  <v-text-field
                    v-model="user.uid"
                    label="UserID"
                    disabled
                    outlined
                  />
                </v-flex>

                <v-flex>
                  <v-text-field
                    v-model="username"
                    label="username"
                    readonly
                    outlined
                  />
                </v-flex>

                <v-flex>
                  <v-text-field
                    v-model="user.email"
                    label="email"
                    readonly
                    outlined
                  />
                </v-flex>

                <v-flex>
                  <v-text-field
                    label="password"
                    type="password"
                    value="************"
                    disabled
                    outlined
                  />
                </v-flex>

                <v-layout>
                  <v-spacer />
                  <v-btn
                    color="yellow"
                    @click="logout"
                    disabled
                    class="mr-2 black--text"
                  >Edit</v-btn>
                  <v-btn
                    color="yellow"
                    @click="logout"
                    class="black--text"
                  >Logout</v-btn>
                </v-layout>
              </v-layout>
            </v-flex>
          </v-layout>
        </v-card>
      </v-flex>
    </v-layout>

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
                color="yellow"
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
                color="yellow"
                label="Stream Description (markdown supported)"
                auto-grow
                @input="showSave = true"
              />
            </v-flex>
            <v-flex shrink>
              <v-switch
                v-model="streamData.nsfw"
                label="NSFW"
                color="yellow"
                hide-details
                @change="showSave = true"
              />
            </v-flex>
            <v-flex shrink>
              <v-switch
                v-model="streamData.archive"
                label="Archive"
                color="yellow"
                hide-details
                @change="showSave = true"
              />
            </v-flex>
            <v-layout>
              <v-spacer/>
              <v-btn
                :disabled="!showSave"
                :loading="saveLoading"
                color="yellow"
                outlined
                @click="updateStreamData"
              >save</v-btn>
            </v-layout>
          </v-layout>
        </v-card>
      </v-flex>
    </v-layout>

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
            </v-flex>
            <v-flex>
              <v-text-field
                class="mb-3"
                value="rtmp://stream.bitwave.tv/live"
                label="Stream URL"
                color="yellow"
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
                color="yellow"
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
                color="yellow"
                outlined
                :loading="keyLoading"
                @click="resetStreamKey"
                class="mr-2"
              >Reset</v-btn>
              <v-btn
                color="yellow"
                class="black--text"
                :loading="keyLoading"
                @click="copyToClipboard"
              >Copy</v-btn>
            </v-layout>
          </v-layout>
        </v-card>
      </v-flex>
    </v-layout>

  </v-container>
</template>

<script>
  import { auth, db } from '@/plugins/firebase.js'

  import { mapGetters, mapActions } from 'vuex'
  import { VStore } from '@/store';

  export default {

    name: 'profile',

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
        showStreamInfo: true,
        showKey: false,
        showSave: false,
        saveLoading: false,
        keyLoading: false,
        keyMessage: 'Click to reveal key',

        imageName: '',
        imageUrl: '',
        imageFile: null,
        uploadingAvatar: false,

        description: '',
      }
    },

    methods: {
      ...mapActions({
        logoutStore: VStore.$actions.logout,
      }),

      async logout () {
        await this.logoutStore();
        this.$router.push( '/signout' );
      },

      async authenticated ( user ) {
        if ( user ) {
          console.log( `[profile] User:`, user );
        } else {
          this.$router.push( '/login' );
        }
      },

      getStreamData () {
        this.streamDataLoading = true;
        // const userId = this.user.uid;
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
        if (data.avatar) this.imageUrl = data.avatar;
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

      pickFile () {
        this.$refs.image.click ();
      },

      onFilePicked ( file ) {
        if ( !!file ) {
          this.imageName = file.name;
          if( this.imageName.lastIndexOf('.') <= 0 ) {
            return;
          }
          const fr = new FileReader ();
          fr.readAsDataURL( file );
          fr.addEventListener('load', () => {
            this.imageUrl  = fr.result;
            this.imageFile = file; // this is an image file that can be sent to server...
          });
        } else {
          this.imageName =   '';
          this.imageFile = null;
          this.imageUrl  =   '';
        }
      },

      async uploadFile () {
        if ( !this.imageFile ) return false;
        this.uploadingAvatar = true;
        const formData = new FormData();
        formData.append( 'upload', this.imageFile );
        try {
          const { data } = await this.$axios.post( 'https://api.bitwave.tv/upload', formData, {
            headers: {
              'content-type': 'multipart/formdata',
            },
          });
          console.log( `Upload successfull.` );
          this.$toast.success( 'Upload successful', { icon: 'done', duration: 5000 } );
          console.log( data );
          this.imageUrl = data.transforms.find( image => image.id === 'thumbnail' ).location;
          this.saveUserAvatar( this.imageUrl );
        } catch ( error ) {
          console.log( `Upload failed!` );
          this.$toast.error( 'Failed to upload image', { icon: 'error', duration: 5000 } );
          console.log( error.message );
        }
        this.uploadingAvatar = false;
      },

      async saveUserAvatar ( url ) {
        this.$ga.event({
          eventCategory : 'profile',
          eventAction   : 'update avatar',
          eventLabel    : this.username.toLowerCase(),
        });

        const userId = this.uid;
        const docRef = db.collection( 'users' ).doc( userId );
        await docRef.update({
          avatar: url,
        });

        if ( this.showStreamInfo ) {
          const stream = this.username.toLowerCase();
          const streamRef = db.collection( 'streams' ).doc( stream );
          await streamRef.update({
            'user.avatar': url,
          });
        }

        this.imageFile = null;
        this.imageName = '';
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
        console.log( `%cProfile.vue:%c Unsubscribed!`, 'background: #2196f3; color: #fff; border-radius: 3px; padding: .25rem;', '' );
      }
      if ( this.streamDocListener ) this.streamDocListener();
      if ( this.profileDocListener ) this.profileDocListener();
    },
  }
</script>
