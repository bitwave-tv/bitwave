<template>
    <div>
      <v-layout>

        <v-sheet color="yellow">
          <div style="width:24px;"></div>
        </v-sheet>

        <v-flex grow>
          <v-sheet
            id="poll-vote-body"
            class="pa-3 py-2"
          >
            <v-layout column>
              <v-flex class="mb-1">
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
                    <h3>{{ poll.title }}</h3>
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
                v-if="showOptions"
                v-for="(option, index) in poll.options"
                :key="index"
                column
              >
                <v-btn
                  small
                  block
                  light
                  color="yellow"
                  class=""
                >
                  {{ `${(index+10).toString(36).toUpperCase()}. ${option.str}` }}
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

        data() {
            return {
              showOptions: false,
              poll: {
                title: 'Temporary Placeholder',
                time: '0200',
                options: [ { str: 'Option A' }, { str: 'Option B' }, { str: 'Option C' }, { str: 'Option D' } ],
              },
            }
        },

        methods: {},

        computed: {},
    }
</script>

<style lang='scss'>

</style>
