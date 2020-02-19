// Created by xander on 2/16/2020

importScripts('sw.js');

importScripts("https://www.gstatic.com/firebasejs/5.9.4/firebase-app.js");
importScripts("https://www.gstatic.com/firebasejs/5.9.4/firebase-messaging.js");

firebase.initializeApp({
  messagingSenderId: "XXXXXXXXXXXX"
});

if (firebase.messaging.isSupported()) {
  const messaging = firebase.messaging()
  messaging.setBackgroundMessageHandler(function(payload) {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);
    console.log('We are not on app background', payload)
    return registration.showNotification(payload.data.title, {
      body: payload.data.body,
      icon: `./chaudfontaine/icon.png`,
      badge: `./chaudfontaine/icon.png`,
      data: payload.data,
      image: `./chaudfontaine/ios-icon.png`,
    });
  });
  self.addEventListener('notificationclick', function(event) {
    console.log('[firebase-messaging-sw.js] Click on message ', event);
    clients.openWindow(event.notification.data.action);
    event.notification.close();
  });
};

console.log('Starting bitwave-notifications service worker!');
