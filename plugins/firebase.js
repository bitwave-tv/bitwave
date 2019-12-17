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


/**
 * Manage firebase authentication
 */
import { VStore } from '@/store';

export default ( { app } ) => {
  if ( process.client ) {
    if ( process.env.APP_DEBUG ) console.log( '[Firebase] Plugin ran (client only)', app );

    // Listen for authentication changes
    auth.onAuthStateChanged( async user => {
      // Handle login
      if ( user ) {
        if ( process.env.APP_DEBUG ) console.log( '[Firebase] Authenticated', user );
        app.store.dispatch( VStore.$actions.login, user );
      } else {
        if ( process.env.APP_DEBUG ) console.log( '[Firebase] Not Authenticated' );
      }
    }, async error => {
      console.error( 'Auth Error:', error )
    });
  }
}
