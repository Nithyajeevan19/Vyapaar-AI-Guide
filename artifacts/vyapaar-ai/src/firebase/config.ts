import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDwu1mhJpTwBKFivVPqzswaL5qxAIwn1yE",
  authDomain: "ai-bussiness-consultant.firebaseapp.com",
  projectId: "ai-bussiness-consultant",
  storageBucket: "ai-bussiness-consultant.firebasestorage.app",
  messagingSenderId: "38352656462",
  appId: "1:38352656462:web:1226d72b9e56eedcedcb1f"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
