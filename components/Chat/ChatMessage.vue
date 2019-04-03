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
          <v-icon :class="classList">person</v-icon>
        </slot>
      </v-list-tile-avatar>
      <v-list-tile-content>
        <v-list-tile-sub-title>
          <kbd class="mr-1" style="background-color: #607D8B;">{{ channel || 'global' }}</kbd>
          <span class="font-weight-medium">{{ username }}</span>
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
      channel: {
        type: String,
      },
    },

    data() {
      return {
        color: '',
        colorList: ['orange', 'blue', 'purple', 'teal', 'green', 'yellow', 'blue-grey'],
      }
    },

    computed: {
      classList() {
        return [this.color, 'lighten-1', 'white--text'];
      },
    },

    mounted() {
      this.color = this.colorList[Math.floor(Math.random() * this.colorList.length)];
    },
  }
</script>
