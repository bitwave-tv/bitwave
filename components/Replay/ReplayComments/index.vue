<template>
  <div>

    <!-- Comment Header -->
    <div class="mb-1">
      <div class="px-1 subtitle-2 grey--text">
        Showing
        <span class="subtitle-1 white--text">{{ comments.length }}</span>
        of
        <span class="subtitle-1 white--text">{{ commentCount }}</span>
        comments
      </div>
    </div>

    <!-- Comment Input -->
    <div
      v-if="user"
      class="mb-4"
    >
      <div class="d-flex align-center">

        <!-- Avatar with webp support -->
        <picture
          v-if="avatar"
          class="v-avatar ml-0 mr-4"
          style="height: 38px; min-width: 40px; width: 40px; background: #212121;"
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
          ref="commentInput"
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
    <!-- Sign up banner -->
    <div
      v-else
      class="mb-4"
    >
      <v-alert
        class="mt-2"
        color="red"
        dark
        icon="warning"
      >
        You must be logged in to leave a comment!
      </v-alert>
    </div>

    <!-- Comments Display -->
    <div class="mb-4">
      <template
        v-for="comment in comments"
      >
        <comment
          v-if="comment.hasOwnProperty( 'content' ) && comment.content"
          :key="comment.id"
          :content="comment.content"
          :username="comment.name"
          :avatar="comment.user.avatar"
          :timestamp="comment.timestamp"
          class="mb-3"
          @reply="replyTo"
          @click:timestamp="timestamp => $emit( 'click:timestamp', timestamp )"
        />
      </template>
    </div>

    <!-- Load More Comments -->
    <div>
      <v-btn
        color="primary"
        outlined
        small
        :loading="loadingComments"
        :disabled="allCommentsLoaded"
        @click="onLoadMore"
      >{{ allCommentsLoaded ? commentCount === 0 ? 'No Comments' : 'No More Comments' : 'Load More' }}</v-btn>
    </div>

  </div>
</template>

<script>
  import { auth, db } from '@/plugins/firebase';

  import { mapGetters } from 'vuex';
  import { VStore } from '@/store';

  import comment from '@/components/Replay/ReplayComments/comment';

  export default {
    name: 'index',

    components: {
      comment,
    },

    props: {
      archiveId: { type: String },
      commentCount: { type: Number },
    },

    data () {
      return {
        comments: [],
        showSubmit: false,
        userComment: '',
        submittingComment: false,
        loadingComments: true,
        allCommentsLoaded: false,
      };
    },

    methods: {
      replyTo ( username ) {
        this.userComment += `@${username} `;
        this.$nextTick( () => this.$refs.commentInput.focus() );
      },

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

        await this.updateToken();

        const payload = {
          user: this.user.username,
          comment: this.userComment,
        };

        try {
          const { data } = await this.$axios.post(
            `https://api.bitwave.tv/v1/replays/${this.archiveId}/comments`,
            payload,
          );
          if ( data.success ) {
            this.$toast.success( `Successfully posted comment!`, { icon: 'done', duration: 5000, position: 'top-center' } );

            // Add new comment to page without re-retching data
            this.comments = [
              {
                id: data.data.id,
                ...data.data,
              },
              ...this.comments,
            ];
          } else {
            this.$toast.error( data, { icon: 'error', duration: 5000, position: 'top-center' } );
          }
        } catch ( error ) {
          this.$toast.error( error.message, { icon: 'error', duration: 5000, position: 'top-center' } );
        }

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

        this.loadingComments = false;

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
          const content = comment.content || [{ type: 'text', value: comment.text }];
          const user = comment.user || { name: comment.name, avatar: null, avatars: null };
          return {
            id: doc.id,
            _username: comment._username,
            name: comment.name,
            owner: comment.owner,
            timestamp: comment.timestamp.toDate(),
            user: user,
            text: comment.text,
            content: content,
          }
        });

        if ( this.comments.length < 5 ) this.allCommentsLoaded = true;
      },

      async onLoadMore () {
         if ( !this.archiveId ) return console.log( `No Archive ID!` );
         if ( this.loadingComments ) return console.log( `Already loading!` );

         this.loadingComments = true;

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
          const content = comment.content || [{ type: 'text', value: comment.text }];
          const user = comment.user || { name: comment.name, avatar: null, avatars: null };
          this.comments.push({
            id: doc.id,
            _username: comment._username,
            name: comment.name,
            owner: comment.owner,
            timestamp: comment.timestamp.toDate(),
            user: user,
            text: comment.text,
            content: content,
          });
        });

        this.loadingComments = false;

        if ( commentQuery.size < 5 ) this.allCommentsLoaded = true;

        this.$analytics.logEvent( 'load_more_comments' );
        this.$ga.event({
          eventCategory : 'replay',
          eventAction   : 'load more comments',
        });
      },

      async updateToken () {
        const token = await auth.currentUser.getIdToken( true );
        this.$axios.setToken( token, 'Bearer' );
      },
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
