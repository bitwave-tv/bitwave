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

export { auth, db }
