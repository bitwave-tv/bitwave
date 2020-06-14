<template>
  <div>
    <v-btn
      v-if="isAuth"
      small
      :outlined="following || !streamerId"
      :loading="loading || disabled"
      :disabled="!isAuth"
      color="primary black--text"
      @click="onFollowClick"
    >
      {{ following ? `following (${followCount})` : `follow (${followCount})` }}
    </v-btn>
    <div
      v-else
      class="body-2 primary--text text-uppercase font-weight-bold"
    >
      {{ `${followCount} Followers` }}
    </div>

    <!-- Push notifications -->
    <v-btn
      v-if="isAuth"
      :disabled="!following"
      icon
      @click="verifyPushNotifications"
    >
      <v-icon v-if="following">{{ pushNotifications ? 'notifications_active' : 'notifications' }}</v-icon>
      <v-icon v-else>notifications_none</v-icon>
    </v-btn>


    <!-- Push Notification Confirmation Dialog -->
    <v-dialog
      v-model="showConfirmNotifications"
      width="500"
      @click:outside="confirm( false )"
    >
      <v-card>
        <v-sheet
          color="primary"
          class="pa-2 mr-2 d-flex justify-space-end align-center"
        >
          <v-icon color="black">notifications_active</v-icon>
          <h4 class="black--text body-1 font-weight-bold">
            Enable Push Notifications?
          </h4>
        </v-sheet>

        <v-card-text class="pb-0">
          <div class="subtitle-1 my-2 white--text">
            Notifications will still be sent if bitwave is closed.
          </div>
          <div>
            You can always disable notifications by clicking the bell again.
          </div>
        </v-card-text>

        <v-card-actions class="justify-end pa-3">
          <v-btn
            class="mr-2"
            color="error"
            outlined
            small
            @click="confirm( false )"
          >
            Cancel
          </v-btn>
          <v-btn
            color="green"
            small
            @click="confirm( true )"
          >
            Enable
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

  </div>
</template>

<script>
  import { mapGetters, mapActions } from 'vuex'
  import { VStore } from '@/store';

  import { auth, db, FieldValue } from '@/plugins/firebase.js'
  import { VNotifications } from '@/store/notifications';

  export default {
    name: 'FollowButton',

    props: {
      streamerId: { type: String },
    },

    data() {
      return {
        unsubAuthChanged: null,
        loading : true,
        following : false,
        followCount : 0,
        disabled: false,
        showConfirmNotifications: false,
        confirmNotifications: null,
        pushNotifications: false,
      }
    },

    methods: {
      async verifyPushNotifications () {
        this.showConfirmNotifications = true;
        const enable = await new Promise( res => this.confirmNotifications = res );
        if ( !enable ) return;

        this.requestTokenFCM();

        await this.togglePushNotifications();
      },

      confirm ( confirm ) {
        this.showConfirmNotifications = false;
        this.confirmNotifications( confirm );
      },

      async togglePushNotifications () {
        const followerDoc = await db
          .collection( 'followers' )
          .doc( `${this.user.uid}_${this.streamerId}` )
          .get();

        if ( !followerDoc.exists ) {
          console.error( `Failed to get follower documeent to update!` );
          return;
        }

        const data = followerDoc.data();
        const notifications = data.hasOwnProperty( 'notifications' )
          ? data.notifications
          : false;

        await followerDoc.ref.update({
          notifications: !notifications,
        });

        if ( !notifications ) {
          await this.subscribeToUser( this.streamerId );
        } else {
          await this.unsubscribeFrom( this.streamerId );
        }

        this.pushNotifications = !notifications;
      },

      async getFollowCount () {
        const ref = db
          .collection( 'followers' )
          .doc( `${this.streamerId}` );
        const doc = await ref.get();
        if ( !doc.exists ) {
          this.followCount = 0;
        } else {
          this.followCount = doc.data().followers;
        }
      },

      async authenticated ( user ) {
        this.following = false;
        if (user) {
          await this.checkIfFollowing(user.uid);
        }
        this.loading = false;
      },

      async checkIfFollowing (uid) {
        const doc = await db
          .collection( 'followers' )
          .doc( `${uid}_${this.streamerId}` )
          .get()

        this.following = doc.exists;

        if ( this.following ) {
          const data = doc.data();
          this.pushNotifications = data.hasOwnProperty( 'notifications' )
            ? data.notifications
            : false;
        } else {
          this.pushNotifications = false;
        }

        return doc.exists;
      },

      async onFollowClick () {
        if ( this.disabled ) return false;

        console.log( 'Button enabled' );
        this.disabled = true;

        if ( !this.following ) {
          await this.follow();
        } else {
          await this.unfollow();
        }
      },

      async follow () {
        console.log( 'follow' );

        // Update followers
        if ( this.user.uid ) {
          // Verify state
          if ( await this.checkIfFollowing( this.user.uid ) ) {
            this.following = true;
            this.disabled = false;
            return;
          }

          // Update
          const batch = db.batch();

          const followerRef = db
            .collection( 'followers' )
            .doc( `${this.user.uid}_${this.streamerId}` );

          batch.set(followerRef, {
            streamerId: this.streamerId,
            timestamp: new Date(),
            viewerId: this.user.uid,
          });

          const streamerRef = db
            .collection( 'followers' )
            .doc( `${this.streamerId}` );

          batch.set( streamerRef, { 'followers': FieldValue.increment(1) }, { merge: true } );

          await batch.commit();

          await this.getFollowCount();
        }

        // Analytics
        this.$ga.event({
          eventCategory : 'follow',
          eventAction   : 'follow',
        });

        setTimeout( () => {
          this.following = true;
          this.disabled = false;
        }, 500 );
      },

      async unfollow () {
        console.log( 'unfollow' );

        // Update followers
        if ( this.user.uid ) {
          // Verify state
          if ( ! ( await this.checkIfFollowing( this.user.uid ) ) ) {
            this.following = false;
            this.disabled = false;
            return;
          }

          // Update
          const batch = db.batch();

          const followerRef = db
            .collection( 'followers' )
            .doc( `${this.user.uid}_${this.streamerId}` );

          batch.delete( followerRef );

          const streamerRef = db
            .collection( 'followers' )
            .doc( `${this.streamerId}` );

          batch.set( streamerRef, { 'followers': FieldValue.increment(-1) }, { merge: true } );

          await batch.commit();

          await this.getFollowCount();
        }

        // Analytics
        this.$ga.event({
          eventCategory : 'follow',
          eventAction   : 'unfollow',
        });

        setTimeout( () => {
          this.following = false;
          this.disabled = false;
        }, 500 );
      },

      ...mapActions( VNotifications.namespace,{
        requestTokenFCM  : VNotifications.$actions.requestTokenFCM,
        subscribeToUser  : VNotifications.$actions.subscribeToUser,
        unsubscribeFrom : VNotifications.$actions.unsubscribeFrom,
      }),
    },

    computed: {
      ...mapGetters({
        isAuth : VStore.$getters.isAuth,
        user   : VStore.$getters.getUser,
      }),

    },

    async mounted () {
      this.unsubAuthChanged = auth.onAuthStateChanged( async user => await this.authenticated( user ) );
      await this.getFollowCount();
    },

    beforeDestroy() {
      if ( this.unsubAuthChanged ) this.unsubAuthChanged();
    },
  }
</script>
