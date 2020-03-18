<template>
  <div>

    <!-- Comment Header -->
    <div class="mb-3">
      <div class="px-1 title grey--text"><span class="white--text">{{ comments.length }}</span> Comments</div>
      <hr class="grey" />
    </div>

    <!-- Comment Input -->
    <div v-if="user">
      <v-text-field
        v-model="userComment"
        label="Add a comment..."
        :loading="submittingComment"
        @focus="showSubmit = true"
      ></v-text-field>
      <v-expand-transition>
        <div
          v-if="showSubmit"
          class="d-flex justify-end"
        >
          <v-btn
            text
            :disabled="submittingComment"
            @click="cancelComment"
          >
            cancel
          </v-btn>
          <v-btn
            tile
            color="primary"
            class="black--text"
            :disabled="submittingComment"
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
      },

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
      },

      async onLoadMore () {
      //
         if ( !this.archiveId ) return console.log( `No Archive ID!` );
         if ( this.loadingMoreComments ) return console.log( `Already loading!` )

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
      }
    },

    computed: {
      ...mapGetters({
        user : VStore.$getters.getUser,
      }),
    },

    async mounted () {
      await this.getComments();
    },
  };
</script>

<style lang='scss'>

</style>
