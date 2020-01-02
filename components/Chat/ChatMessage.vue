<template functional>
  <div class="msg d-flex pt-1 ml-3 mr-1">

    <!-- Chat Avatar -->
    <div
      class="v-avatar mr-2 mt-2"
      @click="listeners.reply( props.username )"
    >
      <!-- Todo: add crossorigin -->
      <img
        v-if="!!props.avatar"
        :src="props.avatar"
        :alt="props.username"
        :key="props.username"
      >
      <!--<img
        v-else
        src="https://cdn.bitwave.tv/static/img/santahat-100.png"
        alt="santa troll"
        :style="{ background: props.color }"
        class="pa-1"
      >-->
      <div
        v-else
        class="v-icon notranslate material-icons"
        :style="{ background: props.color }"
      >person</div>
    </div>

    <!-- Chat Content -->
    <div class="flex-grow-1 content">

      <!-- Message Header -->
      <div class="d-flex align-center">

        <!-- Timestamp & Username -->
        <div class="flex-grow-1 subtitle-2 align-center">
          <span class="time">{{ props.timestamp }}</span>
          <div class="d-inline-block global">{{ props.global }}</div>
          <span class="username" :style="props.userStyling" v-html="props.displayName" />
        </div>

        <!-- Room Label -->
        <div class="flex-shrink-1">
          <nuxt-link :to="props.channel">
            <kbd>{{ props.channel }}</kbd>
          </nuxt-link>
        </div>
      </div>

      <!-- Chat Body -->
      <slot></slot>
    </div>
  </div>
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
      global: {
        type: Boolean|undefined,
        required: false,
      }
    },
  }
</script>

<style lang='scss'>
  .msg {
    word-break: break-word;
    max-height: 20rem;
    overflow: hidden;

    kbd {
      background-color: #607D8B99;
      font-size: 10px;
      user-select: none;
      text-overflow: ellipsis;
      white-space: nowrap;
      overflow: hidden;
      max-width: 75px;
    }

    .v-avatar {
      cursor: pointer;
      user-select: none;

      align-items: center;
      border-radius: 50%;
      display: inline-flex;
      justify-content: center;
      line-height: normal;
      position: relative;
      text-align: center;
      vertical-align: middle;

      height: 32px;
      min-width: 32px;
      width: 32px;
    }

    .v-list-item__avatar {
      min-width: 42px;
    }

    .content {
      overflow: hidden;
    }

    .time,
    .global {
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
