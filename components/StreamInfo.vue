<template>
    <div>

      <v-tooltip bottom>
        <template #activator="{ on }">
          <v-btn
            v-on="on"
            text
            icon
            to="/streamkey"
          >
            <v-icon>video_call</v-icon>
          </v-btn>
        </template>
        <span>Stream here</span>
      </v-tooltip>

    </div>
</template>

<script>
  export default {
    name: 'StreamInfo',

    data () {
      return {};
    },

    methods: {},

    computed: {},
  };
</script>
