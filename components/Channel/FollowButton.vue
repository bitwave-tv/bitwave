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
  </div>
</template>

<script>
  import { mapGetters } from 'vuex'
  import { VStore } from '@/store';

  import { auth, db, FieldValue } from '@/plugins/firebase.js'

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
      }
    },

    methods: {
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
        const followerRef = db
          .collection( 'followers' )
          .doc( `${uid}_${this.streamerId}` );
        const doc = await followerRef.get();
        this.following = doc.exists;
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
