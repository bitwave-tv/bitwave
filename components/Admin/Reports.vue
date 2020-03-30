<template>
  <v-card>
    <v-card-title>Latest Reports</v-card-title>
    <v-card-text>TODO: Implement.</v-card-text>
    <v-card-actions>
      <v-btn
        color="primary"
        light
        @click="view"
      >
        Manage
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
  export default {
    name: 'Reports',

    data () {
      return {};
    },

    methods: {
      view () {
        this.$toast.error('Report view does not exist.');
      },
    },

    computed: {},
  };
</script>
