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
    <chat-overflow-menu :channel="page"/>
  </v-menu>
</template>

<script>
const ChatOverflowMenu = async () => await import ( '@/components/Chat/ChatOverflowMenu/ChatOverflowMenu' );

  export default {
    name: 'ChatOverflowMenuButton',

    components: {
      ChatOverflowMenu,
    },

    props: {
      page: { type: String },
    },

    data () {
      return {};
    },

    methods: {},

    computed: {},
  };
</script>
