<template>
  <v-container
    class="pt-0"
    fluid
  >
    <v-layout
      column
      justify-center
      align-center
    >
      <v-flex>
        <v-card class="my-3">

          <v-card-title>
            <h3>My Account</h3>
          </v-card-title>

          <hr>

          <v-card-text>
            <v-form
              ref="form"
              v-model="valid"
              lazy-validation
            >
              <v-text-field
                v-model="username"
                :counter="true"
                :rules="[rules.name]"
                label="Username"
                required
              ></v-text-field>

              <v-text-field
                v-model="email"
                :rules="rules.email"
                label="E-mail"
                required
              ></v-text-field>

              <v-text-field
                v-model="password"
                :append-icon="showPassword ? 'visibility' : 'visibility_off'"
                :rules="[rules.required]"
                :type="showPassword ? 'text' : 'password'"
                name="input-10-1"
                label="Password"
                hint="At least 8 characters"
                counter
                @click:append="showPassword = !showPassword"
              ></v-text-field>

              <v-checkbox
                v-model="checkbox"
                :rules="[v => !!v || 'You must agree to continue!']"
                label="I have read and agree to the ToS."
                color="success"
                required
              ></v-checkbox>

              <v-btn
                :disabled="!valid"
                color="success"
                @click="validate"
              >
                Validate
              </v-btn>

              <v-btn
                color="error"
                @click="reset"
              >
                Reset Form
              </v-btn>

              <v-btn
                color="warning"
                @click="resetValidation"
              >
                Reset Validation
              </v-btn>
            </v-form>
          </v-card-text>

          <v-card-actions>
            <v-spacer />
            <v-btn
              color="primary"
              flat
              nuxt
              to="/"
            >Login</v-btn>
          </v-card-actions>

        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
  import { auth, db } from '@/plugins/firebase.js'

  const Cookie = process.client ? require('js-cookie') : undefined;

  export default {
    name: 'login',

    data() {
      return {
        valid: true,
        username: '',
        email: '',
        password: '',
        showPassword: false,
        checkbox: false,
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
      validate () {
        if (this.$refs.form.validate()) {
          this.snackbar = true
        }
      },
      reset () {
        this.$refs.form.reset()
      },
      resetValidation () {
        this.$refs.form.resetValidation()
      },

      async authenticated(user) {
        if (user) {
          console.log(`%cLogin.vue:%c Logged in! %o`, 'background: #2196f3; color: #fff; border-radius: 3px; padding: .25rem;', '', user);

          await this.$store.dispatch('login', user);

          // this.showSuccessToast(`Logged in!`);

          this.$router.push('/profile');
        } else {
          // this.showErrorToast(`Not Logged In!`);
          console.log(`%cLogin.vue:%c Not Logged In!`, 'background: #2196f3; color: #fff; border-radius: 3px; padding: .25rem;', '');
        }
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
