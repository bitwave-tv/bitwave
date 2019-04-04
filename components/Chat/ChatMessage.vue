<template>
  <v-flex
    shrink
    my-1
  >
    <v-layout
      row
      px-3
    >
      <v-list-tile-avatar size="34">
        <slot name="avatar">
          <v-icon :class="classList">person</v-icon>
        </slot>
      </v-list-tile-avatar>
      <v-list-tile-content>
        <v-list-tile-sub-title>
          <v-layout>
            <v-flex shrink class="user-select-non mr-1 grey--text">[{{ time }}]</v-flex>
            <v-flex shrink class="font-weight-medium">{{ username }}</v-flex>
            <v-spacer/>
            <v-flex shrink>
              <kbd class="user-select-non mr-1" style="background-color: #607D8B;">{{ channel || 'global' }}</kbd>
            </v-flex>
          </v-layout>
        </v-list-tile-sub-title>
        <slot name="message"></slot>
      </v-list-tile-content>
    </v-layout>
  </v-flex>
</template>

<script>
  import moment from 'moment'

  export default {
    name: 'ChatMessage',

    props: {
      username: {
        type: String,
      },
      channel: {
        type: String,
      },
      timestamp: {
        type: Number,
      },
    },

    data() {
      return {
        color: '',
        colorList: ['orange', 'blue', 'purple', 'teal', 'green', 'yellow', 'blue-grey'],
      }
    },

    computed: {
      classList() {
        return [this.color, 'lighten-1', 'white--text'];
      },
      time() {
        return moment(this.timestamp).format('HH:mm');
      },
    },

    mounted() {
      this.color = this.colorList[Math.floor(Math.random() * this.colorList.length)];
    },
  }
</script>

<style lang='scss'>
  user-select-none {
    user-select: none;
  }

  .v-list__tile__avatar {
    min-width: 42px;
  }
</style>
