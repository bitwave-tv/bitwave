<template>
  <v-container
    grid-list-sm
  >
    <v-layout
      row
      justify-space-around
    >
      <v-flex xs12 md8 lg6 xl4>
        <v-card
          class="my-3"
        >
          <v-sheet
            color="red"
            class="pa-3"
          >
            <h3>
              <v-icon>warning</v-icon>
              Report Content
            </h3>
          </v-sheet>

          <v-card-text>
            <v-form ref="report">
              <v-layout column>
                <v-flex>

                  <div class="mb-2">Who are you?</div>
                  <v-text-field
                    v-model="name"
                    label="legal name"
                    name="name"
                    color="primary"
                    required
                    :rules="[ rules.required ]"
                    :loading="submitting"
                    :disabled="submitting || submitted"
                    validate-on-blur
                    outlined
                  ></v-text-field>

                  <div class="mb-2">If we need to reply, how do we contact you?</div>
                  <v-text-field
                    v-model="email"
                    label="email"
                    name="_replyto"
                    type="email"
                    color="primary"
                    required
                    :rules="[ rules.required, rules.email ]"
                    :loading="submitting"
                    :disabled="submitting || submitted"
                    validate-on-blur
                    outlined
                  ></v-text-field>

                  <div class="mb-2">What are you writing this report about? OR <b>WHO</b> is this report about?</div>
                  <v-text-field
                    v-model="subject"
                    label="Streamer URL / Username / Topic"
                    name="subject"
                    type="subject"
                    required
                    :rules="[ rules.required ]"
                    :loading="submitting"
                    :disabled="submitting || submitted"
                    validate-on-blur
                    outlined
                  ></v-text-field>

                  <v-textarea
                    v-model="report"
                    name="report"
                    outlined
                    label="message"
                    color="primary"
                    required
                    :rules="[ rules.required ]"
                    :loading="submitting"
                    :disabled="submitting || submitted"
                    counter
                  ></v-textarea>
                </v-flex>
                <v-btn
                  color="red"
                  :loading="submitting"
                  :disabled="submitting || submitted"
                  @click="createReport"
                >{{ submitted ? 'success' : 'submit' }}</v-btn>
                <v-flex>
                  <v-alert
                    v-show="submitted"
                    :color="success ? 'success' : 'error'"
                    class="mt-4"
                  >{{ success ? `Success: ${reportResult}` : 'Error Occured' }}</v-alert>
                </v-flex>
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
      return {
        name: '',
        email: '',
        subject: '',
        report: '',

        reportResult: '',

        valid: true,
        submitting: false,
        submitted: false,
        success: true,

        rules: {
          required: value => !!value || 'Required.',
          email: value => {
            const pattern = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            return pattern.test(value) || 'Invalid e-mail.'
          },
        },
      }
    },

    methods: {
      async createReport () {
        this.valid = this.$refs.report.validate();

        if (!this.valid) return;

        this.submitting = true;
        this.success = true;

        const endpoint = `https://api.bitwave.tv/v1/reports`
        const payload = {
          name: this.name,
          email: this.email,
          subject: this.subject,
          report: this.report,
        };

        try {
          const result = await this.$axios.post(
            endpoint,
            payload,
          );
          this.reportResult = result.data;
          console.log( result.data );
        } catch (e) {
          console.log(e);
          this.success = false;
        }

        this.submitting = false;
        this.submitted = true;
      },
    },
  }
</script>
