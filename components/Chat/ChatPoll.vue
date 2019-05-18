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
        <v-layout column>
          <v-flex class="mb-3">
            <template>
              <v-text-field
                v-model="title"
                label="Poll Title"
                color="yellow"
                hide-details
              ></v-text-field>
            </template>
          </v-flex>

          <v-layout
            v-for="(option, index) in options"
            :key="index"
            row
          >
            <v-flex grow>
              <v-text-field
                v-model="option.label"
                :label="`Option ${(index+10).toString(36).toUpperCase()}...`"
                color="yellow"
                class="pt-0"
                single-line
                hide-details
              >
                <template #append-outer>
                  <v-btn
                    v-if="index+1 < options.length"
                    small
                    light
                    outline
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
                    light
                    outline
                    tabindex="-1"
                    color="yellow"
                    @click="options.push({str:''})"
                  >
                    <v-icon>add</v-icon>
                  </v-btn>
                </template>
              </v-text-field>
            </v-flex>
          </v-layout>

          <v-layout
            justify-end
            class="pt-1"
          >
            <v-flex shrink>
              <v-text-field
                v-model="time"
                label="Time"
                mask="##:##"
                color="yellow"
              ></v-text-field>
            </v-flex>
            <v-spacer grow/>
            <v-flex shrink>
              <v-btn
                outline
                color="yellow"
                class="body-2"
                light
                @click="cancelPoll"
              >cancel</v-btn>
            </v-flex>
            <v-flex shrink>
              <v-btn
                color="yellow"
                class="body-2"
                light
                @click="createPoll"
              >Submit</v-btn>
            </v-flex>
          </v-layout>
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
              time: '0200',
              options: [ { label: '' }, { label: '' } ],
            }
        },

        methods: {
          cancelPoll () {
            this.title = '';
            this.options = [ { label: ''}, { label: '' } ];
            this.$emit('close', true);
          },

          createPoll () {
            const pollOptions = {
              title: this.title,
              options: this.createOptions(),
              time: this.time,
            };
            this.$emit('create', pollOptions);
            this.$emit('close', true);
          },

          createOptions () {
            let data = {};
            data['A'] = { label: this.options[0].label, votes: 0 };
            data['B'] = { label: this.options[1].label, votes: 0 };
            if (this.options.length === 3) data['C'] = { label: this.options[2].label, votes: 0 };
            if (this.options.length === 4) data['D'] = { label: this.options[3].label, votes: 0 };
            return data;
          },
        },

        computed: {

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
