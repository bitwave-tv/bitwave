<template>
  <v-container>
    <v-layout column align-center>
      <v-flex class="my-3">
        <h1 class="ml-2">My Account</h1>
      </v-flex>
    </v-layout>

    <v-layout align-center>
      <v-flex>
        <v-card class="mb-4 pa-3">
          <v-layout column>
            <v-flex>
              <v-layout
                justify-center
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

                <v-flex>
                  <v-text-field
                    v-model="imageName"
                    :loading="uploadingAvatar"
                    label="Upload new profile photo"
                    color=""
                    solo
                    light
                    read-only
                    spellcheck="off"
                    autocomplete="off"
                    autocorrect="off"
                    autocapitalize="off"
                    prepend-inner-icon="attach_file"
                    @click='pickFile'
                  >
                    <template #append>
                      <v-btn
                        :loading="uploadingAvatar"
                        color="primary"
                        :outline="!imageFile"
                        @click="uploadFile"
                      >{{ imageFile ? 'save' : 'open' }}</v-btn>
                    </template>
                  </v-text-field>
                  <input
                    type="file"
                    style="display: none"
                    ref="image"
                    accept="image/*"
                    @change="onFilePicked"
                  >
                </v-flex>

                <v-flex>
                  <v-text-field
                    v-model="user.uid"
                    label="UserID"
                    disabled
                    outline
                  ></v-text-field>
                </v-flex>

                <v-flex>
                  <v-text-field
                    v-model="username"
                    label="username"
                    readonly
                    outline
                  ></v-text-field>
                </v-flex>

                <v-flex>
                  <v-text-field
                    v-model="user.email"
                    label="email"
                    readonly
                    outline
                  ></v-text-field>
                </v-flex>

                <v-flex>
                  <v-text-field
                    label="password"
                    type="password"
                    value="************"
                    disabled
                    outline
                  ></v-text-field>
                </v-flex>

                <v-layout>
                  <v-spacer />
                  <v-btn
                    color="yellow"
                    @click="logout"
                    light
                    disabled
                  >Edit</v-btn>
                  <v-btn
                    color="yellow"
                    @click="logout"
                    light
                  >Logout</v-btn>
                </v-layout>
              </v-layout>
            </v-flex>
          </v-layout>
        </v-card>
      </v-flex>
    </v-layout>

    <v-layout align-center>
      <v-flex
        v-if="showStreamInfo"
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
                outline
                hide-details
                :loading="streamDataLoading || saveLoading"
                @input="showSave = true"
              ></v-text-field>
            </v-flex>
            <v-flex>
              <v-textarea
                v-model="description"
                name="input-7-1"
                outline
                hide-details
                color="yellow"
                label="Stream Description (markdown supported)"
                auto-grow
                @input="showSave = true"
              ></v-textarea>
            </v-flex>
            <v-flex shrink>
              <v-switch
                v-model="streamData.nsfw"
                label="NSFW"
                color="yellow"
                hide-details
                @change="showSave = true"
              ></v-switch>
            </v-flex>
            <v-layout>
              <v-spacer/>
              <v-btn
                :disabled="!showSave"
                :loading="saveLoading"
                color="yellow"
                outline
                @click="updateStreamData"
              >save</v-btn>
            </v-layout>
          </v-layout>
        </v-card>
      </v-flex>
    </v-layout>

    <v-layout align-center>
      <v-flex
        v-if="showStreamInfo"
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
                outline
                hide-details
                :loading="streamDataLoading"
              ></v-text-field>
            </v-flex>
            <v-flex>
              <v-text-field
                v-model="streamData.key"
                ref="streamkeyinput"
                label="Stream Key"
                color="yellow"
                readonly
                outline
                :messages="keyMessage"
                :loading="streamDataLoading || keyLoading"
                :type="showKey ? 'text' : 'password'"
                :append-icon="showKey ? 'visibility' : 'visibility_off'"
                @click:append="showKey = !showKey"
                @click="showKey = !showKey"
                @focus="showKey = !showKey"
              ></v-text-field>
            </v-flex>
            <v-layout>
              <v-spacer/>
              <v-btn
                color="yellow"
                outline
                :loading="keyLoading"
                @click="resetStreamKey"
              >Reset</v-btn>
              <v-btn
                color="yellow"
                light
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

  import { mapGetters } from 'vuex'

  export default {

    name: 'profile',

    middleware: 'auth',

    data() {
      return {
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
      async logout() {
        await auth.signOut();
        this.$router.push('/signout');
      },

      async authenticated(user) {
        if (user) {
          console.log(`[profile] User:`, user);
          if ( !this.user ) await this.$store.dispatch('login', user);
        } else {
          this.$router.push('/login');
        }
      },

      getStreamData () {
        this.streamDataLoading = true;
        // const userId = this.user.uid;
        const stream = this.user.username.toLowerCase();
        const streamRef = db.collection('streams').doc(stream);
        return streamRef.onSnapshot( async doc => {
          this.showStreamInfo = doc.exists;
          if (this.showStreamInfo) await this.streamDataChanged( doc.data() );
        }, () => this.showStreamInfo = false );
      },

      getProfileData () {
        this.profileDataLoading = true;
        const userId = this.user.uid;
        const profileRef = db.collection('users').doc(userId);
        return profileRef.onSnapshot( async doc => {
          await this.profileDataChanged( doc.data() );
        }, err => console.log(err) );
      },

      async profileDataChanged (data) {
        console.log(`[profile] Profile Data Changed:`, data);
        if (data.avatar) this.imageUrl = data.avatar;
        this.streamkey = data.streamkey;
        this.streamData.key = `${this.user.username}?key=${this.streamkey}`;

        // rest of profile is managed by store
        this.$store.commit('setUser', data);
        this.$store.commit('setUserCookie', data);
        this.profileDataLoading = false;
      },

      async streamDataChanged (data) {
        console.log(`[profile] Stream Data Changed`, data);
        this.streamData.title = data.title;
        this.streamData.nsfw = data.nsfw;
        this.description = data.description;
        this.streamDataLoading = false;
      },

      async updateStreamData () {
        this.saveLoading = true;
        const title = this.streamData.title;
        const nsfw = this.streamData.nsfw;
        const description = this.description;
        const stream = this.user.username.toLowerCase();
        const streamRef = db.collection('streams').doc(stream);
        await streamRef.update({
          nsfw,
          title,
          description
        });
        this.saveLoading = false;
        this.showSave = false;
      },

      async resetStreamKey () {
        this.keyLoading = true;
        const key = Math.random().toString(16).substr(2, 9);
        const userId = this.user.uid;
        const docRef = db.collection('users').doc(userId);
        await docRef.update({
          streamkey: key,
        });
        await this.kickStream();
        this.keyLoading = false;
      },

      async kickStream() {
        const mode = 'drop';
        const app = 'live';
        const user = this.user.username;
        const server = 'stream.bitwave.tv';
        const url = `https://${server}/control/${mode}/publisher?app=${app}&name=${user}`;
        await this.$axios.$get(url);
      },

      copyToClipboard () {
        const initialState = this.showKey;
        this.$copyText(this.streamData.key).then( () => {
          this.keyMessage = ['Copied to clipboard'];
          this.$refs['streamkeyinput'].focus();
        }, (error) => {
          console.log(error);
          this.keyMessage = 'Failed to copy to clipboard';
        });

        setTimeout( () => {
          this.showKey = initialState;
          this.keyMessage = 'Click to reveal key';
          this.$refs['streamkeyinput'].blur();
        }, 3000);
      },

      pickFile() {
        this.$refs.image.click ();
      },

      onFilePicked(e) {
        const files = e.target.files;
        if(files[0] !== undefined) {
          this.imageName = files[0].name;
          if(this.imageName.lastIndexOf('.') <= 0) {
            return;
          }
          const fr = new FileReader ();
          fr.readAsDataURL(files[0]);
          fr.addEventListener('load', () => {
            this.imageUrl = fr.result;
            this.imageFile = files[0]; // this is an image file that can be sent to server...
          })
        } else {
          this.imageName = '';
          this.imageFile = null;
          this.imageUrl = '';
        }
      },

      async uploadFile() {
        if ( !this.imageFile ) {
          this.$refs.image.click ();
          return false;
        }
        this.uploadingAvatar = true;
        const formData = new FormData();
        formData.append('upload', this.imageFile);
        try {
          // const { data } = await this.$axios.post('http://localhost:4000/upload/image', formData, {
          const { data } = await this.$axios.post('https://api.bitwave.tv/upload', formData, {
            headers: {
              'content-type': 'multipart/formdata',
            },
          });
          console.log(`Upload successfull.`);
          console.log(data);
          this.imageUrl = data.transforms.find(image => image.id === 'thumbnail').location;
          this.saveUserAvatar(this.imageUrl);
        } catch (error) {
          console.log(`Upload failed!`);
          console.log(error.message);
        }
        this.uploadingAvatar = false;
      },

      async saveUserAvatar(url) {
        const userId = this.user.uid;
        const docRef = db.collection('users').doc(userId);
        await docRef.update({
          avatar: url,
        });

        if (this.showStreamInfo) {
          const stream = this.user.username.toLowerCase();
          const streamRef = db.collection('streams').doc(stream);
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
        user: 'user'
      }),
      username() {
        return this.user.username || 'null';
      },
      uid() {
        if (this.$store.state.auth) {
          return this.$store.state.auth.uid;
        } else {
          return null;
        }
      },
    },

    mounted() {
      auth.onAuthStateChanged( user => this.authenticated(user) );
      this.streamDocListener = this.getStreamData();
      this.profileDocListener = this.getProfileData();
    },

    beforeDestroy() {
      if (this.streamDocListener) this.streamDocListener();
      if (this.profileDocListener) this.profileDocListener();
    }
  }
</script>
