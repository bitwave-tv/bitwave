<template>
  <v-flex
    shrink
    my-2
  >
    <v-layout
      row
      px-3
    >
      <v-list-tile-avatar>
        <slot name="avatar">
          <v-icon :class="['orange lighten-1 white--text']">person</v-icon>
        </slot>
      </v-list-tile-avatar>
      <v-list-tile-content>
        <v-list-tile-sub-title>
          {{ username }}
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
      username: {
        type: String,
      },
    },

    data() {
      return {}
    },
  }
</script>
