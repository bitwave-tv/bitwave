<template>
  <v-container fluid>
    <div class="display-1 font-weight-thin yellow--text">Bitwave Admin Portal</div>
  </v-container>
</template>

<script>
  export default {
    name: 'admin',

    middleware: [ 'auth', 'admin' ],

    data () {
      return {};
    },

    methods: {},

    computed: {},
  };
</script>
