<template>
  <v-container
    class="pt-0"
    fluid
  >
    <v-layout
      column
      justify-center
      align-center
    >
      <v-flex>
        <v-card class="my-3">

          <v-card-title>
            <h3>Report Issue</h3>
          </v-card-title>
          <v-card-text>
            <form action="https://formspree.io/dispatchcommit@gmail.com" method="POST">
              <input type="hidden" name="_subject" value="BitWave - New report!" />
              Name: <input type="text" name="name" style="width: 100%; border: solid 1px white;"><br>
              Email: <input type="email" name="_replyto" style="width: 100%; border: solid 1px white;"><br>
              Message: <br>
              <textarea name="report" style="width: 100%; border: solid 1px white;"></textarea>
              <br>
              <input type="submit" value="Send" style="width: 100%; border: solid 1px white;">
            </form>
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

<style lang='scss'>

</style>
