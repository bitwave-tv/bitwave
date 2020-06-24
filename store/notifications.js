// Created by xander on 6/13/2020
import { auth, db } from '@/plugins/firebase.js';

import * as utils from '@/plugins/store-utils.js';
const logger = ( message, data ) => utils.logger( 'NOTIFICATIONS', message, data );

const toastErrorConfig = {
  icon: 'error',
  duration: 3000,
  position: 'bottom-left'
};

const toastSuccessConfig = {
  icon: 'done',
  duration: 3000,
  position: 'bottom-left'
};


// Define Store
const $states = {
  tokenFCM : 'TOKEN_FCM',
};

const $getters = {
  getTokenFCM : 'GET_TOKEN_FCM',
};

const $mutations = {
  setTokenFCM : 'SET_TOKEN_FCM',
};

const $actions = {
  requestTokenFCM  : 'REQUEST_TOKEN_FCM',
  saveTokenFCM     : 'SAVE_TOKEN_FCM',
  subscribeToUser  : 'SUB_TO_USER',
  unsubscribeFrom  : 'UNSUB_FROM_USER',
};


// Create Store
export const state = () => ({
  [$states.tokenFCM] : null,
});


// Getters
export const getters = {
  [$getters.getTokenFCM] ( state ) {
    return state[$states.tokenFCM];
  },
};


// Mutations
export const mutations = {
  [$mutations.setTokenFCM] ( state, token ) {
    state[$states.tokenFCM] = token;
  },
};


// Actions
export const actions = {

  // requests and retrieves notification permissions
  async [$actions.requestTokenFCM] ( { commit, dispatch } ) {
    try {
      const currentToken = await this.$messaging.getToken();
      if ( currentToken ) {
        console.log( `Got FCM token:`, currentToken );

        // sendTokenToServer( currentToken );
        // updateUIForPushEnabled( currentToken );

        commit( $mutations.setTokenFCM, currentToken );
        await dispatch( $actions.saveTokenFCM )

        this.$toast.success( `Push notifications permissions approved!!`, toastSuccessConfig );
      } else {
        // Show permission request.
        console.log( 'No Instance ID token available. Request permission to generate one.' );

        // updateUIForPushPermissionRequired();
        commit( $mutations.setTokenFCM, null );
        this.$toast.error( `Permission for notification was denied!`, toastErrorConfig );
      }
    } catch ( error ) {
      console.error( 'An error occurred while retrieving token. ', error );
      commit( $mutations.setTokenFCM, null );
      this.$toast.error( `Failed to enable notifications!<br>${error.message}`, toastErrorConfig );
    }
  },


  // Saves FCM token to database
  async [$actions.saveTokenFCM] ( { state, commit } ) {
    // TODO: force auth refresh

    const fcmToken = state[$states.tokenFCM];

    if ( !fcmToken ) {
      console.error( `Missing fcmToken!`, fcmToken );
      return;
    }

    const endpoint = 'https://api.bitwave.tv/v1/fcm/set-token';
    // const endpoint = 'http://localhost:4000/v1/fcm/set-token';
    const payload  = {
      user: 'notif',
      fcmToken: fcmToken,
    };

    try {
      const result = await this.$axios.post( endpoint, payload );
      console.log( result );
    } catch ( error ) {
      console.error( `Error occured while saving fcmToken!`, error );
      this.$toast.error( `Failed to save FCM Token!<br>${error.message}`, toastErrorConfig );
    }

    console.log( `Saved FCM token` );
  },


  // Subs to a user
  async [$actions.subscribeToUser] ( { state, commit }, channel ) {
    // TODO: force auth refresh

    const fcmToken = state[$states.tokenFCM];

    if ( !fcmToken ) {
      console.error( `Missing fcmToken!`, fcmToken );
      return;
    }

    const endpoint = 'https://api.bitwave.tv/v1/fcm/subscribe';
    // const endpoint = 'http://localhost:4000/v1/fcm/subscribe';
    const payload  = {
      user: 'notif',
      fcmToken: fcmToken,
      channel: channel,
    };

    try {
      const result = await this.$axios.post( endpoint, payload );
      console.log( result );
    } catch ( error ) {
      console.error( `Error occured while saving fcmToken!`, error );
      this.$toast.error( `Failed to subscribe to ${channel}!<br>${error.message}`, toastErrorConfig );
    }

    console.log( `Subscribed to ${channel}` );
  },


  // Unsub from a user
  async [$actions.unsubscribeFrom] ( { state, commit }, channel ) {
    // TODO: force auth refresh

    const fcmToken = state[$states.tokenFCM];

    if ( !fcmToken ) {
      console.error( `Missing fcmToken!`, fcmToken );
      return;
    }

    const endpoint = 'https://api.bitwave.tv/v1/fcm/unsubscribe';
    // const endpoint = 'http://localhost:4000/v1/fcm/unsubscribe';
    const payload  = {
      user: 'notif',
      fcmToken: fcmToken,
      channel: channel,
    };

    try {
      const result = await this.$axios.post( endpoint, payload );
      console.log( result );
    } catch ( error ) {
      console.error( `Error occured while saving fcmToken!`, error );
      this.$toast.error( `Failed to unsubscribe to ${channel}!<br>${error.message}`, toastErrorConfig );
    }

    console.log( `Unsubscribed from ${channel}` );
  },

};


// Export Store Structure
export const VNotifications = {
  namespace : 'notifications',
  $states,
  $getters,
  $mutations,
  $actions,
};
