<template>
    <div>
      <v-menu
        v-model="adminActionsMenu"
        :close-on-content-click="false"
        bottom
        offset-y
        transition="slide-y-transition"
      >
        <template #activator="{ on }">
          <v-btn
            v-on="on"
            color="red"
            class="mr-2"
            small
          >
            Admin
          </v-btn>
        </template>

        <!-- Channel Admin Tools -->
        <admin-channel-menu
          @close="adminActionsMenu = false"
          :streamer="streamer"
        />

      </v-menu>
    </div>
</template>

<script>
  import AdminChannelMenu from '@/components/Admin/AdminChannelButton/AdminChannelMenu';

  export default {
    name: 'index',

    components: { AdminChannelMenu },

    props: {
      streamer: { type: String },
    },

    data() {
      return {
        adminActionsMenu: false,
      };
    },
  };
</script>
