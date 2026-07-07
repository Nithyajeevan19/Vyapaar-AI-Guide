import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "ai-bussiness-consultant.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "ai-bussiness-consultant",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "ai-bussiness-consultant.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "38352656462",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:38352656462:web:1226d72b9e56eedcedcb1f"
};


export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
