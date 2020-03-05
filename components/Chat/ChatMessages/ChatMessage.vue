<template functional>
  <div class="msg d-flex">

    <!-- Chat Avatar -->
    <div
      class="v-avatar mr-2 mt-2"
      @click="listeners.reply( props.username )"
      @dblclick="listeners.whisper( props.username )"
    >
      <!-- Todo: add crossorigin -->
      <img
        v-if="props.avatar"
        :src="props.avatar"
        :alt="props.username"
        :key="props.username"
      >
      <img
        v-else
        src="https://cdn.bitwave.tv/static/img/troll_hazzie.png?_bw"
        alt="hazmat suit trolll"
        :style="{ background: props.color }"
        :key="props.username"
        crossorigin
      >
      <!--<div
        v-else
        class="v-icon material-icons"
        :style="{ background: props.color }"
      >person</div>-->
    </div>

    <!-- Chat Content -->
    <div class="flex-grow-1 content">

      <!-- Message Header -->
      <div class="d-flex align-center">

        <!-- Timestamp & Global / Local tag -->
        <div class="bw-meta subtitle-2 flex-shrink-0">
          <span class="time" :title="props.timestamp.long">{{ props.timestamp.short }}</span>
          <span class="global" :title="`${props.global ? 'global' : 'local'} chat`">{{ props.global }}</span>
        </div>

        <!-- User Badge -->
        <div
          v-show="props.badge"
          class="badge pl-1 d-flex align-center"
          v-html="props.badge"
        ></div>

        <!-- Username -->
        <div
          class="username text-truncate flex-grow-1 subtitle-2 pl-1"
          :style="props.userStyling"
          v-html="props.displayName"
        />

        <!-- Room Label -->
        <nuxt-link
          :to="props.channel"
          no-prefetch
        >
          <kbd :title="props.channel">{{ props.channel }}</kbd>
        </nuxt-link>
      </div>

      <!-- Chat Body -->
      <slot/>

    </div>
  </div>
</template>

<script>
  export default {
    name: 'ChatMessage',

    props: {
      avatar: {},
      badge: { type: String },
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
        type: Object,
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

    img {
      min-width: 20px;
    }


    /* Big / Smol Text Styling */

    h1, h2, h3, h4, h5, h6 {
      line-height: 1.25;
    }

    h1 {
      font-size: 1.5rem;
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

    /*
    &.dense {
      h1, h2, h3 {
        font-size: 1rem;
      }
    }*/

  }
</style>