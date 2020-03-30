<template>
  <div class="d-flex poll-vote">
    <v-sheet
      color="primary"
      width="8px"
      tile
    />
    <v-sheet
      id="poll-vote-body"
      class="pa-2 flex-grow-1"
      tile
    >
      <div class="d-flex align-center">
        <div
          class="d-flex mx-2 flex-grow-1"
          style="width: 0"
        >
          <h3
            class="d-inline-block"
            :style="{
              display: '-webkit-box',
              '-webkit-line-clamp': showOptions ? '10' : '1',
              '-webkit-box-orient': 'vertical',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }"
          >
            {{ pinnedMessage }}
          </h3>
        </div>

        <v-btn
          small
          style="min-width: 0"
          color="primary"
          class=""
          outlined
          light
          @click="collapsePin = !collapsePin"
        >
          <v-icon>{{ `keyboard_arrow_${collapsePin ? 'up' : 'down' }` }}</v-icon>
        </v-btn>
      </div>
    </v-sheet>
  </div>
</template>

<script>
  import { mapState, mapGetters, mapMutations, mapActions } from 'vuex';
  import { Chat } from '@/store/chat';
  import { VStore } from '@/store';

  export default {
    name: 'PinnedMessage',

    data () {
      return {
        collapsePin: true,
      };
    },

    methods: {

    },

    computed: {
      ...mapState( Chat.namespace, {
        pinnedMessage : Chat.$states.pinnedMessage,
      }),
    },

    mounted () {

    },
  };
</script>

<style lang='scss'>

</style>
