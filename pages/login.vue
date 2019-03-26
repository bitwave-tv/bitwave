<template>
  <v-container
    grid-list-md
  >
    <v-layout
      row
      justify-space-around
      class="mb-4"
    >
      <v-flex xs12 md8 lg6>
        <v-img src="https://dispatch.sfo2.cdn.digitaloceanspaces.com/static/img/bitwave_banner.png" alt="bitwave tv streaming platform banner" />
      </v-flex>
    </v-layout>

    <v-layout
      row
      justify-space-around
    >
      <v-flex xs12 md8 lg4>
        <v-card class="my-3">

          <v-card-title>
            <h2>
              <v-icon class="mr-1">ondemand_video</v-icon>
              {{ `${signUp ? 'Create a' : ''} BitWave.tv Account` }}
            </h2>
          </v-card-title>

          <hr>

          <v-card-text>
            <v-form
              ref="loginForm"
              v-model="valid"
              onSubmit="return false"
            >
              <v-text-field
                v-if="signUp"
                id="username"
                key="username"
                ref="username"
                v-model="user.username"
                :counter="true"
                :rules="[ rules.name ]"
                label="Username"
                required
                validate-on-blur
                :loading="loading"
                :disabled="loading"
              ></v-text-field>

              <v-text-field
                id="email"
                key="email"
                v-model="user.email"
                :rules="rules.email"
                label="E-mail"
                required
                validate-on-blur
                :loading="loading"
                :disabled="loading"
              ></v-text-field>

              <v-text-field
                id="password"
                key="password"
                v-model="user.password"
                :append-icon="showPassword ? 'visibility' : 'visibility_off'"
                :rules="[ rules.required, v => v.length > 8 || 'Min 8 Characters' ]"
                :type="showPassword ? 'text' : 'password'"
                name="input-10-1"
                label="Password"
                hint="At least 8 characters"
                counter
                validate-on-blur
                :loading="loading"
                :disabled="loading"
                @click:append="showPassword = !showPassword"
              ></v-text-field>

              <v-checkbox
                v-if="!signUp"
                id="remember-me"
                v-model="shouldStayLoggedIn"
                label="Stay logged in?"
                hide-details
                color="yellow"
                class="pt-0 mb-3"
                :disabled="loading"
              ></v-checkbox>

              <v-alert
                v-model="alert"
                dismissible
                :type="alertType"
              >
                {{ alertMessage }}
              </v-alert>

              <v-btn
                v-if="!signUp"
                block
                color="yellow"
                light
                :loading="loading"
                type="submit"
                @click="signIn(user.email, user.password)"
              >
                Login
              </v-btn>

              <v-btn
                v-if="signUp"
                block
                color="yellow"
                light
                :loading="loading"
                type="submit"
                @click="createUser(user.username, user.email, user.password)"
              >
                Register
              </v-btn>

              <v-layout
                v-if="false"
                justify-space-between
                row
              >
                <v-flex>
                  <v-btn
                    :disabled="!valid"
                    color="success"
                    @click="validate"
                  >
                    Validate
                  </v-btn>
                </v-flex>

                <v-flex>
                  <v-btn
                    color="error"
                    @click="reset"
                  >
                    Reset Form
                  </v-btn>
                </v-flex>

                <v-flex>
                  <v-btn
                    color="warning"
                    @click="resetValidation"
                  >
                    Reset Validity
                  </v-btn>
                </v-flex>

              </v-layout>
            </v-form>
          </v-card-text>

          <hr/>

          <v-card-actions>
            <v-btn
              small
              href="#"
              flat color="#2196f3"
              @click="resetPassword(user.email)"
            >
              Forgot Password?
            </v-btn>
            <v-spacer />
            <v-btn
              small
              color="#2196f3"
              outline
              @click="switchForm"
            >{{ signUp ? 'Login' : 'Sign Up' }}</v-btn>
          </v-card-actions>

        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
  import { auth, db } from '@/plugins/firebase.js'
  import axios from '../.nuxt/axios';

  const Cookie = process.client ? require('js-cookie') : undefined;

  export default {

    name: 'login',

    middleware: 'not-auth',

    data() {
      return {
        signUp: false,
        loading: false,
        alert: false,
        alertMessage: '',
        alertType: 'error',
        valid: true,
        user: {
          username: '',
          email: '',
          password: '',
        },
        showPassword: false,
        shouldStayLoggedIn: true,
        rules: {
          required: value => !!value || 'Required.',
          min: value => value.length >= 8 || 'Min 8 characters',
          name: v => !!v || 'Name is required',
          email: [
            v => !!v || 'Email is required',
            v => /.+@.+/.test(v) || 'E-mail must be valid',
          ],
          emailMatch: () => (`The email and password you entered don't match`),
        },
      }
    },

    methods: {
      switchForm() {
        this.signUp = !this.signUp;
        this.resetValidation();
        this.hideAlert();
      },

      // Create User
      async createUser(username, email, password) {
        if ( !this.$refs.loginForm.validate() ) return;

        this.loading = true;

        // Verify Username is valid and not taken
        try {
          const checkUsername = await this.$axios.$post('https://api.bitwave.tv/api/check-username', { username: username });
          if (!checkUsername.valid) {
            this.showError(checkUsername.error);
            this.loading = false;
            return;
          }
        } catch (error) {
          console.log(error);
          this.showError(error);
          this.loading = false;
          return;
        }

        try {
          const userCredential = await auth.createUserWithEmailAndPassword(email, password);
          await userCredential.user.updateProfile({
            displayName: username,
          });
          console.log(userCredential);
          const userId = userCredential.user.uid;
          const docRef = await db.collection('users').doc(userId).set({
            uid: userId,
            username: username,
            email: email,
          });
          console.log(docRef);
          this.showSuccess('User Created!');
        } catch (error) {
          this.showError(error.message);
          console.log(error.message);
          this.loading = false;
        }
      },

      // Sign In
      async signIn(email, password) {
        if (!this.$refs.loginForm.validate()) return;

        this.loading = true;
        try {
          await auth.setPersistence(this.shouldStayLoggedIn ? 'local' : 'session'); // firebase.auth.Auth.Persistence.SESSION
          const userCredential = await auth.signInWithEmailAndPassword(email, password);

          console.log(`%cLogin.vue:%c Signing in... %o`, 'background: #2196f3; color: #fff; border-radius: 3px; padding: .25rem;', '', userCredential.user);
        } catch (error) {
          this.showError(error.message);
          console.log(error.message);
          this.loading = false;
        }
      },

      async resetPassword(email) {
        try {
          await auth.sendPasswordResetEmail(email);
          this.showSuccess('Check email for reset link.');
        } catch (error) {
          this.showError(error.message);
        }
      },

      validate () {
        if (this.$refs.form.validate()) {
          this.showError('Please fix errors highlighted in red.');
        }
      },

      reset () {
        this.$refs.form.reset()
      },

      resetValidation () {
        this.$refs.loginForm.resetValidation();
        this.hideAlert();
      },

      async authenticated(user) {
        if (user) {
          console.log(`%cLogin.vue:%c Logged in! %o`, 'background: #2196f3; color: #fff; border-radius: 3px; padding: .25rem;', '', user);

          this.showSuccess(`Logged in! Welcome back, ${user.displayName}.`);

          await this.$store.dispatch('login', user);

          setTimeout( () => this.$router.push('/profile'), 1500 );
        } else {
          // this.showSuccess(`Successfully logged out! See you later. `);
          console.log(`%cLogin.vue:%c Not Logged In!`, 'background: #2196f3; color: #fff; border-radius: 3px; padding: .25rem;', '');
        }
      },

      showError(message) {
        this.alertType = 'error';
        this.alert = true;
        this.alertMessage = message;
      },

      showSuccess(message) {
        this.alertType = 'success';
        this.alert = true;
        this.alertMessage = message;
      },

      hideAlert() {
        this.alert = false;
      },
    },

    computed: {},

    created() {
      auth.onAuthStateChanged( async user => await this.authenticated(user) );
    },
  }
</script>

<style lang='scss'>

</style>
