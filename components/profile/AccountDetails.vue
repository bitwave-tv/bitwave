<template>
  <div>
    <v-layout justify-center>
      <v-flex
        xs12
        sm10
        md8
        lg6
      >
        <v-card class="mb-4 pa-3">

          <div class="d-flex justify-space-around align-center">
            <v-avatar color="grey darken-4" size="100" class="ma-3">
              <img
                :src="`${imageUrl}` || `https://cdn.bitwave.tv/static/img/shield.png`"
                alt="avatar"
              />
            </v-avatar>
            <div class="flex-shrink-1 text-xs-center my-1">
              <h3>IT'S JUST THE FLU BRO</h3>
              <p>send in complaints for $5 / issue.</p>
              <v-btn
                color="red"
                href="https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=JAN2HKQ9CTYZY&source=url"
                target="_blank"
              >COMPLAINTS</v-btn>
            </div>
          </div>

          <div v-if="user" class="my-2">

            <h2 class="mb-2">Profile</h2>

            <div class="d-flex align-center mb-5">
              <v-file-input
                ref="image"
                color="blue"
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
              <v-btn
                large
                class="flex-shrink-1 ml-2"
                :loading="uploadingAvatar"
                color="primary"
                outlined
                :disabled="!imageFile"
                @click="uploadFile"
              >SAVE</v-btn>
            </div>

            <v-text-field
              v-show="false"
              v-model="user.uid"
              label="UserID"
              readonly
              outlined
            />

            <v-text-field
              v-model="username"
              messages="You cannot change your username"
              class="mb-2"
              label="username"
              readonly
              outlined
            />

            <v-form
              ref="updatepw"
              @submit.prevent="updateProfile"
            >
              <v-text-field
                v-model="email"
                label="email"
                autocomplete="email username"
                id="username"
                name="username"
                outlined
                :class="{ 'mb-2': email !== user.email }"
                :hint="email === user.email ? '' : 'This will change your login email'"
                persistent-hint
                :clearable="editProfile"
                :readonly="!editProfile"
                :error-messages="emailError"
                :loading="savingProfile && email !== user.email"
              />

              <v-text-field
                v-model="currPassword"
                :label="editProfile ? 'current password' : 'password'"
                type="password"
                autocomplete="current-password"
                value="************"
                :disabled="!editProfile"
                :clearable="editProfile"
                outlined
                required
                validate-on-blur
                :error-messages="pwError"
                :loading="savingProfile"
              />

              <v-slide-y-transition>
                <div v-if="editProfile">

                  <v-text-field
                    v-model="newPassword"
                    label="new password"
                    hint="optional - only if you wish to change your password"
                    persistent-hint
                    type="password"
                    autocomplete="new-password"
                    :clearable="editProfile"
                    outlined
                    :error="!!newPwError"
                    :error-messages="newPwError"
                    :loading="savingProfile && !!newPassword"
                  />

                  <!--<v-text-field
                    v-model="confPassword"
                    label="confirm new password"
                    type="password"
                    autocomplete="new-password"
                    outlined
                    required
                    validate-on-blur
                  />-->

                  <div class="d-flex mb-3">
                    <v-spacer />
                    <v-btn
                      color="primary"
                      class="mr-2 black--text"
                      :loading="savingProfile"
                      type="submit"
                    >Save</v-btn>
                  </div>

                  <v-alert
                    :value="!!newPwError || !!pwError"
                    class="mb-4"
                    dismissible
                    type="error"
                    transition="slide-y-transition"
                  >
                    {{ newPwError || pwError }}
                  </v-alert>

                </div>
              </v-slide-y-transition>

            </v-form>

            <div class="d-flex">
              <v-spacer />
              <v-btn
                :color="editProfile ? 'error' : 'primary'"
                :class="{ 'black--text': !editProfile }"
                class="mr-2"
                @click="toggleEdit"
              >{{ editProfile ? 'Cancel' : 'Edit' }}</v-btn>
              <v-btn
                color="primary"
                @click="logout"
                class="black--text"
              >Logout</v-btn>
            </div>

          </div>
        </v-card>
      </v-flex>
    </v-layout>
  </div>
</template>

