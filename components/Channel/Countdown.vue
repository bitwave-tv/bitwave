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
            class="display-1 white--text font-weight-bold"
          >
            <div class="text-center">
              <span class="red--text display-2 font-weight-bold">OFFLINE</span>
            </div>
            <div>
              <span class="grey--text font-weight-regular">Starting</span>
              <span class="blink grey--text">:</span>
              {{ label( timeObj ) }}
            </div>

          </div>
          <span slot="finish">Stream Starting Soon!</span>
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
  };
</script>
