// Created by xander on 6/13/2020

// Give the service worker access to Firebase Messaging.
// Note that you can only use Firebase Messaging here, other Firebase libraries
// are not available in the service worker.
importScripts('https://www.gstatic.com/firebasejs/7.15.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/7.15.0/firebase-messaging.js');

// Initialize the Firebase app in the service worker by passing in your app's Firebase config object.
// https://firebase.google.com/docs/web/setup#config-object
const firebaseConfig = {
  apiKey: "AIzaSyCgIwubBz-nTd0mof6l7eklzJk1evuwzhg",
  authDomain: "bitwave-7f415.firebaseapp.com",
  databaseURL: "https://bitwave-7f415.firebaseio.com",
  projectId: "bitwave-7f415",
  storageBucket: "bitwave-7f415.appspot.com",
  messagingSenderId: "246532190856",
  appId: "1:246532190856:web:314a8853ea0f20717ee53d",
  measurementId: "G-W05DKSF957",
};

if ( !firebase.apps.length ) {
  firebase.initializeApp( firebaseConfig );
}

// Retrieve an instance of Firebase Messaging so that it can handle background messages.
const messaging = firebase.messaging();



// Handle incoming messages. Called when:
// - a message is received while the app has focus
// - the user clicks on an app notification created by a service worker
//   `messaging.setBackgroundMessageHandler` handler.
/*messaging.onMessage(( payload ) => {
  console.log( 'Message received. ', payload );
  // ...
});*/



messaging.setBackgroundMessageHandler( ( payload ) => {
  console.log( '[firebase-messaging-sw.js] Received background message ', payload );

  // Customize notification here
  const notificationTitle = '[bitwave.tv]';
  const notificationOptions = {
    body: 'Test notification',
    icon: '/images/icon-2.png',
  };

  return self.registration.showNotification( notificationTitle, notificationOptions );
});


