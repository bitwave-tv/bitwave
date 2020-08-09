<template>
  <!-- Admin Menu -->
  <v-menu
    v-model="adminActionsMenu"
    :close-on-content-click="false"
    bottom
    left
    offset-y
    transition="slide-y-transition"
  >
    <template #activator="{ on }">
      <v-btn
        v-on="on"
        small
        icon
        class="px-0 mr-2"
      >
        <v-icon>verified_user</v-icon>
      </v-btn>
    </template>

    <!-- Chat Admin Menu -->
    <lazy-chat-admin-menu
      @close="adminActionsMenu = false"
    />

  </v-menu>
</template>

<script>
  export default {
    name: 'ChatAdminMenuButton',

    data () {
      return {
        adminActionsMenu: false,
      };
    },
  };
</script>
