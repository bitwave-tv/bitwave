<template>
  <v-flex class="msg">
    <v-layout row py-1 pl-3>
      <v-list-tile-avatar
        size="34"
        @click="$emit('reply', username)"
      >
        <img v-if="!!avatar" :src="avatar" :alt="username">
        <v-icon v-else :style="{ background: color }">person</v-icon>
      </v-list-tile-avatar>
      <v-list-tile-content>
        <v-list-tile-sub-title>
          <v-layout>
            <v-flex shrink>
              <span class="time">{{ timestamp }}</span>
              <span class="username" :style="userStyling" v-html="displayName"></span>
            </v-flex>
            <v-spacer/>
            <v-flex shrink>
              <nuxt-link
                :to="channel"
              >
                <kbd>{{ channel }}</kbd>
              </nuxt-link>
            </v-flex>
          </v-layout>
        </v-list-tile-sub-title>
        <slot></slot>
      </v-list-tile-content>
    </v-layout>
  </v-flex>
</template>

<script>

  export default {
    name: 'ChatMessage',

    props: {
      avatar: {},
      color: {},
      message: {
        type: String,
      },
      username: {
        type: String,
      },
      displayName: {
        type: String,
      },
      userStyling: {},
      channel: {
        type: String,
      },
      timestamp: {
        type: String,
      },
    },

    data() {
      return {}
    },
  }
</script>

<style lang='scss'>
  .msg {
    word-break: break-word;
    max-height: 50vh;
    overflow: hidden;

    kbd {
      background-color: #607D8B99;
      font-size: 10px;
      user-select: none;
      text-overflow: ellipsis;
      white-space: nowrap;
      max-width: 75px;
    }

    .v-avatar {
      cursor: pointer;
      user-select: none;
    }

    .v-list__tile__avatar {
      min-width: 42px;
    }

    .time {
      user-select: none;
      color: #757575;
    }

    .username {
      font-weight: 500;
      color: #9e9e9e;
      font-family: 'Audiowide', monospace;
    }

    blockquote p {
      font-weight: 500;
      color: #789922;
    }

    p img {
      height: 28px;
      vertical-align: middle;
    }
  }
</style>
