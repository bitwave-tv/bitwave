<template>
    <div>
      <v-layout>

        <v-sheet color="yellow">
          <div style="width:24px;"></div>
        </v-sheet>

        <v-flex grow>
          <v-sheet
            id="poll-vote-body"
            :class="{ 'pa-3': true, 'py-2': showOptions }"
          >
            <v-layout column>
              <v-flex class="">
                <v-layout align-center>
                  <v-flex shrink>
                    <v-progress-circular
                      size="22"
                      indeterminate
                      color="yellow"
                    ></v-progress-circular>
                  </v-flex>
                  <v-flex
                    class="ml-2"
                    grow
                  >
                    <h3>{{ pollData.title }}</h3>
                  </v-flex>
                  <v-flex shrink>
                    <v-btn
                      small
                      style="min-width: 0"
                      color="yellow"
                      light
                      outline
                      @click="showOptions = !showOptions"
                    >
                      <v-icon>keyboard_arrow_down</v-icon>
                    </v-btn>
                  </v-flex>
                </v-layout>
              </v-flex>

              <v-flex
                v-if="!showResults && showOptions"
                v-for="(val, index) in options"
                :key="val.label"
                column
              >
                <v-btn
                  small
                  block
                  light
                  color="yellow"
                  :disabled="voted"
                  @click="vote(index)"
                >
                  {{ `${index}. ${val.label}` }}
                </v-btn>
              </v-flex>

              <v-flex
                v-if="(( showResults && showOptions ) || isOwner )"
                v-for="(val, index) in options"
                :key="index"
              >
                {{ `${val.label} (${val.votes})` }}
                <v-progress-linear
                  :value="val.votes / (pollData.voters || 1) * 100"
                  :buffer-value="(pollData.voters || 1)"
                  color="yellow"
                ></v-progress-linear>
              </v-flex>

              <v-flex v-if="isOwner">
                <v-layout row>
                  <v-spacer></v-spacer>
                  <v-flex shrink>
                    <v-btn
                      small
                      flat
                      color="yellow"
                      light
                      @click="$emit('destroy', pollData.id)"
                    >
                      Delete
                    </v-btn>
                  </v-flex>
                  <v-flex shrink>
                    <v-btn
                      small
                      outline
                      color="yellow"
                      light
                      @click="$emit('end', pollData.id)"
                    >
                      End Poll
                    </v-btn>
                  </v-flex>
                </v-layout>
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
              currentTime: 0,
            }
        },

        methods: {
          vote (option) {
            this.$emit( 'vote', option );
            this.voted = true;
          },
          updateTime () {
            this.currentTime = Date.now();
            setTimeout( () => this.updateTime(), 2000 );
          },
        },

        computed: {
          options () {
            return this.pollData.options.filter( option => option !== null );
          },

          showResults () {
            return this.currentTime > this.pollData.endsAt;
          },
        },

        mounted() {
          this.updateTime();
        }
    }
</script>
