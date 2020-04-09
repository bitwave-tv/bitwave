<template>
  <v-container>
    <v-row class="justify-space-around">
      <v-col
        cols="12"
        :md="userType === 'Streamer' ? 6 : 8"
      >
        <v-card class="pa-3" v-if="userType === 'Streamer'">
          <h2 class="mb-2">
            <v-icon class="mr-2">policy</v-icon>
            You're Still Here?
          </h2>

          <v-card-text class="pa-0 mb-3">
            <div class="subtitle">Go start streaming!</div>
            <div class="title">
              Or maybe you'd like to setup your profile first?
              <br>
              Add a stream title and a stream description...
            </div>
            <div>Or maybe to edit your profile photo?</div>
            <div>That's about all the options...</div>
          </v-card-text>

          <div class="d-flex">
            <v-btn
              class="mr-2"
              color="primary black--text"
              to="/profile"
              depressed
            >
              <v-icon class="mr-2">account_circle</v-icon>
              Edit Profile
            </v-btn>
            <v-btn
              color="primary"
              to="/profile"
              outlined
            >
              <v-icon class="mr-2" small>live_tv</v-icon>
              My Channel
            </v-btn>
          </div>
        </v-card>

        <template v-else>
          <div class="display-1 ml-5 mb-2 font-weight-thin yellow--text">Get a Streamkey</div>
          <v-card>
            <v-card-title>
              Checking Account Eligibility...
            </v-card-title>
            <v-card-text>
              <v-alert
                v-model="alert.show"
                :type="alert.type"
              >
                {{ alert.message }}
              </v-alert>

              <v-alert
                v-model="requestError.show"
                :type="requestError.type"
              >
                {{ requestError.message }}
              </v-alert>

              <v-card-actions>
                <v-btn
                  color="primary"
                  :disabled="alert.type === 'error'"
                  :light="alert.type !== 'error'"
                  @click="requestKey"
                >
                  Create My Key
                </v-btn>
                <v-btn
                  v-if="alert.type === 'error'"
                  color="primary"
                  :to="buttonLink"
                  outlined
                >
                  {{ buttonText }}
                </v-btn>
              </v-card-actions>
            </v-card-text>
          </v-card>
        </template>
      </v-col>

      <v-col
        v-if="userType === 'Streamer'"
        cols="12"
        md="6"
      >
        <ShowStreamKey />
      </v-col>

    </v-row>

    <v-row class="mb-2">
      <v-col>
        <v-card class="d-flex">
          <v-row class="no-gutters">
            <v-col
              cols="12"
              md="6"
              lg="5"
              class="d-flex align-items-center"
            >
              <v-img
                src="/images/OBS-480.png"
                :aspect-ratio="16/9"
                contain
                width="100%"
              />
            </v-col>
            <v-col class="d-flex flex-column">
              <v-card-title>
                General Livestreaming Info
              </v-card-title>
              <v-card-text>

                <div class="mb-3">
                  To stream on bitwave.tv you first need a streaming software. I put the buttons below to make it easy for you.
                </div>
                <div class="mb-3">
                  For PC you can use <span class="font-weight-bold yellow--text">OBS Studio</span> or <span class="font-weight-bold blue--text">Streamlabs</span>.
                  But you should probably use OBS Studio. It generally has better performance, despite not being as fancy looking.
                  Additionally you may be interested in wasting hours of your life attempting to install, remove, re-install, configure, diagnose, setup, use, then reinstalling
                  <span class="font-weight-bold red--text">Voicemeeter</span>, which allows you to attempt to manage audio routing for streaming entirely in software.
                </div>

                <div class="mb-3">
                  Once you've made it that far, you'll just want to make sure of a few settings in OBS. Mostly just 1 setting, and that is your
                  <span class="font-weight-bold">keyframes</span>. You'll want to make sure you have those set to 1.
                </div>

                <div class="mb-3">
                  Ensuring keyframes are set properly will be the best chance you have at having a somewhat decent stream.
                  By default it is set to 0 or automatic, which, on average, causes at least an additional 30 second stream delay
                  and in extreme cases, may be up to an additioanal 45 seconds. Which is pretty bad.
                </div>

              </v-card-text>
              <div class="d-flex justify-space-around flex-wrap ma-2">
                <v-btn
                  class="ma-2"
                  href="https://obsproject.com/download"
                  target="_blank"
                  color="primary"
                  outlined
                  light
                  :block="$vuetify.breakpoint.smAndDown"
                >
                  OBS Studio
                </v-btn>
                <v-btn
                  class="ma-2"
                  href="https://streamlabs.com/slobs/download"
                  target="_blank"
                  color="blue"
                  outlined
                  :block="$vuetify.breakpoint.smAndDown"
                >
                  Streamlabs
                </v-btn>
                <v-btn
                  class="ma-2"
                  href="https://www.vb-audio.com/Voicemeeter/"
                  target="_blank"
                  color="red"
                  outlined
                  :block="$vuetify.breakpoint.smAndDown"
                >
                  Voicemeeter
                </v-btn>
              </div>
            </v-col>
          </v-row>
        </v-card>
      </v-col>
    </v-row>

    <v-row>
      <v-col
        cols="12"
        sm="6"
      >
        <div class="display-2 ml-5 mb-2 font-weight-thin green--text">Some FAQs</div>
        <v-card>
          <v-card-text class="pb-0">
            <div class="overline">in technical terms</div>
            <div class="headline">SET YOUR <span class="title red--text">KEYFRAMES=1</span></div>
          </v-card-text>
          <v-card-text>
            <div>1. What is the delay?</div>
            First, verify your keyframes are correct.
            This will give you about a <span class="font-weight-bold white--text">10 to 20 second</span> delay.
            <br><span class="title">If</span> you are having issues with delay, trying moving somewhere with actual internet. . .
            or using an ethernet cord, decreasing resolution/bitrate,
            enabling low latency mode, or just giving up entirely like everything else you tried and failed at in life.
            <br>

            <br>
            <div class="mb-2">2. How do I ban here?</div>
            <div>
              <div class="mb-1">You can do <code>/ignore Username</code> to ignore a user.</div>
            </div>
            <div>
              <div class="mb-1">
                <span class="font-italic font-weight-light mr-2">Tip:</span>
                <code>/i Username</code> to save keystrokes &
                also try<code>/u</code> for unignore.
              </div>
            </div>

            <br>
            <div>3. What's a good bitrate?</div>
            <div>
              Generally <span class="body-1 yellow--text">1mb/s</span> (720p30) up to <span class="body-1 green--text">4mb/s</span> (1080p30).
              <br>
              <span class="body-1 blue--text">2.5mb/s</span> tends to do the best for most users.
              <br>
              <span class="font-italic font-weight-light">Please Note:</span>
              We have Australian viewer(s) and if you exceed <span class="red--text">5mb/s</span> they'll start complaining.
            </div>
            <br>
            <div>4. How do I emote?</div>
            <div>
              <span class="font-italic font-weight-light mr-2">Try:</span>
              <code>:blobby:</code>
              <br>You're on your own for the rest.
            </div>

            <br>
            <div>5. What is Global 🌎 Chat?</div>
            <div>
              It's in chat settings, turning it on lets you read and respond to users in any chat streamn
              not just the stream you are watching.
            </div>

            <br>
            <div>6. What are these videos that keep playing?</div>
            <div>
              Bumps or Bumpers (I'm not 100% sure which it is).
              <br>It's better content than most of the streams though, so enjoy them.
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col
        cols="12"
        sm="6"
      >
        <div class="display-2 ml-5 mb-2 font-weight-thin yellow--text">The Basic Rules</div>
        <v-card>
          <v-card-text>
            <div>1. Use your brain. ( Don't be dumb )</div>
            <div>2. Do not remove your hazzy outside of Spooky's stream.</div>
            <div>3. Do not coof on chat, and do not eat bats.</div>
            <div>4. Be sure to thank the mods, they do it for free after all.</div>
            <div>5. Don't attack chat.</div>
            <div>6. This <s> is not </s> should not be a dating site.</div>
            <div>
              7. Attempts to interfere, disrupt, or disable normal operations of the site
              will be subject to IP Scraping™.
            </div>
            <div>
              8. If it's illegal in the US don't show it. We're not here to fight for your legal battles.<br>
              Violation of US law will lead to account removal and is subject to IP banning (see rule 7).
            </div>
            <div>
              9. If you don't like what you're viewing, stop watching it. If you don't like what you're reading, stop reading it.<br>
              Otherwise, you can write an essay on your feelings here: <a href="/report" target="_blank">https://bitwave.tv/report</a>
            </div>
            <div>
              10. When in doubt, ask chat.
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
  import { mapGetters } from 'vuex';
  import { VStore } from '@/store';

  import ShowStreamKey from '~/components/profile/ShowStreamKey';

  export default {
    name: 'streamkey',

    components: {
      ShowStreamKey,
    },

    data() {
      return {
        buttonText: 'Login',
        buttonLink: '/login?redirect=/streamkey',
        loading: false,
        requestError: {
          show: false,
          type: 'error',
          message: '',
        },
      };
    },

    methods: {
      async requestKey () {
        const endpoint = 'https://api.bitwave.tv/api/stream/create';
        const cover    = 'https://cdn.bitwave.tv/static/img/bitwave_cover_sm.jpg';
        const username = this.user.username.toLowerCase();


        this.$ga.event({
          eventCategory : 'profile',
          eventAction   : 'request stream key',
          eventLabel    : username,
        });

        try {
          const res = await this.$axios.post( endpoint, { username, cover } );
          const type = res.status === 200 ? 'success' : 'error';
          this.requestError = {
            show: true,
            type: type,
            message: res.data,
          };
        } catch ( error ) {
          const type = error.response.status === 200 ? 'success' : 'error';
          this.requestError = {
            show: true,
            type: type,
            message: error.response.data,
          };
        }
      },
    },

    computed: {
      ...mapGetters({
        isAuth : VStore.$getters.isAuth,
        user   : VStore.$getters.getUser,
      }),

      userType () {
        if ( !this.isAuth || !this.user )
          return 'Troll';

        if ( this.user.hasOwnProperty( 'streamkey' ) )
          return 'Streamer';

        else
          return 'Viewer'
      },

      alert () {
        // Check if logged in
        // Check if user has avatar
        // Else user qualifies
        const valid = this.user && this.user.hasOwnProperty( 'avatar' );

        if ( this.isAuth && valid ) {
          this.buttonText= 'View Profile';
          this.buttonLink = '/profile';
          return {
            type: 'success',
            message: 'You meet all requirements to request a streamkey.',
            show: true,
          }
        } else if ( !this.isAuth ) {
          this.buttonText = 'Login / Register';
          this.buttonLink = '/login?redirect=/streamkey';
          return {
            type: 'error',
            message: 'You must be logged in to request a streamkey.',
            show: true,
          }
        } else if ( !valid ) {
          this.buttonText = 'Edit Profile';
          this.buttonLink = '/profile';
          return {
            type: 'error',
            message: 'You must set an avatar to request a streamkey.',
            show: true,
          }
        } else {
          this.buttonText = 'This Should not happen';
          this.buttonLink = '/login?redirect=/streamkey';
          return {
            type: 'error',
            message: 'Unknown Error: unable to verifyaccount requirements.',
            show: true,
          }
        }
      },
    },
  };
</script>
