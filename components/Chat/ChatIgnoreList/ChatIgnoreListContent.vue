<template>
  <div>

    <!-- Users / Channels Tabs -->
    <v-tabs
      v-model="currentTab"
      class="no-focus"
      color="white"
      background-color="blue-grey darken-4"
    >
      <v-tab>Users</v-tab>
      <v-tab>Channels</v-tab>
    </v-tabs>

    <!-- Card Content -->
    <div class="px-2">

      <!-- Tab Content -->
      <v-tabs-items
        v-model="currentTab"
        touchless
      >
        <!-- Ignored Users List -->
        <v-tab-item>
          <user-ignore-list />
        </v-tab-item>

        <!-- Ignored Channels List -->
        <v-tab-item>
          <channel-ignore-list />
        </v-tab-item>
      </v-tabs-items>
    </div>

  </div>
</template>

<script>
  export default {
    name: 'ChatIgnoreListContent',

    data() {
      return {
        currentTab: 0,
      };
    },

    methods: {
      close () {
        this.show = false;
      },
    },
  };
</script>
