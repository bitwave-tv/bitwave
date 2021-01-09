<template>
  <div>
    <div class="d-flex">
      <!-- Comment Avatar -->
      <v-avatar size="38" class="mr-3">
        <img
          v-if="avatar"
          :src="avatar"
          :alt="username"
          :title="username"
          :key="username"
        >
        <img
          v-else
          src="https://cdn.bitwave.tv/static/img/troll_hazzie.png?_bw"
          alt="hazmat suit troll"
          crossorigin
        >
      </v-avatar>

      <!-- Comment Content -->
      <div>
        <!-- Comment Header -->
        <div class="d-flex align-end replay-comment-header">
          <!-- Username -->
          <div
            class="font-weight-medium body-2"
          >{{ username }}</div>
          <!-- Timestamp -->
          <div
            class="grey--text ml-2 caption"
            :title="timestamp"
          >{{ humanTimestamp }}</div>
        </div>

        <!-- Comment Body -->
        <div
          class="replay-comment-body body-2"
        >
          <template v-for="node in content">
            <!-- Timestamp query links -->
            <nuxt-link
              v-if="node.type === 'nuxt-link'"
              :to="node.value.to"
              @click.native="$emit( 'click:timestamp', node.value.to )"
            >{{ node.value.text }}</nuxt-link>

            <!-- Regular ol' text -->
            <template v-else>{{ node.value.toString() }}</template>
          </template>
        </div>

        <!-- Comment Actions -->
        <div>
          <v-btn
            text
            small
            color="grey"
            @click="$emit( 'reply', username )"
          >
            reply
          </v-btn>
        </div>
      </div>

    </div>

  </div>
</template>

<script>
  import { timeAgo } from '@/assets/js/time-ago';

  export default {
    name: 'comment',

    props: {
      avatar: { type: String },
      username: { type: String },
      timestamp: { type: Date },
      content: { type: Array },
    },

    data() {
      return {

      };
    },

    methods: {

    },

    computed: {
      humanTimestamp () {
        return timeAgo( this.timestamp );
      }
    },

    mounted () {

    },
  };
</script>

<style lang='scss'>
  .replay-comment-body {
    white-space: pre-line;
  }
</style>
