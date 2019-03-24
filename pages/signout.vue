<template>
  <v-container
    fill-height
  >
    <v-layout
      align-center
      justify-center
    >
      <v-flex
        style="max-width: 500px"
        class='login-form text-xs-center'
      >
        <div class="display-1 mb-3">
          <v-icon class="mr-2" large="large">https</v-icon> Logged Out
        </div>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
    export default {
        name: 'signout',

      data() {
        return {}
      },

      methods: {
        async logout() {
          await this.$store.dispatch('logout');
          setTimeout(() => this.$router.push('/login'), 1000);
        },
      },

      computed: {},

      async created() {
        await this.logout();
      },
    }
</script>
