<template>
  <div>
    <v-menu
      v-model="notificationMenu"
      :close-on-content-click="true"
      left
      offset-y
      transition="slide-y-transition"
      :max-width="$vuetify.breakpoint.mdAndDown ? '95%' : '375px'"
    >
      <template #activator="{ on }">
        <v-btn
          v-on="on"
          icon
          text
          @click="markAsRead"
        >
          <v-badge
            :value="notificationCount > 0"
            color="red"
            right
            overlap
          >
            <template #badge>
              <span>{{ notificationCount }}</span>
            </template>
            <v-icon>notifications</v-icon>
          </v-badge>
        </v-btn>
      </template>

      <v-card>
        <v-sheet
          tile
          color="primary"
          class="pl-2 d-flex justify-space-between align-center"
        >
          <h5 class="black--text body-2">
            <v-icon color="grey darken-4">notifications</v-icon>
            Notifications
          </h5>
          <v-btn
            color="black"
            text
            icon
            pa-0
            @click="notificationMenu = !notificationMenu"
          >
            <v-icon color="black">close</v-icon>
          </v-btn>
        </v-sheet>

        <v-sheet
          color="#222"
        >
          <v-list
            single-line
            :style="{ background: 'transparent' }"
            class="pb-0"
            dense
          >
            <v-list-item
              v-if="filteredNotifications.length === 0"
            >
              <v-list-item-action>
                <v-icon>done</v-icon>
              </v-list-item-action>
              <v-list-item-content>
                <v-list-item-title>No New Notifications</v-list-item-title>
              </v-list-item-content>
            </v-list-item>

            <v-list-item
              v-for="notification in filteredNotifications"
              :key="notification.id"
              :to="notification.url"
            >
              <div>
                <div
                  v-if="notification.hasOwnProperty( 'avatar' )"
                  class="v-avatar va-32 mr-4"
                >
                  <img
                    :src="`${notification.avatar}`"
                    :alt="notification.streamer"
                  >
                </div>
                <v-icon v-else>{{ notification.icon }}</v-icon>
              </div>
              <v-list-item-content>
                <v-list-item-title class="d-flex justify-space-between">
                  <div class="text-truncate">{{ notification.title }}</div>
                </v-list-item-title>
                <v-list-item-subtitle>
                  <div class="grey--text">{{ notification.streamer }} - {{ timestamp( notification.timestamp.toDate() ) }}</div>
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-sheet>
      </v-card>
    </v-menu>
  </div>
</template>

<script>
  import { auth, db } from '@/plugins/firebase.js'

  import { mapGetters } from 'vuex'
  import { VStore } from '@/store';

  import { timeAgo } from '@/assets/js/time-ago';

  export default {
    name: 'Notifications',

    data() {
      return {
        unsubAuthChanged: null,
        title: 'Notifications',
        notificationMenu: false,
        notifications: [],
        showRead: true,
        unsubscribeNotifications: null,
      }
    },

    methods: {
      onAuthChanged ( user ) {
        if ( this.unsubscribeNotifications ) this.unsubscribeNotifications();
        if ( user ) {
          this.getNotifications( user.uid );
        } else {
          this.notifications = [];
        }
      },

      getNotifications ( uid ) {
        const notificationsRef = db.collection( 'notifications' ).doc( uid ).collection( 'alerts' );
        const query = notificationsRef.orderBy( 'timestamp', 'desc' ).limit( 5 );
        this.unsubscribeNotifications = query.onSnapshot( snapshot => this.updateNotifications( snapshot ) );
      },

      updateNotifications ( snapshot ) {
        this.notifications = [];
        snapshot.forEach( doc => {
          let data = doc.data();
          this.notifications.push( { id: doc.id, ...data } );
        });
      },

      async markAsRead () {
        if ( this.user ) {
          const uid = this.user.uid;
          let docIds = this.notifications.map( notification => notification.id );
          const batch = db.batch();
          docIds.forEach( docId => {
            let ref = db.collection( 'notifications' ).doc( uid ).collection( 'alerts' ).doc( docId );
            batch.update( ref, { 'read': true } );
          });
          setTimeout( async () => await batch.commit(), 750 );
        }
      },

      timestamp ( time ) {
        if ( time ) {
          try {
            return timeAgo( time );
          } catch {
            return 'now';
          }
        } else {
          return 'Unknown';
        }
      },
    },

    computed: {
      ...mapGetters({
        isAuth : VStore.$getters.isAuth,
        user   : VStore.$getters.getUser,
      }),

      notificationCount () {
        return this.notifications.filter( notification => !notification.read ).length;
      },

      filteredNotifications () {
        if ( this.showRead )
          return this.notifications;
        else
          return this.notifications.filter ( n => !n.read );
      },
    },

    created () {
      this.unsubAuthChanged = auth.onAuthStateChanged ( async user => await this.onAuthChanged ( user ) );
    },

    beforeDestroy () {
      if ( this.unsubAuthChanged ) this.unsubAuthChanged();
      if ( this.unsubscribeNotifications ) this.unsubscribeNotifications();
    },
  }
</script>

<style lang="scss">
  .v-avatar.va-32 {
    height: 32px;
    min-width: 32px;
    width: 32px;
  }
</style>
