<template>
  <div>

    <!-- Comment Header -->
    <div class="mb-3">
      <div class="px-1 title grey--text"><span class="white--text">{{ comments.length }}</span> Comments</div>
      <hr class="grey" />
    </div>

    <!-- Comment Input -->
    <div>
      <v-text-field
        label="Add a comment..."
        @focus="showSubmit = true"
      ></v-text-field>
      <div
        v-if="showSubmit"
        class="d-flex justify-end"
      >
        <v-btn
          text
        >
          cancel
        </v-btn>
        <v-btn
          tile
          color="primary"
          class="black--text"
        >
          submit
        </v-btn>
      </div>
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
      >Load More</v-btn>
    </div>

  </div>
</template>

<script>
  import { db } from '@/plugins/firebase';

  import comment from '@/components/Replay/ReplayComments/comment';

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
      };
    },

    methods: {
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
        console.log( this.comments );
      },
    },

    computed: {

    },

    async mounted () {
      await this.getComments();
    },
  };
</script>

<style lang='scss'>

</style>
