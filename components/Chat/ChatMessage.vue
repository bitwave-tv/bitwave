<template>
  <v-flex class="msg" shrink>
    <v-layout row py-1 px-3>
      <v-list-tile-avatar size="34">
        <img v-if="!!avatar" slot="avatar" :src="avatar" alt="">
        <v-icon v-else :class="classList">person</v-icon>
      </v-list-tile-avatar>
      <v-list-tile-content>
        <v-list-tile-sub-title>
          <v-layout>
            <v-flex shrink class="time mr-1">{{ timestamp }}</v-flex>
            <v-flex shrink class="username">{{ username }}</v-flex>
            <v-spacer/>
            <v-flex shrink>
              <kbd>{{ channel || 'global' }}</kbd>
            </v-flex>
          </v-layout>
        </v-list-tile-sub-title>
        <slot name="message"></slot>
      </v-list-tile-content>
    </v-layout>
  </v-flex>
</template>

<script>

  export default {
    name: 'ChatMessage',

    props: {
      avatar: {},
      message: {
        type: String,
      },
      username: {
        type: String,
      },
      channel: {
        type: String,
      },
      timestamp: {
        type: String,
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
    },

    mounted() {
      this.color = this.colorList[ Math.floor(Math.random() * this.colorList.length) ];
    },
  }
</script>

<style lang='scss'>

  .msg {
    kbd {
      background-color: #607D8B99;
      font-size: 10px;
      user-select: none;
    }

    .v-list__tile__avatar {
      min-width: 42px;
    }

    .time {
      user-select: none;
      color: #757575;
      caret-color: #757575;
    }

    .username {
      font-weight: 500;
      color: #9e9e9e;
      caret-color: #9e9e9e;
    }

    blockquote p {
      font-weight: 500;
      color: #789922;
      caret-color: #789922;
    }
  }

</style>
