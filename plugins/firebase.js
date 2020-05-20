import * as firebase from 'firebase/app'

import 'firebase/auth'
import 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyCgIwubBz-nTd0mof6l7eklzJk1evuwzhg",
  authDomain: "bitwave-7f415.firebaseapp.com",
  databaseURL: "https://bitwave-7f415.firebaseio.com",
  projectId: "bitwave-7f415",
  storageBucket: "bitwave-7f415.appspot.com",
  messagingSenderId: "246532190856",
  appId: "1:246532190856:web:314a8853ea0f20717ee53d",
  measurementId: "G-W05DKSF957"
};

if ( !firebase.apps.length ) {
  firebase.initializeApp( firebaseConfig );
}

const auth = firebase.auth();
const db = firebase.firestore();
const FieldValue = firebase.firestore.FieldValue;
const EmailAuthProvider = firebase.auth.EmailAuthProvider;

export { auth, db, FieldValue, EmailAuthProvider }


const listenToAuthState = ( callback ) => {
  return auth.onAuthStateChanged( async user => {
    const runParallel = [];
    // Handle login
    if ( user ) {
      if ( process.env.APP_DEBUG ) console.log( '[Firebase] Authenticated', user );
      runParallel.push( callback( user ) );
    } else {
      if ( process.env.APP_DEBUG ) console.log( '[Firebase] Not Authenticated' );
      runParallel.push( callback( null ) );
    }
    await Promise.all( runParallel );
  }, async error => {
    console.error( 'Auth Error:', error );
    this.$sentry.captureException( error );
  });
};


export const listenToConfiguationUpdates = callbacks => {
  return db
    .collection( 'configurations' )
    .doc( 'bitwave.tv' )
    .onSnapshot( async doc => {
      const data = doc.data();
      await Promise.all( callbacks.map( async cb => await cb( data ) ) );
    }, error => {
      console.error( 'DB Configuration Query Failed:', error );
      this.$sentry.captureException( error );
    });
};


export const listenToFeatureFlags = callbacks => {
  return db
    .collection( 'configurations' )
    .doc( 'features' )
    .onSnapshot( async doc => {
      const data = doc.data();
      await Promise.all( callbacks.map( async cb => await cb( data ) ) );
    }, error => {
      console.error( 'Feature Flags Query Failed', error );
      this.$sentry.captureException( error );
    });
};


/**
 * Manage firebase authentication
 */
import { VStore } from '@/store';

export default async ( { app, store } ) => {
  // only run client side
  if ( process.client ) {
    if ( process.env.APP_DEBUG ) console.log( '[Firebase] Plugin ran (client only)', app );

    // Listen for authentication changes
    listenToAuthState( async user => {
      if ( user ) await store.dispatch( VStore.$actions.login, user );
      // else await store.dispatch( VStore.$actions.logout );
    });

    // Listen to the configuration, and dispatch updates
    listenToConfiguationUpdates([
      async ({ version }) => await store.dispatch( VStore.$actions.newVersionAvailable, version ),
      async ({ alerts }) => await store.dispatch( VStore.$actions.updateAlerts, alerts ),
    ]);

    // Listen to the feature flags, and dispatch updates
    listenToFeatureFlags([
      async ( featureFlags ) => await store.dispatch( VStore.$actions.updateFeatureFlags, featureFlags ),
    ]);

  }
}
