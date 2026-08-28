import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: "mediflow-ai-39cf6.firebaseapp.com",
  projectId: "mediflow-ai-39cf6",
  storageBucket: "mediflow-ai-39cf6.firebasestorage.app",
  messagingSenderId: "387095304712",
  appId: "1:387095304712:web:db1d54a164e74625cdcfbd",
  measurementId: "G-JQNQCKPNN5"
};

// Initialize Firebase only if it hasn't been initialized yet
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

export { app, auth };
