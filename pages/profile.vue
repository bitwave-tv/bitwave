<template>
  <v-container>
    <v-layout column align-center>
      <v-flex class="my-3">
        <h1 class="ml-2">My Account</h1>
      </v-flex>

      <v-flex shrink>
        <v-card
          class="mb-2 pa-3"
        >
          <v-layout column>
            <v-flex>
              <v-layout
                justify-center
                align-center
                row
              >
                <v-flex shrink class="ma-3">
                  <v-avatar color="white" size="64">
                    <v-img
                      src="https://dispatch.sfo2.cdn.digitaloceanspaces.com/static/img/shield.png"
                      alt="avatar" />
                  </v-avatar>
                </v-flex>
                <v-flex shrink class="text-xs-center my-1">
                  <h3>THE REST OF THIS SHIT IS COMING SOON</h3>
                  <p>send complaints for $2/issue via paypal.</p>
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
        },
      }
    },

    methods: {
      async logout() {
        await auth.signOut();
        this.$router.push('/signout');
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
        // return this.user.displayName || 'null';
        return this.user.username || 'null';
      },
      uid() {
        if (this.$store.state.auth) {
          return this.$store.state.auth.uid;
        } else {
          return null;
        }
      },
      user() {
        // return this.$store.state.metaUser;
        return this.$store.state.user;
      },
    },

    mounted() {
      auth.onAuthStateChanged( user => this.authenticated(user) );
    },
  }
</script>
