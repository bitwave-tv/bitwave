<template>
  <v-layout style="position: fixed; top:0; bottom: 0; width: 100%; margin-top: 48px;">
    <embed-chat dark></embed-chat>
  </v-layout>
</template>

<script>
  import Chat from '@/components/Chat/index'

  export default {
    name: 'chat',

    layout: 'barebones',

    components: {
      embedChat: Chat,
    },

    data() {
      return {}
    },
  }
</script>
