<template>
  <div>

    <!-- Comment Header -->
    <div class="mb-1">
      <div class="px-1 title grey--text"><span class="white--text">{{ comments.length }}</span> Comments</div>
<!--      <hr class="grey" />-->
    </div>

    <!-- Comment Input -->
    <div
      v-if="user"
      class="mb-3"
    >
      <div class="d-flex align-center">

        <!-- Avatar with webp support -->
        <picture
          v-if="avatar"
          class="v-avatar ml-0 mr-4"
          style="height: 40px; min-width: 40px; width: 40px; background: #212121;"
        >
          <source
            v-if="avatars"
            :srcset="`${avatars.webp}`"
            type="image/webp"
          >
          <img
            :src="`${avatar}`"
            :alt="username"
          >
        </picture><!-- Fallback when we don't have a user avatar -->
        <v-avatar
          v-else
          class="mr-4"
          size="40"
          color="grey darken-4"
        >
          <!-- Troll Hazzy -->
          <img
            src="https://cdn.bitwave.tv/static/img/troll_hazzie.png?_bw"
            alt="hazmat suit trolll"
            crossorigin
          >
          <!--<v-icon v-else>person</v-icon>-->
        </v-avatar>

        <!-- Comment input -->
        <v-text-field
          v-model="userComment"
          label="Add a comment..."
          :loading="submittingComment"
          :counter="5000"
          hide-details
          clearable
          @focus="showSubmit = true"
          class="mb-2"
        ></v-text-field>

      </div>

      <v-expand-transition>
        <div
          v-if="showSubmit"
          class="d-flex justify-end"
        >
          <v-btn
            small
            text
            :disabled="submittingComment"
            @click="cancelComment"
            class="mr-2"
          >
            cancel
          </v-btn>
          <v-btn
            small
            tile
            color="primary"
            class="black--text"
            :disabled="!userComment || submittingComment"
            @click="addComment"
          >
            submit
          </v-btn>
        </div>
      </v-expand-transition>
    </div>

    <!-- Comments Display -->
    <div class="mb-3">
      <comment
        v-for="comment in comments"
        :key="comment.id"
        :username="comment.name"
        :timestamp="comment.timestamp"
        :text="comment.text"
        class="mb-3"
      />
    </div>

    <!-- Load More Comments -->
    <div>
      <v-btn
        color="primary"
        outlined
        small
        :loading="loadingMoreComments"
        :disabled="allCommentsLoaded"
        @click="onLoadMore"
      >{{ allCommentsLoaded ? 'No More Comments' : 'Load More' }}</v-btn>
    </div>

  </div>
</template>

<script>
  import { db } from '@/plugins/firebase';

  import comment from '@/components/Replay/ReplayComments/comment';

  import { mapGetters } from 'vuex';
  import { VStore } from '@/store';

  export default {
    name: 'index',

    components: {
      comment,
    },

    props: {
      archiveId: { type: String },
    },

    data () {
      return {
        comments: [],
        showSubmit: false,
        userComment: '',
        submittingComment: false,
        loadingMoreComments: false,
        allCommentsLoaded: false,
      };
    },

    methods: {
      cancelComment () {
        this.userComment = '';
        this.showSubmit = false;

        this.$analytics.logEvent( 'cancel_comment' );
        this.$ga.event({
          eventCategory : 'replay',
          eventAction   : 'cancel comment',
        });
      },

      // TODO: add error handling and error alerts
      async addComment () {
        if ( !this.archiveId ) return console.log( `No Archive ID!` );
        if ( !this.userComment || this.userComment.length < 1 ) return console.log( `No user comment!` );

        this.submittingComment = true;

        const commentData = {
          _username: this.user.username.toLowerCase(),
          name: this.user.username,
          owner: this.user.uid,
          text: this.userComment,
          timestamp: new Date(),
        };

        const commentRef = db
          .collection( 'archives' )
          .doc( this.archiveId )
          .collection( 'comments' );

        const commentId = ( await commentRef.add( commentData ) ).id;

        this.comments = [
          {
            id: commentId,
            ...commentData,
          },
          ...this.comments,
        ];

        this.submittingComment = false;

        // Reset input
        this.userComment = '';
        this.showSubmit = false;

        this.$analytics.logEvent( 'add_comment' );
        this.$ga.event({
          eventCategory : 'replay',
          eventAction   : 'add comment',
        });
      },

      async getComments () {
        if ( !this.archiveId ) return console.log( `No Archive ID!` );

        const commentQuery = await db
          .collection( 'archives' )
          .doc( this.archiveId )
          .collection( 'comments' )
          .orderBy('timestamp', 'desc' )
          .limit( 5 )
          .get();

        if ( commentQuery.empty ) {
          this.allCommentsLoaded = true;
          return console.log( `No comments!` );
        }

        // Process stream data
        await this.onCommentsLoaded( commentQuery.docs );
      },

      async onCommentsLoaded ( commentDocs ) {
        this.comments = commentDocs.map( doc => {
          const comment = doc.data();
          return {
            id: doc.id,
            _username: comment._username,
            name: comment.name,
            owner: comment.owner,
            text: comment.text,
            timestamp: comment.timestamp.toDate(),
          }
        });

        if ( this.comments.length < 5 ) this.allCommentsLoaded = true;
      },

      async onLoadMore () {
      //
         if ( !this.archiveId ) return console.log( `No Archive ID!` );
         if ( this.loadingMoreComments ) return console.log( `Already loading!` );

         this.loadingMoreComments = true;

         const offset = this.comments[ this.comments.length - 1 ].timestamp;

        const commentQuery = await db
          .collection( 'archives' )
          .doc( this.archiveId )
          .collection( 'comments' )
          .orderBy('timestamp', 'desc' )
          .startAfter( offset )
          .limit( 5 )
          .get();

        commentQuery.docs.map( doc => {
          const comment = doc.data();
          this.comments.push({
            id: doc.id,
            _username: comment._username,
            name: comment.name,
            owner: comment.owner,
            text: comment.text,
            timestamp: comment.timestamp.toDate(),
          });
        });

        this.loadingMoreComments = false;

        if ( commentQuery.size < 5 ) this.allCommentsLoaded = true;

        this.$analytics.logEvent( 'load_more_comments' );
        this.$ga.event({
          eventCategory : 'replay',
          eventAction   : 'load more comments',
        });
      }
    },

    computed: {
      ...mapGetters({
        user : VStore.$getters.getUser,
        username : VStore.$getters.getUsername,
      }),

      avatar () {
        if ( this.user ) return this.user.avatar;
        else return false;
      },

      avatars () {
        if ( this.user ) return this.user.avatars;
        else return false;
      },
    },

    async mounted () {
      await this.getComments();
    },
  };
</script>

<style lang='scss'>

</style>
