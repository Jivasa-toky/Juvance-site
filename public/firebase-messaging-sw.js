importScripts('https://www.gstatic.com/firebasejs/10.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyDsdKAFvg1aJUYXvUgzOnzVVn2meWD4Rcc",
  authDomain: "juvance-cave.firebaseapp.com",
  projectId: "juvance-cave",
  storageBucket: "juvance-cave.firebasestorage.app",
  messagingSenderId: "873435382584",
  appId: "1:873435382584:web:b52be0521a7b07d4ddf7cd"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: 'contents/favicon.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: "window" }).then(function(clientList) {
      // If calendar page is already open, focus it
      for (const client of clientList) {
        if (client.url.includes("calendar.html") && "focus" in client) {
          return client.focus();
        }
      }
      // Otherwise, open it in a new tab
      if (clients.openWindow) {
        return clients.openWindow('calendar.html');
      }
    })
  );
});