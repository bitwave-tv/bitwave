<template>
    <div>

      <!-- Chat Header -->
      <div class="mx-5">
        <h1 class="font-weight-light rgb-text">Streamer Dashboard</h1>
      </div>

      <v-container>
        <v-row>

          <v-col>
            <div>STREAM PLAYER GOES HERE</div>
            <div class="caption">IT SHOULD PROBABLY BE AUTOMUTED TOO</div>
          </v-col>

          <v-col>
            <dashboard-superchats />
          </v-col>

          <v-col>
            <div>CHAT SHOULD GO HERE</div>
          </v-col>
        </v-row>
      </v-container>

    </div>
</template>

<script>
  export default {
    name: 'dashboard',

    middleware: 'auth',

    data() {
      return {};
    },

    methods: {},

    computed: {},

    mounted() {

    },
  };
</script>

<style lang='scss'>

</style>
