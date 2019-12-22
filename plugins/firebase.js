import * as firebase from 'firebase/app'

import 'firebase/auth'
import 'firebase/firestore'

if ( !firebase.apps.length ) {
  firebase.initializeApp({
    apiKey: "AIzaSyCgIwubBz-nTd0mof6l7eklzJk1evuwzhg",
    authDomain: "bitwave.tv",
    databaseURL: "https://bitwave-7f415.firebaseio.com",
    projectId: "bitwave-7f415",
    storageBucket: "bitwave-7f415.appspot.com",
    messagingSenderId: "246532190856",
  });
}

const auth = firebase.auth();
const db = firebase.firestore();
const FieldValue = firebase.firestore.FieldValue;

export { auth, db, FieldValue }


const listenToAuthState = ( callback ) => {
  return auth.onAuthStateChanged( async user => {
    // Handle login
    if ( user ) {
      if ( process.env.APP_DEBUG ) console.log( '[Firebase] Authenticated', user );
      await callback( user );
    } else {
      if ( process.env.APP_DEBUG ) console.log( '[Firebase] Not Authenticated' );
    }
  }, async error => {
    console.error( 'Auth Error:', error )
  });
};

const checkForUpdate = async () => {
  const currentVersion = process.env.VERSION;
  const versions = ( await db.collection( 'configurations' ).doc( 'bitwave.tv' ).get() ).data().version; // add ? chaining
  console.log( `[bitwave.tv] - ${process.env.BITWAVE_ENV}\nCurrent version: ${currentVersion}\nLatest versions:`, versions );
  return currentVersion < versions[process.env.BITWAVE_ENV]
    ? versions[process.env.BITWAVE_ENV]
    : false ;
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
    const stopListener = listenToAuthState( user => store.dispatch( VStore.$actions.login, user ) );

    const newVersion = await checkForUpdate();
    if ( newVersion ) await store.dispatch( VStore.$actions.newVersionAvailable, newVersion );
  }
}
