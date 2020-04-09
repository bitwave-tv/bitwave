<template>
  <div class="d-flex poll-vote">
    <v-sheet
      color="secondary"
      width="8px"
      tile
    />

    <v-sheet
      id="poll-vote-body"
      class="pa-2 flex-grow-1"
      tile
      color="blue-grey darken-4"
      color1="rgba(.2,.2,.2,.8)"
    >
      <div class="d-flex align-center">
        <v-progress-circular
          size="22"
          :rotate="-90"
          :value="timeLeft"
          :indeterminate="timeLeft > 100"
          color="primary"
        />
        <div
          class="d-flex mx-2 flex-grow-1"
          style="width: 0"
        >
          <div
            class="d-inline-block font-weight-regular subtitle"
            :style="{
              display: '-webkit-box',
              '-webkit-line-clamp': showOptions ? '10' : '1',
              '-webkit-box-orient': 'vertical',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }"
          >
            {{ pollData.title }}
          </div>

        </div>
        <v-btn
          small
          style="min-width: 0"
          color="primary"
          class=""
          outlined
          light
          @click="showOptions = !showOptions"
        >
          <v-icon>{{ `keyboard_arrow_${showOptions ? 'up' : 'down' }` }}</v-icon>
        </v-btn>
      </div>

      <v-flex
        v-if="!showResults && showOptions"
        v-for="( val, index ) in options"
        :key="`options-${index}`"
        mt-4
        mb-2
      >
        <v-btn
          small
          block
          class="v-btn-ellipsis"
          light
          color="primary black--text"
          :disabled="voted"
          @click="vote( index )"
        >
          {{ `${index}. ${val.label}` }}
        </v-btn>
      </v-flex>

      <div
        class="poll-results mt-3"
        v-if="( ( showResults || isOwner ) && showOptions )"
      >
        <div
          v-for="(val, index) in options"
          :key="index"
          class="d-flex align-center mb-2"
        >
          <!-- Vote Count chip -->
          <v-chip
            class="flex-shrink-0 mr-1"
            color="primary"
            outlined
            label
            small
          >{{ val.votes.toString().padStart( 3, '0' ) }}</v-chip>


          <div class="flex-grow-1 mb-2 mx-1">

            <!-- Labels -->
            <div class="caption d-flex mx-2 mb-1">

              <div class="flex-grow-1 text-truncate" style="width: 0;">{{ val.label }}</div>

              <div class="flex-shrink-0 mr-2">
                {{ Math.round( val.votes / ( pollData.voteCount || 1 ) * 100 ) }}%
              </div>

            </div>

            <!-- Progress bar -->
            <v-progress-linear
              :value="val.votes / ( pollData.voteCount || 1 ) * 100"
              color="primary"
            />

          </div>
        </div>
      </div>

      <div
        class="d-flex justify-end mt-2"
        v-if="isOwner"
      >
        <v-btn
          small
          color="red"
          outlined
          @click="$emit('destroy', pollData.id)"
        >
          Delete
        </v-btn>
        <v-btn
          :disabled="showResults"
          small
          outlined
          color="primary"
          class="ml-2"
          @click="endPoll"
        >
          Finish
        </v-btn>
      </div>
    </v-sheet>
  </div>
</template>

<script>
  export default {
    name: 'ChatPollVote',

    props: {
      pollData: {
        type: Object,
      },
      isOwner: {
        type: Boolean,
      },
    },

    data() {
      return {
        showOptions: true,
        voted: false,
        now: new Date,
      }
    },

    methods: {
      onPollTick () {
        this.now = new Date;

        // Verify we are owner and the poll has finished
        if ( !this.isOwner || !this.showResults ) return;
        if ( !this.pollData ) return;

        // Save results if not yet saved
        if ( !this.pollData.resultsSaved ) {
          console.log( `Saving poll results` );
          this.$emit( 'end' );
          // clearInterval( this.pollInterval );
        }
      },

      vote (option) {
        this.$emit( 'vote', option );
        this.voted = true;
      },

      endPoll () {
        if ( this.showResults ) return;
        this.$emit( 'end' );
      },
    },

    computed: {
      options () {
        return this.pollData.options.filter( option => option !== null );
      },

      showResults () {
        return this.now > this.pollData.endsAt.toDate();
      },

      timeLeft () {
        let seconds = ( this.pollData.endsAt.toDate() - this.now.getTime() ) / 1000;
        // if (seconds < 0) { seconds = 0; }
        // 100% = 2 minutes
        return ( seconds / 1.2 );
      },

      formattedResults () {
        this.options().map( option => {
          return `${val.votes} (${Math.round( val.votes / ( pollData.voteCount || 1 ) * 100 )}%)`
        });
      },

    },

    mounted () {
      this.pollInterval = setInterval( () => {
        this.onPollTick();
      }, 1000 * 0.5 );
    },

    beforeDestroy () {
      if ( this.pollInterval ) clearInterval( this.pollInterval );
    },
  }
</script>

<style lang="scss">
  .v-btn-ellipsis {
    span {
      display: block;
      text-overflow: ellipsis;
      width: 0;
      overflow: hidden;
    }
  }

  .poll-vote {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    z-index: 3;
  }
</style>
