<template>
  <v-container
    class="pt-0"
    fluid
  >
    <v-layout
      column
      justify-center
    >
      <v-flex class="my-3" ml-2>
        <h1>My Account</h1>
      </v-flex>

      <v-flex>
        <v-card
          class="mb-2"
        >
          <v-layout
            row
            style="align-items: center;"
          >
            <v-flex shrink class="ma-3">
              <v-avatar color="white" size="64">
                <v-img src="https://dispatch.sfo2.cdn.digitaloceanspaces.com/static/img/shield.png" alt="avatar" />
              </v-avatar>
            </v-flex>

            <v-flex class="text-xs-center my-3">
              <h3>THE REST OF THIS SHIT IS COMING SOON</h3>
              <p>send complaints for $2/issue via paypal.</p>
              <v-btn
                color="red"
                href="https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=JAN2HKQ9CTYZY&source=url"
                target="_blank"
              >COMPLAINTS</v-btn>
            </v-flex>

            <v-flex v-if="user">
              <v-layout v-if="user">

                <v-flex>
                  <!--<v-text-field
                    v-model="username"
                    label="username"
                    readonly
                    outline
                  ></v-text-field>-->
                </v-flex>

                <v-flex>
                  <p>{{ user.email }}</p>
                </v-flex>

                <v-flex>
                  <p>{{ user.uid }}</p>
                </v-flex>

              </v-layout>

            </v-flex>

            <v-flex shrink>
              <v-btn
                class="ma-4"
                color="yellow"
                @click="logout"
                light
              >Logout</v-btn>
            </v-flex>

          </v-layout>
        </v-card>
      </v-flex>

    </v-layout>
  </v-container>
</template>

<script>
  import { auth, db } from '@/plugins/firebase.js'

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
        }
      }
    },

    methods: {
      async logout() {
        await auth.signOut();
        this.$router.push('/signout');
      },

      showErrorToast(message) {
        this.showError = true;
        this.error.message = message;
      },

      showSuccessToast(message) {
        this.showSuccess = true;
        this.success.message = message;
      },

      async authenticated(user) {
        if (user) {
          console.log(user);
          if ( !this.user ) await this.$store.dispatch('login', user);
        } else {
          this.$router.push('/login');
        }
      },
    },

    computed: {
      username() {
        if (!!this.user) {
          return this.user.displayName || 'NULL';
        }
      },
      uid() {
        if (this.$store.state.auth) {
          return this.$store.state.auth.uid;
        } else {
          return null;
        }
      },
      user() {
        return this.$store.state.user;
        /*if (this.$store.state.user) {
          return this.$store.state.user;
        } else {
          return null;
        }*/
      },
    },

    created() {
      auth.onAuthStateChanged( user => this.authenticated(user) );
    },

  }
</script>
