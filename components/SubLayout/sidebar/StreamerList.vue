<template>
  <!-- User Channels -->
  <div
    class="d-flex flex-column flex-vertical hide-scrollbar"
    style="overflow-y: auto; overscroll-behavior-y: contain;"
  >
    <v-list
      class="pt-0"
      dense
    >

      <!-- Streamers currently live -->
      <live-streamers />

      <!-- Following -->
      <followed-streamers />

    </v-list>
  </div>
</template>

<script>
  import FollowedStreamers from '@/components/SubLayout/sidebar/StreamerList/FollowedStreamers';
  import LiveStreamers from '@/components/SubLayout/sidebar/StreamerList/LiveStreamers';

  export default {
    name: 'StreamerList',
    components: { LiveStreamers, FollowedStreamers },
    serverCacheKey: () => Math.trunc( Date.now() / ( 1000 * 30 ) ),

    data() {
      return {}
    },

  }
</script>

<style lang="scss">
  .v-application {
    .tight--text {
      letter-spacing: 0 !important;
    }
  }
</style>
