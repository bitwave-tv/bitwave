<template>
  <!-- Overflow menu -->
  <v-menu
    :close-on-content-click="true"
    bottom
    left
    offset-y
    transition="slide-y-transition"
  >
    <template #activator="{ on }">
      <v-btn
        v-on="on"
        class="px-0"
        small
        icon
      >
        <v-icon>more_vert</v-icon>
      </v-btn>
    </template>

    <!-- Chat Overflow Menu -->
    <lazy-chat-overflow-menu-content :channel="page"/>
  </v-menu>
</template>

<script>
  export default {
    name: 'ChatOverflowMenuButton',

    props: {
      page: { type: String },
    },
  };
</script>
