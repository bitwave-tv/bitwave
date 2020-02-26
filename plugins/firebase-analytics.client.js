// Created by xander on 2/25/2020
import * as firebase from 'firebase/app'

import 'firebase/analytics'
import 'firebase/performance'

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

// Inject Firebase Analytics
export default async ( ctx, inject ) => {
  const defaultPerformance = firebase.performance();
  const analytics = firebase.analytics();
  inject( 'analytics', analytics );
}
