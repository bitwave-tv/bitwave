<template>
  <v-btn
    flat
    @click="login()"
  >
    Log In
  </v-btn>
</template>

<script>
  export default {

    created() {
      // this.$store.dispatch('user/init');
    },

    methods: {
      login() {
        // this.$store.dispatch('user/login');
      }
    },

  };
</script>
