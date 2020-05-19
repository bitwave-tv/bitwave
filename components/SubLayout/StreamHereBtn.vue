<template>
    <div>
      <v-tooltip bottom>
        <template #activator="{ on }">
          <v-btn
            v-on="on"
            text
            icon
            to="/streamkey"
            exact-active-class="app-title-active"
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
    name: 'StreamHereBtn',

    data () {
      return {};
    },

    methods: {},

    computed: {},
  };
</script>
