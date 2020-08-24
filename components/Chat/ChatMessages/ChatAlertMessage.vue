<template>
    <div>
      <v-alert
        dense
        outlined
        text
        border="left"
        :color="color"
        class="my-1"
        style="font-size: 14px; word-break: break-word;"
      >
        <div class="d-flex align-center">
          <div><span class="font-weight-bold">{{ username }}</span> sent <span class="font-weight-bold">{{ amount }} coins</span>:</div>
          <v-spacer />
        </div>
        <div class="white--text">
          {{ message }}
        </div>
      </v-alert>
    </div>
</template>

<script>
  export default {
    name: 'ChatAlertMessage',

    props: {
      amount: { type: Number },
      color: { type: String },
      username: { type: String },
      message: { type: String },
    },

    data() {
      return {};
    },

    methods: {},

    computed: {},

    mounted () {

    },
  };
</script>

<style lang='scss'>

</style>
