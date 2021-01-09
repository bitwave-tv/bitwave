<template>
  <!--  Donation Progress Bar  -->
  <v-sheet
    color="blue-grey darken-4"
  >
    <v-progress-linear
      stream
      color="purple"
      v-model="goalProgressPercent"
      height="25"
    >
      <div class="d-flex align-center">
        <div class="font-weight-bold mr-1">{{ donationLabel }}</div>
        <span class="caption">({{ goalProgressPercent }}%)</span>
      </div>
    </v-progress-linear>

    <v-row class="justify-center py-2">

      <div class="d-flex align-center">

        <div>
          <v-btn
            v-if="false"
            :href="donoationLink"
            color="yellow"
            outlined
            small
            class="mr-4"
          >Donate</v-btn>
          <v-btn
            :href="donoationLink"
            color="yellow"
            outlined
            small
            class="mr-4"
          >Donate</v-btn>
        </div>

        <div class="justify-center">
          <div>We <i>need</i> support from our viewers! <span class="caption grey--text">(you)</span></div>
          <div>
            {{ donationLinkText }}
            <span class="rgb--text">THANKS!</span>
          </div>
        </div>

      </div>
    </v-row>

    <v-divider color="purple" />
  </v-sheet>
</template>

<script>
export default {
    name: 'GoalProgress',

    data () {
        return {
          goalTotal: 2000,
          goalProgress: 320.88,

          donationLinkText: `Please help us reach our goal.`,
          donoationLink: `https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=JAN2HKQ9CTYZY&source=url`,
        }
    },

    methods: {
      loadProgress () {

      }
    },

    computed: {
      goalProgressPercent () {
        return Math.floor( 100 * ( this.goalProgress / this.goalTotal ) );
      },

      donationLabel () {
        return `$${this.goalProgress} / $${this.goalTotal} Monthly Costs`;
      },
    },

    mounted () {

    },
}
</script>

<style lang='scss'>

</style>
