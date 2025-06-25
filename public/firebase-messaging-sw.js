/* eslint-disable no-undef, no-restricted-globals */
importScripts(
  'https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js'
  );
importScripts(
  'https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js'
  );

firebase.initializeApp({
  apiKey: "AIzaSyCdKNjI1RCOGA0dpN364ppPOj5KXPxDcrk",
  authDomain: "portlist-4d7f3.firebaseapp.com",
  projectId: "portlist-4d7f3",
  storageBucket: "portlist-4d7f3.appspot.com",
  messagingSenderId: "729223120011",
  appId: "1:729223120011:web:b12fac663490905219c08e"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
 self.registration.showNotification(payload.notification.title, {
    body: payload.notification.body,
    icon: '/logo192.png'
  });
}); 