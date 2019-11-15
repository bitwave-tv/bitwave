<template>
  <div class="d-flex">

    <!-- Yellow Sidebar -->
    <v-sheet color="yellow">
      <div style="width:24px;"></div>
    </v-sheet>

    <!-- Poll Body -->
    <v-sheet
      id="poll-body"
      class="pa-3"
    >

      <!-- Poll Title -->
      <v-text-field
        class="mb-3"
        v-model="title"
        label="Poll Title"
        placeholder="[bitwave.tv]"
        color="yellow"
        hide-details
        clearable
      ></v-text-field>

      <!-- Poll Options -->
      <div
        v-for="(option, index) in optionsFiltered"
        :key="index"
      >
        <v-text-field
          v-model="option.label"
          :label="`Option ${index}...`"
          color="yellow"
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
              color="yellow"
              :disabled="!index"
              @click="options.splice(index, 1)"
            >
              <v-icon>delete_outline</v-icon>
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
      </div>

      <!-- Poll Time, Cancel, Submit -->
      <div class="d-flex align-end pt-1">
        <v-text-field
          v-model="time"
          hide-details
          label="Time (minutes)"
          color="yellow"
          type="number"
          step="0.25"
          append-icon="access_time"
        ></v-text-field>
        <v-btn
          small
          color="red"
          class="body-2 ml-2"
          @click="cancelPoll"
        >cancel</v-btn>
        <v-btn
          small
          color="yellow"
          class="black--text body-2 ml-2"
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
