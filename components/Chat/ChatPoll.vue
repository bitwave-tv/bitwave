<template>
  <div class="d-flex">

    <!-- Colored Sidebar -->
    <v-sheet
      color="primary"
      tile
    >
      <div style="width:8px;"></div>
    </v-sheet>

    <!-- Poll Body -->
    <v-sheet
      id="poll-body"
      class="pa-3"
      color="grey darken-4"
      tile
    >

      <!-- Poll Title -->
      <v-text-field
        class="mb-3"
        v-model="title"
        label="Poll Title"
        placeholder="[bitwave.tv]"
        color="primary"
        hide-details
        clearable
      />

      <!-- Poll Options -->
      <div
        v-for="(option, index) in optionsFiltered"
        :key="index"
      >
        <v-text-field
          v-model="option.label"
          :label="`Option ${index}...`"
          color="primary"
          class="pt-0"
          single-line
          hide-details
          clearable
        >
          <template #append-outer>
            <v-btn
              v-if="index+1 < options.length"
              small
              class="black--text"
              outlined
              tabindex="-1"
              color="primary"
              :disabled="!index"
              @click="options.splice(index, 1)"
            >
              <v-icon>delete_outline</v-icon>
            </v-btn>
            <v-btn
              v-else
              small
              light
              outlined
              tabindex="-1"
              color="primary"
              @click="options.push({label:'', votes: 0})"
            >
              <v-icon>add</v-icon>
            </v-btn>
          </template>
        </v-text-field>
      </div>

      <div class="">
        <v-switch
          v-model="allowTrollVotes"
          class="my-2"
          color="primary"
          label="Allow Troll Votes"
          hide-details
          dense
          inset
        />
      </div>

      <!-- Poll Time, Cancel, Submit -->
      <div class="d-flex align-end pt-1">
        <v-text-field
          v-model="time"
          hide-details
          label="Time (minutes)"
          color="primary"
          type="number"
          step="0.25"
          append-icon="access_time"
        />
        <v-btn
          small
          color="red"
          class="body-2 ml-2"
          depressed
          @click="cancelPoll"
        >cancel</v-btn>
        <v-btn
          small
          color="primary"
          class="black--text body-2 ml-2"
          depressed
          @click="createPoll"
        >Submit</v-btn>
      </div>

    </v-sheet>
  </div>
</template>

<script>
    export default {
        name: 'ChatPoll',

        data() {
            return {
              title: '',
              time: 1.50,
              allowTrollVotes: false,
              options: [
                { label: '', votes: 0 },
                { label: '', votes: 0 },
              ],
            }
        },

        methods: {
          cancelPoll () {
            this.title = '';
            this.allowTrollVotes = false;
            this.options = [
              { label: '', votes: 0 },
              { label: '', votes: 0 },
            ];
            this.$emit( 'close', true );
          },

          createPoll () {
            const pollOptions = {
              title: this.title,
              allowTrollVotes: this.allowTrollVotes,
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
