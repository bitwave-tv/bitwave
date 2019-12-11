<template>
  <v-container
    grid-list-md
  >
    <v-layout
      row
      justify-space-around
      class="mb-4"
    >
      <v-flex xs12 md10 lg8 xl6>
        <v-img
          src="https://dispatch.sfo2.cdn.digitaloceanspaces.com/static/img/bitwave_banner.png"
          alt="bitwave tv live streaming platform" />
      </v-flex>
    </v-layout>

    <v-layout
      row
      justify-space-around
    >
      <v-flex xs12 md8 lg6 xl4>
        <v-card class="my-3" color="grey darken-4">

          <v-sheet color="yellow" class="d-flex align-center pa-3 black--text">
            <v-icon class="mr-2" large color="black">ondemand_video</v-icon>
            <h2>
              [bitwave.tv] {{ signUp ? 'Register' : 'Login' }}
            </h2>
          </v-sheet>

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
                outlined
                clearable
                :loading="loading"
                :disabled="loading"
              />

              <v-text-field
                id="email"
                key="email"
                v-model="user.email"
                :rules="rules.email"
                label="E-mail"
                autocomplete="email"
                required
                validate-on-blur
                outlined
                clearable
                :loading="loading"
                :disabled="loading"
              />

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
                outlined
                clearable
                :loading="loading"
                :disabled="loading"
                @click:append="showPassword = !showPassword"
              />

              <v-checkbox
                v-if="signUp"
                label=" I confirm that I am eighteen (18) years of age or older."
                color="yellow"
                class="pt-0 mt-0 mb-3"
                :rules="[ val => val || 'You must be 18 to use this site!' ]"
                :disabled="loading"
              />

              <v-btn
                v-if="!signUp"
                block
                color="yellow"
                class="black--text"
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
                class="black--text"
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
                class="pt-0 mb-3"
                :disabled="loading"
              />

              <v-alert
                v-model="alert"
                class="mt-4 mb-0"
                dismissible
                :type="alertType"
                transition="fade-transition"
              >
                {{ alertMessage }}
              </v-alert>
            </v-form>
          </v-card-text>

          <v-divider/>

          <v-card-actions>
            <v-btn
              small
              href="#"
              text
              color="yellow"
              @click="resetPassword(user.email)"
            >Forgot Password?</v-btn>
            <v-spacer />
            <v-btn
              small
              color="yellow"
              outlined
              @click="switchForm"
            >{{ signUp ? 'Login' : 'Sign Up' }}</v-btn>
          </v-card-actions>

        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
  import { auth } from '@/plugins/firebase.js'

  import { mapActions } from 'vuex'
  import { VStore } from '@/store'

  export default {

    name: 'login',

    middleware: 'not-auth',

    data() {
      return {
        unsubAuthChanged: null,
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
      ...mapActions({
        registerUser : VStore.$actions.registerUser,
        loginUser    : VStore.$actions.loginUser,
        login        : VStore.$actions.login,
      }),

      switchForm () {
        this.signUp = !this.signUp;
        this.resetValidation();
        this.hideAlert();
        this.reset();
      },

      // Create User
      async createUser ( username, email, password ) {
        if ( !this.$refs.loginForm.validate() ) return;

        this.$ga.event({
          eventCategory : 'login',
          eventAction   : 'register',
        });

        this.loading = true;
        try {
          this.registerUser({
            credential: { username, email, password },
            stayLoggedIn: this.shouldStayLoggedIn,
          });
          this.showSuccess( 'User Created!' );
        } catch ( error ) {
          console.log( error );
          this.showError( error );
        }
        this.loading = false;
      },

      // Sign In
      async signIn ( email, password ) {
        if ( !this.$refs.loginForm.validate() ) return;

        this.$ga.event({
          eventCategory : 'login',
          eventAction   : 'login',
        });

        this.loading = true;
        try {
          this.loginUser({
            credential: { email, password },
            stayLoggedIn: this.shouldStayLoggedIn,
          });
        } catch ( error ) {
          this.showError( error.message );
          console.log( error.message );
        }
        this.loading = false;
      },

      async resetPassword ( email ) {
        this.$ga.event({
          eventCategory : 'login',
          eventAction   : 'reset password',
        });

        try {
          await auth.sendPasswordResetEmail( email );
          this.showSuccess( 'Check email for reset link.' );
        } catch ( error ) {
          this.showError( error.message );
        }
      },

      validate () {
        if ( this.$refs.form.validate() )
          this.showError('Please fix errors highlighted in red.');
      },

      reset () {
        this.$refs.loginForm.reset()
      },

      resetValidation () {
        this.$refs.loginForm.resetValidation();
        this.hideAlert();
      },

      async authenticated ( user ) {
        if ( user ) {
          if ( process.client )
            console.log(`%cLogin.vue:%c Logged in! %o`, 'background: #2196f3; color: #fff; border-radius: 3px; padding: .25rem;', '', user);

          if ( user.displayName ) this.showSuccess(`Logged in! Welcome back, ${user.displayName}.`);

          await this.login( user );

          setTimeout( () => this.$router.push( '/profile' ), 1500 );
        } else {
          if ( process.client )
            console.log(`%cLogin.vue:%c Not logged in!`, 'background: #2196f3; color: #fff; border-radius: 3px; padding: .25rem;', '');
        }
      },

      showError ( message ) {
        this.alertType = 'error';
        this.alert = true;
        this.alertMessage = message;
      },

      showSuccess ( message ) {
        this.alertType = 'success';
        this.alert = true;
        this.alertMessage = message;
      },

      hideAlert () {
        this.alert = false;
      },
    },

    mounted () {
      this.unsubAuthChanged = auth.onAuthStateChanged( async user => await this.authenticated( user ) );
    },

    beforeDestroy () {
      if ( this.unsubAuthChanged ) {
        this.unsubAuthChanged();
        console.log(`%cLogin.vue:%c Unsubscribed!`, 'background: #2196f3; color: #fff; border-radius: 3px; padding: .25rem;', '');
      }
    },
  }
</script>
