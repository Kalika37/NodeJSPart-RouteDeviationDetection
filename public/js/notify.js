const swRegistration = navigator.serviceWorker.register("/firebase-messaging-sw.js");


// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getMessaging, getToken } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging.js";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
window.getToken = getToken
// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyB-0U5MLDgeJmlc3Ulp0JX1wseOMAehztY",
    authDomain: "sosdevice-29238.firebaseapp.com",
    projectId: "sosdevice-29238",
    storageBucket: "sosdevice-29238.firebasestorage.app",
    messagingSenderId: "304291542366",
    appId: "1:304291542366:web:c36e7205ff7c5d66180bcf",
    measurementId: "G-M9FJCJBTXW"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);
window.messaging = messaging
window.getTokenFCM = async function () {
    const permission = await Notification.requestPermission();
    await navigator.serviceWorker.ready; // 🔥 IMPORTANT for Edge
    console.log(permission)
    if (permission !== "granted") {
        alert("Permission denied");
        return;
    }
    // setTimeout(async ()=>{
    //     const token = await getToken(messaging, {
    //     vapidKey: "BCr2HA1qPIaQExEWGEkmys-UlOIG3eBtXaFdagfWDG4CiEqEAkPwnZ23WW1PBLT6-CxemWn_td5XQ0w9ZV1Xvwg"
    // });
    // console.log(token)
    // }, 1000)
    const token = await getToken(messaging, {
        vapidKey: "BCr2HA1qPIaQExEWGEkmys-UlOIG3eBtXaFdagfWDG4CiEqEAkPwnZ23WW1PBLT6-CxemWn_td5XQ0w9ZV1Xvwg"
    });
    console.log(token)
    return token
};
