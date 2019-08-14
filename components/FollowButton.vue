<template>
  <div>
    <v-btn
      small
      light
      :outline="following || !streamerId"
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
  import { auth, db, FieldValue } from '@/plugins/firebase.js'

  import 'firebase'

  export default {
    name: 'FollowButton',

    props: {
      'streamerId': String,
    },

    data() {
      return {
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
        console.log( `${uid}_${this.streamerId}` );
        const followerRef = db.collection( 'followers' ).doc( `${uid}_${this.streamerId}` );
        const doc = await followerRef.get();
        console.log(doc.data());
        this.following = doc.exists;
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

        if ( this.user.uid ) {
          const batch = db.batch();

          const followerRef = db.collection( 'followers' ).doc( `${this.user.uid}_${this.streamerId}` );
          /*await followerRef.set({
            streamerId: this.streamerId,
            timestamp: new Date(Date .now() ),
            viewerId: this.user.uid,
          });*/
          batch.set(followerRef, {
            streamerId: this.streamerId,
            timestamp: new Date(Date .now() ),
            viewerId: this.user.uid,
          });

          const streamerRef = db.collection( 'followers' ).doc( `${this.streamerId}` );
          // await streamerRef.set( { 'followers': FieldValue.increment(1) }, { merge: true } );
          batch.set( streamerRef, { 'followers': FieldValue.increment(1) }, { merge: true } );

          await batch.commit();

          await this.getFollowCount();
        }
        this.following = true;
        this.disabled = true;
        setTimeout( () => this.disabled = false, 1500 );
      },

      async unfollow () {
        // Analytics
        this.$ga.event({
          eventCategory : 'follow',
          eventAction   : 'unfollow',
        });

        if ( this.user.uid ) {
          const batch = db.batch();

          const followerRef = db.collection( 'followers' ).doc( `${this.user.uid}_${this.streamerId}` );
          // await followerRef.delete();
          batch.delete( followerRef );

          const streamerRef = db.collection( 'followers' ).doc( `${this.streamerId}` );
          // await streamerRef.set( { 'followers': FieldValue.increment(-1) }, { merge: true } );
          batch.set( streamerRef, { 'followers': FieldValue.increment(-1) }, { merge: true } );

          await batch.commit();

          await this.getFollowCount();
        }
        this.following = false;
        this.disabled = true;
        setTimeout( () => this.disabled = false, 1500 );
      },
    },

    computed: {
      ...mapGetters({
        isAuth: 'isAuth',
        user: 'user',
      }),

    },

    async mounted () {
      auth.onAuthStateChanged( async user => await this.authenticated( user ) );
      await this.getFollowCount();
    }
  }
</script>
