<template>
    <div>
      <v-layout>

        <v-sheet color="yellow" width="8px" />

        <v-flex>
          <v-sheet
            id="poll-vote-body"
            class="pa-2"
          >
            <v-layout align-center mb-2>
              <v-flex shrink>
                <v-progress-circular
                  size="22"
                  :rotate="-90"
                  :value="timeLeft"
                  :indeterminate="timeLeft > 100"
                  color="yellow"
                />
              </v-flex>
              <v-flex
                class="mx-2"
                grow
                style="width: 0"
              >
                <h3 :style="{ display: '-webkit-box', '-webkit-line-clamp': showOptions ? '10' : '1', '-webkit-box-orient': 'vertical', overflow: 'hidden', textOverflow: 'ellipsis' }">
                  {{ pollData.title }}
                </h3>

              </v-flex>
              <v-flex
                class="align-self-start"
                shrink
              >
                <v-btn
                  small
                  style="min-width: 0"
                  color="yellow"
                  class=""
                  outlined
                  light
                  @click="showOptions = !showOptions"
                >
                  <v-icon>{{ `keyboard_arrow_${showOptions ? 'up' : 'down' }` }}</v-icon>
                </v-btn>
              </v-flex>
            </v-layout>

            <v-flex
              v-if="!showResults && showOptions"
              v-for="(val, index) in options"
              :key="`options-${index}`"
              my-2
            >
              <v-btn
                small
                block
                class="v-btn-ellipsis"
                light
                color="yellow"
                :disabled="voted"
                @click="vote(index)"
              >
                {{ `${index}. ${val.label}` }}
              </v-btn>
            </v-flex>

            <div class="poll-results my-3">
              <div
                v-if="( ( showResults || isOwner ) && showOptions )"
                v-for="(val, index) in options"
                :key="index"
                class="d-flex align-center mb-2"
              >
                <!-- Vote Count chip -->
                <v-chip
                  class="flex-shrink-0 mr-1"
                  color="yellow"
                  outlined
                  label
                  small
                >{{ val.votes.toString().padStart(3, '0') }}</v-chip>


                <div class="flex-grow-1 mb-2 mx-1">

                  <!-- Labels -->
                  <div class="caption d-flex mx-2 mb-1">


                    <div class="flex-grow-1 text-truncate" style="width: 0;">{{ val.label }}</div>
                    <!--<div class="d-inline-block text-truncate">{{ val.label }}</div>-->

                    <!--<v-spacer/>-->

                    <div class="flex-shrink-0 mr-2">
                      {{ Math.round( val.votes / ( pollData.voters || 1 ) * 100 ) }}%
                    </div>

                  </div>

                  <!-- Progress bar -->
                  <v-progress-linear
                    :value="val.votes / (pollData.voters || 1) * 100"
                    color="yellow"
                  />

                </div>
              </div>
            </div>

            <v-layout
              v-if="isOwner"
              justify-end
            >
              <v-flex shrink>
                <v-btn
                  small
                  color="red"
                  outlined
                  @click="$emit('destroy', pollData.id)"
                >
                  Delete
                </v-btn>
              </v-flex>
              <v-flex shrink ml-2>
                <v-btn
                  :disabled="showResults"
                  small
                  outlined
                  color="yellow"
                  class="black--text"
                  @click="endPoll"
                >
                  Finish
                </v-btn>
              </v-flex>
            </v-layout>
          </v-sheet>
        </v-flex>
      </v-layout>
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
          vote (option) {
            this.$emit( 'vote', option );
            this.voted = true;
          },

          endPoll () {
            if ( this.showResults ) return;
            this.$emit( 'end', this.pollData.id );
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
            return (seconds / 1.8);
          },

          formattedResults () {
            this.options().map( option => {
              return `${val.votes} (${Math.round( val.votes / ( pollData.voters || 1 ) * 100 )}%)`
            });
          },

        },

        created() {
          setInterval( () => this.now = new Date, 1000 * 0.5 )
        }
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
</style>
