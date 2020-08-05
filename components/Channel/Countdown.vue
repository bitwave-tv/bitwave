<template>
  <div>
    <v-sheet
      color="black"
      class="px-4 py-2 elevation-5"
    >

      <client-only>
        <vac :end-time="timestamp">
          <div
            slot="process"
            slot-scope="{ timeObj }"
            class="display-1 white--text"
          >
            {{ label( timeObj ) }}
          </div>
          <span slot="finish">STREAMER IS FUCKING LATE!</span>
        </vac>
      </client-only>

    </v-sheet>
  </div>
</template>

<script>
  export default {
    name: 'Countdown',

    props: {
      timestamp: { type: Date },
    },

    data() {
      return {};
    },

    methods: {
      label ( timeObj )  {
        const days = timeObj.d > 0
          ? `${timeObj.d} Day${timeObj.d > 1 ? 's' : ''} - `
          : '';
        return `${days}${timeObj.h}:${timeObj.m}:${timeObj.s}`;
      },
    },

    mounted() {

    },
  };
</script>
