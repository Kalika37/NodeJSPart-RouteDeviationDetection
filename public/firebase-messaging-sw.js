importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js");

// Your Firebase config (same as frontend)
firebase.initializeApp({
            apiKey: "AIzaSyB-0U5MLDgeJmlc3Ulp0JX1wseOMAehztY",
            authDomain: "sosdevice-29238.firebaseapp.com",
            projectId: "sosdevice-29238",
            storageBucket: "sosdevice-29238.firebasestorage.app",
            messagingSenderId: "304291542366",
            appId: "1:304291542366:web:c36e7205ff7c5d66180bcf",
            measurementId: "G-M9FJCJBTXW"
        });

const messaging = firebase.messaging();

// Handle background notifications
messaging.onBackgroundMessage(function(payload) {
  console.log("Received background message:", payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: "/icon.png" // optional
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});