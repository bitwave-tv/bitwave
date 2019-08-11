<template>
  <v-flex mr-3 shrink>

    <v-menu
      v-model="notificationMenu"
      :close-on-content-click="true"
      :nudge-width="200"
      :max-width="400"
      offset-y
      left
      origin="top right"
      transition="slide-y-transition"
    >
      <template #activator="{ on }">
        <v-btn
          v-on="on"
          icon
          flat
          @click="markAsRead"
        >
          <v-badge
            :value="notificationCount > 0"
            color="red"
            right
          >
            <template #badge>
              <span>{{ notificationCount }}</span>
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

            <v-list-tile v-if="notifications.length === 0">
              <v-list-tile-action>
                <v-icon>done</v-icon>
              </v-list-tile-action>
              <v-list-tile-content>
                <v-list-tile-title>No New Notifications</v-list-tile-title>
              </v-list-tile-content>
            </v-list-tile>

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
  import { auth, db } from '@/plugins/firebase.js'

  import { mapGetters } from 'vuex'

  export default {
    name: 'Notifications',

    data() {
      return {
        username: 'Notifications',
        notificationMenu: false,

        notifications: [],

        unsubscribeNotifications: null,
      }
    },

    methods: {
      authenticated ( user ) {
        if ( user ) {
          this.getNotifications( user.uid );
        } else {
          this.notifications = [];
        }
      },

      getNotifications ( uid ) {
        console.log( uid );
        const notificationsRef = db.collection( 'notifications' ).doc( uid ).collection( 'alerts' );
        const query = notificationsRef.orderBy( 'timestamp', 'desc' ).limit( 5 );
        this.unsubscribeNotifications = query.onSnapshot( snapshot => this.updateNotifications( snapshot ) );
      },

      updateNotifications ( snapshot ) {
        let notifications = [];
        snapshot.forEach( doc => {
          let data = doc.data();
          let id   = doc.id;
          notifications.push( { id, ...data } );
          console.log( { id, ...data } );
        });
        this.notifications = notifications;
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
          setTimeout( async () => await batch.commit(), 500 );
        }
      },
    },

    computed: {
      ...mapGetters({
        isAuth : 'isAuth',
        user   : 'user',
      }),

      notificationCount () {
        return this.notifications.filter( notification => !notification.read ).length;
      },
    },

    created () {
      auth.onAuthStateChanged( async user => await this.authenticated( user ) );
    },

    beforeDestroy () {
      if ( this.unsubscribeNotifications ) this.unsubscribeNotifications();
    },
  }
</script>
