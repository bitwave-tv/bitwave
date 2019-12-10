<template>
  <div>
    <v-btn
      small
      class="black--text"
      :outlined="following || !streamerId"
      :loading="loading"
      :disabled="!isAuth"
      color="yellow"
      @click="onFollowClick"
    >
      {{ following ? `Following (${followCount})` : `Follow (${followCount})` }}
    </v-btn>
  </div>
</template>

<script>
  import { mapGetters } from 'vuex'
  import { VStore } from '@/store';

  import { auth, db, FieldValue } from '@/plugins/firebase.js'

  export default {
    name: 'FollowButton',

    props: {
      'streamerId': String,
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
        const ref = db.collection( 'followers' ).doc( `${this.streamerId}` );
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
        const followerRef = db.collection( 'followers' ).doc( `${uid}_${this.streamerId}` );
        const doc = await followerRef.get();
        this.following = doc.exists;
        return doc.exists;
      },

      async onFollowClick () {
        if ( this.disabled ) return false;
        if ( !this.following ) {
          await this.follow();
        } else {
          await this.unfollow();
        }
      },

      async follow () {

        // Analytics
        this.$ga.event({
          eventCategory : 'follow',
          eventAction   : 'follow',
        });

        // Update followers
        if ( this.user.uid && !this.disabled ) {
          // Verify state
          if ( await this.checkIfFollowing( this.user.uid ) ) return;

          // Update
          this.disabled = true;
          const batch = db.batch();

          const followerRef = db.collection( 'followers' ).doc( `${this.user.uid}_${this.streamerId}` );
          batch.set(followerRef, {
            streamerId: this.streamerId,
            timestamp: new Date(Date .now() ),
            viewerId: this.user.uid,
          });

          const streamerRef = db.collection( 'followers' ).doc( `${this.streamerId}` );
          batch.set( streamerRef, { 'followers': FieldValue.increment(1) }, { merge: true } );

          await batch.commit();

          await this.getFollowCount();
        }

        this.following = true;
        setTimeout( () => this.disabled = false, 1500 );
      },

      async unfollow () {
        // Analytics
        this.$ga.event({
          eventCategory : 'follow',
          eventAction   : 'unfollow',
        });

        // Update followers
        if ( this.user.uid && !this.disabled ) {
          // Verify state
          if ( ! await this.checkIfFollowing( this.user.uid ) ) return;

          // Update
          this.disabled = true;
          const batch = db.batch();

          const followerRef = db.collection( 'followers' ).doc( `${this.user.uid}_${this.streamerId}` );
          batch.delete( followerRef );

          const streamerRef = db.collection( 'followers' ).doc( `${this.streamerId}` );
          batch.set( streamerRef, { 'followers': FieldValue.increment(-1) }, { merge: true } );

          await batch.commit();

          await this.getFollowCount();
        }

        this.following = false;
        setTimeout( () => this.disabled = false, 1500 );
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
