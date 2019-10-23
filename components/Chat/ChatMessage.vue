<template functional>
  <v-flex class="msg">
    <div class="d-flex py-1 ml-3 mr-1">
      <v-avatar
        class="mr-2"
        size="32"
        @click="listeners.reply(props.username)"
      >
        <img v-if="!!props.avatar" :src="props.avatar" :alt="props.username">
        <v-icon v-else :style="{ background: props.color }">person</v-icon>
      </v-avatar>

      <v-list-item-content class="py-0">
        <v-list-item-subtitle>
          <div class="d-flex">
            <div class="d-flex-shrink-1">
              <span class="time">{{ props.timestamp }}</span>
              <span class="username" :style="props.userStyling" v-html="props.displayName"></span>
            </div>
            <div class="flex-grow-1"></div>
            <div class="d-flex-shrink-1">
              <nuxt-link
                :to="props.channel"
              >
                <kbd>{{ props.channel }}</kbd>
              </nuxt-link>
            </div>
          </div>
        </v-list-item-subtitle>
        <slot></slot>
      </v-list-item-content>
    </div>
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

    .v-list-item__avatar {
      min-width: 42px;
    }

    .time {
      user-select: none;
      color: #757575;
    }

    .username {
      font-weight: 500;
      color: #9e9e9e;
      font-family: 'IBM Plex Sans', sans-serif;
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
