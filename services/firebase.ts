import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// ------------------------------------------------------------------
// FIREBASE CONFIGURATION
// Connected to Project: stories-by-tj-e411a
// ------------------------------------------------------------------

const firebaseConfig = {
  apiKey: "AIzaSyBH6_udgCmdS39vDrUgjrI-i7k0dlXwjtM",
  authDomain: "stories-by-tj-e411a.firebaseapp.com",
  projectId: "stories-by-tj-e411a",
  storageBucket: "stories-by-tj-e411a.firebasestorage.app",
  messagingSenderId: "850892213850",
  appId: "1:850892213850:web:141ce234c32791620dd263",
  measurementId: "G-S96SHLPD6S"
};

// Application logic to handle initialization
let app;
let db: any = null;

try {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    console.log(`System: Connected to Firebase Project: ${firebaseConfig.projectId}`);
} catch (e: any) {
    console.error("System: Firebase initialization error:", e);
    // Fallback to null so the app can degrade gracefully to offline mode if needed
    db = null;
}

export { db };