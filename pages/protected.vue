<template>
  <v-container>
    <v-alert
      type="error"
      outlined
      prominent
    >
      <div class="display-1">
        <strong>Error:</strong>
        You Attempted to view a restricted resource.
      </div>
    </v-alert>
    <div>
      <v-btn
        color="primary"
        light
      >
        Homepage
      </v-btn>
    </div>
  </v-container>
</template>

<script>
  export default {
    name: 'protected',

    data() {
      return {};
    },

    methods: {},

    computed: {},
  };
</script>
