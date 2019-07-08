<template>
  <div class="text-xs-center">
    <v-dialog
      v-model="show"
      width="500"
    >
      <template v-slot:activator="{ on }">
        <v-btn
          color="yellow"
          light
          small
          v-on="on"
        >
          Login
          <v-icon class="ml-1">input</v-icon>
        </v-btn>
      </template>

      <v-card>
        <v-card-title
          class="title yellow black--text"
          primary-title
        >
          Login to [bitwave.tv]
        </v-card-title>

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
              autocomplete="off"
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
              autocomplete="email"
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
              :rules="[ rules.required, rules.min ]"
              :type="showPassword ? 'text' : 'password'"
              name="input-10-1"
              label="Password"
              hint="At least 8 characters"
              autocomplete="password"
              counter
              validate-on-blur
              :loading="loading"
              :disabled="loading"
              @click:append="showPassword = !showPassword"
            ></v-text-field>

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

            <v-checkbox
              v-if="!signUp"
              id="remember-me"
              v-model="shouldStayLoggedIn"
              label="Stay logged in?"
              hide-details
              color="yellow"
              class="pt-0"
              :disabled="loading"
            ></v-checkbox>

            <v-alert
              v-model="alert"
              dismissible
              :type="alertType"
            >
              {{ alertMessage }}
            </v-alert>
          </v-form>

        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions>
          <v-btn
            small
            href="#"
            flat color="#2196f3"
            @click="resetPassword(user.email)"
          >Forgot Password?</v-btn>
          <v-spacer></v-spacer>
          <v-btn
            small
            color="yellow"
            outline
            @click="switchForm"
          >{{ signUp ? 'Login' : 'Sign Up' }}</v-btn>
          <v-btn
            color="yellow"
            flat
            @click="show = false"
          >
            CANCEL
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
  import { auth, db } from '@/plugins/firebase.js'

  export default {
    name: 'index',

    data() {
      return {
        show: false,


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
          min: value => (value && value.length >= 8) || 'Min 8 characters',
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
      // Toggle Register / Login
      switchForm() {
        this.signUp = !this.signUp;
        this.resetValidation();
        this.hideAlert();
        this.reset();
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
          console.log(`[LOGIN] User Cred: ${userCredential}`);
          const userId = userCredential.user.uid;
          const docRef = await db.collection('users').doc(userId).set({
            _username: username.toLowerCase(),
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

          if (process.client)
            console.log(`%cLogin.vue:%c Signing in... %o`, 'background: #2196f3; color: #fff; border-radius: 3px; padding: .25rem;', '', userCredential.user);
          else
            console.log('Login.vue: Signing in...', userCredential.user);
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
        this.$refs.loginForm.reset()
      },

      resetValidation () {
        this.$refs.loginForm.resetValidation();
        this.hideAlert();
      },

      async authenticated(user) {
        if (user) {
          if (process.client)
            console.log(`%cLogin.vue:%c Logged in! %o`, 'background: #2196f3; color: #fff; border-radius: 3px; padding: .25rem;', '', user);
          else
            console.log('Login: Logged in!', user);

          if (user.displayName) this.showSuccess(`Logged in! Welcome back, ${user.displayName}.`);

          await this.$store.dispatch('login', user);

          // setTimeout( () => this.$router.push('/profile'), 1500 );
          setTimeout( () => this.show = false, 1500 );
        } else {
          if (process.client)
            console.log(`%cLogin.vue:%c Not logged in!`, 'background: #2196f3; color: #fff; border-radius: 3px; padding: .25rem;', '');
          else
            console.log('Login: Not logged in.');
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
      },},

    computed: {},

    created() {
      auth.onAuthStateChanged( async user => await this.authenticated(user) );
    },
  }
</script>

<style lang='scss'>

</style>
