<template>
  <v-flex mr-3 shrink>

    <v-menu
      v-model="notificationMenu"
      :close-on-content-click="true"
      :nudge-width="200"
      :max-width="400"
      offset-x
      left
      origin="top right"
      transition="slide-y-transition"
    >
      <template #activator="{ on }">
        <v-btn
          v-on="on"
          icon
          flat
        >
          <v-badge right color="red">
            <template #badge>
              <span>{{ notifications.length }}</span>
            </template>
              <v-icon class="ml-1">notifications</v-icon>
          </v-badge>
        </v-btn>
      </template>

      <v-card>
        <v-list class="py-0" color="yellow">
          <v-list-tile>

            <v-list-tile-avatar>
              <v-icon class="ml-1">notifications</v-icon>
            </v-list-tile-avatar>

            <v-list-tile-content>
              <v-list-tile-title>{{ username }}</v-list-tile-title>
            </v-list-tile-content>

          </v-list-tile>
        </v-list>

        <v-divider/>

        <v-sheet
          color="#222"
        >
          <v-list single-line :style="{ background: 'transparent' }">
            <v-list-tile v-for="notification in notifications" :key="notification.id">
              <v-list-tile-action>
                <v-icon>{{ notification.icon }}</v-icon>
              </v-list-tile-action>
              <v-list-tile-content>
                <v-list-tile-title>{{ notification.title }}</v-list-tile-title>
                <v-list-tile-sub-title>{{ notification.message }}</v-list-tile-sub-title>
              </v-list-tile-content>
            </v-list-tile>
          </v-list>
        </v-sheet>
      </v-card>
    </v-menu>

  </v-flex>
</template>

<script>
    export default {
        name: 'Notifications',

        data() {
            return {
              username: 'Notifications',
              notificationMenu: false,

              notifications: [
                {
                  id: 0,
                  icon: 'mail',
                  title: 'Admin',
                  message: 'Coming Soon ™',
                },
              ]
            }
        },

        methods: {},

        computed: {},
    }
</script>