<script>
  import { mapGetters, mapActions } from 'vuex'
  import { VStore } from '@/store';
  import { auth, db, EmailAuthProvider } from '@/plugins/firebase';

  export default {
    name: 'AccountDetails',

    data () {
      return {
        imageUrl: null,
        uploadingAvatar: false,
        imageFile: null,
        imageName: null,

        editProfile: false,

        email: '',
        emailError: null,

        currPassword: '************',
        newPassword: '',
        confPassword: '',

        savingProfile: false,
        pwError: null,
        newPwError: null,
      };
    },

    methods: {
      ...mapActions({
        logoutStore: VStore.$actions.logout,
      }),

      async logout () {
        await this.logoutStore();
      },

      onFilePicked ( file ) {
        if ( !!file ) {
          this.imageName = file.name;
          if( this.imageName.lastIndexOf('.') <= 0 ) return;

          const fr = new FileReader ();
          fr.readAsDataURL( file );
          fr.addEventListener('load', () => {
            this.imageUrl  = fr.result;
            this.imageFile = file; // this is an image file that can be sent to server...
          });
        } else {
          this.imageName =   '';
          this.imageFile = null;
          this.imageUrl  = this.user.avatar || '';
        }
      },

      async uploadFile () {
        if ( !this.imageFile ) return false;
        this.uploadingAvatar = true;
        const formData = new FormData();
        formData.append( 'upload', this.imageFile );
        try {
          const { data } = await this.$axios.post(
            'https://api.bitwave.tv/upload',
            formData,
            { headers: { 'content-type': 'multipart/formdata', }, }
          );
          console.log( `Upload successfull.` );
          this.$toast.success( 'Upload successful', { icon: 'done', duration: 5000 } );
          console.log( data );

          if ( data.hasOwnProperty( 'avatars' ) ) {
            // Supports additional webp images
            this.imageUrl = data.transforms.find( image => image.id === 'thumbnail' ).location;
            this.saveUserAvatars( this.imageUrl, data.avatars );
          } else {
            // Fallback code
            this.imageUrl = data.transforms.find( image => image.id === 'thumbnail' ).location;
            this.saveUserAvatar( this.imageUrl );
          }

        } catch ( error ) {
          console.log( `Upload failed!` );
          this.$toast.error( 'Failed to upload image', { icon: 'error', duration: 5000 } );
          console.log( error.message );
        }
        this.uploadingAvatar = false;
      },

      async saveUserAvatars ( url, avatars ) {
        const userId = this.uid;
        const docRef = db.collection( 'users' ).doc( userId );
        await docRef.update({
          avatar: url,
          avatars: avatars,
        });

        if ( this.isStreamer ) {
          const stream = this.username.toLowerCase();
          const streamRef = db.collection( 'streams' ).doc( stream );
          await streamRef.update({
            'user.avatar': url,
            'user.avatars': avatars,
          });
        }

        this.imageFile = null;
        this.imageName = '';

        this.$ga.event({
          eventCategory : 'profile',
          eventAction   : 'update avatar',
          eventLabel    : this.username.toLowerCase(),
        });
      },

      async saveUserAvatar ( url ) {
        const userId = this.uid;
        const docRef = db.collection( 'users' ).doc( userId );
        await docRef.update({
          avatar: url,
        });

        if ( this.isStreamer ) {
          const stream = this.username.toLowerCase();
          const streamRef = db.collection( 'streams' ).doc( stream );
          await streamRef.update({
            'user.avatar': url,
          });
        }

        this.imageFile = null;
        this.imageName = '';

        this.$ga.event({
          eventCategory : 'profile',
          eventAction   : 'update avatar',
          eventLabel    : this.username.toLowerCase(),
        });
      },

      toggleEdit () {
        this.editProfile = !this.editProfile;

        if ( this.editProfile ) {
          this.currPassword = this.newPassword = this.confPassword = '';
        } else {
          this.newPwError = this.pwError = this.emailError = null;
          this.currPassword = '************';
          this.email = this.user.email;
        }
      },

      async updateProfile () {
        this.newPwError = this.pwError = this.emailError = null;
        this.savingProfile = true;

        const _user = auth.currentUser;

        // re-authenticate user
        try {
          const credential = await EmailAuthProvider.credential( this.user.email, this.currPassword );
          await _user.reauthenticateWithCredential( credential );
        } catch ( error ) {
          this.savingProfile = false;
          this.pwError = error.message;
          console.log( error );
          return false;
        }

        // update email
        try {
          // only update email changed
          if ( this.email !== this.user.email ) {
            await _user.updateEmail( this.email );
            await db.collection('users').doc(this.uid).update({
              email: this.email
            });
            this.$toast.success( 'Email address updated.', { icon: 'done', duration: 5000 } );
          }
        } catch ( error ) {
          this.savingProfile = false;
          this.emailError = error.message;
          console.log( error );
          return false;
        }

        // update password
        try {
          if ( this.newPassword ) {
            await _user.updatePassword( this.newPassword );
            this.$toast.success( 'Password updated.', { icon: 'done', duration: 5000 } );
          }
        } catch ( error ) {
          this.savingProfile = false;
          this.newPwError = error.message;
          console.log( error );
          return false;
        }
        this.editProfile = false;
        this.savingProfile = false;
        return true;
      },

    },

    watch: {
      user ( newVal ) {
        if ( !newVal ) return;
        this.imageUrl = newVal.avatar;
        this.email    = newVal.email;
      },
    },

    computed: {
      ...mapGetters({
        uid      : VStore.$getters.getUID,
        user     : VStore.$getters.getUser,
        username : VStore.$getters.getUsername,
        isStreamer : VStore.$getters.isStreamer,
      }),
    },

    mounted () {
      this.imageUrl = this.user.avatar;
      this.email    = this.user.email;
    },
  };
</script>

<style lang='scss'>

</style>
