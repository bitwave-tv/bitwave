<template functional>
  <div class="msg d-flex">

    <!-- Chat Avatar -->
    <div
      v-if="props.showAvatar"
      class="v-avatar mr-2 mt-2"
      @click="listeners.reply( props.username )"
      @dblclick="listeners.whisper( props.username )"
    >
      <!-- Todo: add crossorigin -->
      <img
        v-if="props.avatar"
        :src="props.avatar"
        :alt="props.username"
        :key="props.avatar"
      >
      <img
        v-else
        src="https://cdn.bitwave.tv/static/img/troll_hazzie.png"
        alt="hazmat suit bitwave troll"
        :style="{ background: props.color }"
      >
    </div>

    <!-- Chat Content -->
    <div class="flex-grow-1 content">

      <!-- Message Header -->
      <div class="d-flex align-center">

        <!-- Timestamp & Global / Local tag -->
        <div class="bw-meta subtitle-2 flex-shrink-0">
          <span
            v-text="props.timestamp.short"
            class="time"
            :title="props.timestamp.long"
          ></span>
          <span
            v-text="props.global"
            class="global"
            :title="`${props.global ? 'global' : 'local'} chat`"
          ></span>
        </div>

        <!-- User Badge -->
        <div
          v-if="props.badge"
          class="badge pl-1 d-flex align-center text-no-wrap"
          v-html="props.badge"
        ></div>

        <!-- Username -->
        <div
          class="username text-truncate subtitle-2 pl-1"
          :style="props.userStyling"
          v-html="props.displayName"
          @click="listeners.select( props )"
        />

        <div class="flex-grow-1"></div>

        <!-- Room Label -->
        <a
          v-if="props.showChannel"
          :href="props.routePrefix + props.channel"
          @click.prevent="listeners.goto( props.routePrefix + props.channel )"
        >
          <kbd
            v-text="props.channel"
            :title="props.channel"
          ></kbd>
        </a>
      </div>

      <!-- Chat Body -->
      <div
        class="body-2 msg"
        v-html="props.message"
      ></div>

    </div>
  </div>
</template>

<script>
  export default {
    name: 'ChatMessage',

    props: {
      avatar: {},
      showAvatar: {
        type: Boolean,
        default: true,
      },
      badge: {
        type: String
      },
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
      routePrefix: {
        type: String
      },
      channel: {
        type: String,
      },
      showChannel: {
        type: Boolean
      },
      timestamp: {
        type: Object,
      },
      global: {
        type: Boolean | undefined,
        required: false,
      }
    },
  }
</script>

<style lang='scss'>
  $chat-avatar-size: 32px;

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
      max-width: 90px;
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

      height: $chat-avatar-size;
      min-width: $chat-avatar-size;
      width: $chat-avatar-size;
    }

    .v-list-item__avatar {
      min-width: $chat-avatar-size;
    }

    .content {
      overflow: hidden;
    }

    .bw-meta {
      user-select: none;
      color: #757575;
    }

    .time,
    .global {
      font-size: .75rem;
    }

    .username {
      font-weight: 500;
      color: #9e9e9e;
      font-family: 'IBM Plex Sans', sans-serif !important;
      cursor: pointer;
    }

    blockquote p {
      font-weight: 500;
      color: #789922;
    }

    p img {
      height: 28px;
      vertical-align: middle;
    }

    img {
      min-width: 20px;
    }


    /* Big / Smol Text Styling */

    h1, h2, h3, h4, h5, h6 {
      line-height: 1.0;
    }

    h1 {
      font-size: 1.375rem;
      font-weight: 700;
    }

    h2 {
      font-size: 1.25rem;
      font-weight: 700;
    }

    h3 {
      font-size: 1.00rem;
      font-weight: 700;
    }

    h4 {
      font-size: 0.875rem;
      font-weight: 500;
    }

    h5 {
      font-size: 0.75rem;
      font-weight: 500;
    }

    h6 {
      font-size: 0.625rem;
      font-weight: 500;
    }

  }
</style>
