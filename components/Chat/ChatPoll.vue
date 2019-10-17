<template>
  <v-card>
    <v-layout>

      <v-sheet color="yellow">
        <div style="width:24px;"></div>
      </v-sheet>

      <v-sheet
        id="poll-body"
        class="px-3 py-2"
      >

        <v-flex class="mb-3">
          <template>
            <v-text-field
              v-model="title"
              label="Poll Title"
              placeholder="[bitwave.tv]"
              color="yellow"
              hide-details
            ></v-text-field>
          </template>
        </v-flex>

        <v-layout
          v-for="(option, index) in optionsFiltered"
          :key="index"
        >
          <v-flex grow>
            <v-text-field
              v-model="option.label"
              :label="`Option ${index}...`"
              color="yellow"
              class="pt-0"
              single-line
              hide-details
            >
              <template #append-outer>
                <v-btn
                  v-if="index+1 < options.length"
                  small
                  class="black--text"
                  outlined
                  tabindex="-1"
                  color="yellow"
                  :disabled="!index"
                  @click="options.splice(index, 1)"
                >
                  <v-icon>clear</v-icon>
                </v-btn>
                <v-btn
                  v-else
                  small
                  class="black--text"
                  outlined
                  tabindex="-1"
                  color="yellow"
                  @click="options.push({label:'', votes: 0})"
                >
                  <v-icon>add</v-icon>
                </v-btn>
              </template>
            </v-text-field>
          </v-flex>
        </v-layout>

        <v-layout
          align-end
          class="pt-1"
        >
          <v-flex>
            <v-text-field
              v-model="time"
              hide-details
              label="Time (minutes)"
              color="yellow"
              type="number"
              step="0.1"
            ></v-text-field>
          </v-flex>
          <v-flex shrink mx-2 my-1>
            <v-btn
              small
              color="red"
              class="body-2"
              @click="cancelPoll"
            >cancel</v-btn>
          </v-flex>
          <v-flex shrink mx-2 my-1>
            <v-btn
              small
              color="yellow"
              class="black--text body-2"
              @click="createPoll"
            >Submit</v-btn>
          </v-flex>
        </v-layout>

      </v-sheet>
    </v-layout>
  </v-card>
</template>

<script>
    export default {
        name: 'ChatPoll',

        data() {
            return {
              title: '',
              time: 1.50,
              options: [
                { label: '', votes: 0 },
                { label: '', votes: 0 },
              ],
            }
        },

        methods: {
          cancelPoll () {
            this.title = '';
            this.options = [
              { label: '', votes: 0 },
              { label: '', votes: 0 },
            ];
            this.$emit( 'close', true );
          },

          createPoll () {
            const pollOptions = {
              title: this.title,
              // options: this.createOptions(),
              options: this.options,
              time: this.time,
            };
            this.$emit( 'create', pollOptions );
            this.$emit( 'close', true );
          },
        },

        computed: {
          optionsFiltered () {
            return this.options.filter( option => option !== null );
          },
        },
    }
</script>

<style lang='scss'>
  #poll-body {

    button {
      min-width: 45px;
    }

  }
</style>
