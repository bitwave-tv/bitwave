<template>
  <v-container
    grid-list-sm
  >
    <v-layout
      row
      justify-space-around
    >
      <v-flex xs12 md8 lg6 xl4>
        <v-card class="my-3">
          <v-card-title>
            <h3>
              <v-icon>warning</v-icon>
              Report Content
            </h3>
          </v-card-title>
          <hr>
          <v-card-text>
            <v-form action="https://formspree.io/dispatchcommit@gmail.com" method="POST">
            <v-layout column>
              <v-flex>
                <v-text-field
                  label="legal name"
                  name="name"
                  outline
                ></v-text-field>
                <v-text-field
                  label="email"
                  name="_replyto"
                  outline
                ></v-text-field>
                <v-textarea
                  name="report"
                  outline
                  label="message"
                  counter
                  ></v-textarea>
              </v-flex>
              <v-btn
                block
                color="red"
                type="submit"
                value="Send"
                >submit</v-btn>
            </v-layout>
            </v-form>
          </v-card-text>
        </v-card>

      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
    export default {
        name: 'report',

        data() {
            return {}
        },

        methods: {},

        computed: {},
    }
</script>
