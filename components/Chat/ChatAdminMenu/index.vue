<template>
  <!-- Admin Menu -->
  <v-menu
    v-if="isAdmin"
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
        class="px-0"
      >
        <v-icon>verified_user</v-icon>
      </v-btn>
    </template>

    <!-- Chat Admin Menu -->
    <chat-admin-menu @close="adminActionsMenu = false" />
  </v-menu>
</template>

<script>
import { mapGetters } from 'vuex';
import { VStore } from '@/store';

const ChatAdminMenu = async () => await import ( '@/components/Admin/ChatAdminMenu' );

  export default {
    name: 'ChatAdminMenuButton',

    components: {
      ChatAdminMenu,
    },

    props: {},

    data () {
      return {
        adminActionsMenu: false,
      };
    },

    methods: {},

    computed: {
      ...mapGetters({
        isAdmin: VStore.$getters.isAdmin,
      }),
    },
  };
</script>
