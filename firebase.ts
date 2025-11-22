// Fix: Added standard Firebase initialization code.
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// IMPORTANT: Firebase configuration is now loaded from environment variables.
// Create a `.env.local` file with the VITE_FIREBASE_* variables listed in the README.
const firebaseConfig = {
  apiKey: (import.meta.env as any).VITE_FIREBASE_API_KEY || "YOUR_API_KEY",
  authDomain: (import.meta.env as any).VITE_FIREBASE_AUTH_DOMAIN || "YOUR_AUTH_DOMAIN",
  projectId: (import.meta.env as any).VITE_FIREBASE_PROJECT_ID || "YOUR_PROJECT_ID",
  storageBucket: (import.meta.env as any).VITE_FIREBASE_STORAGE_BUCKET || "YOUR_STORAGE_BUCKET",
  messagingSenderId: (import.meta.env as any).VITE_FIREBASE_MESSAGING_SENDER_ID || "YOUR_MESSAGING_SENDER_ID",
  appId: (import.meta.env as any).VITE_FIREBASE_APP_ID || "YOUR_APP_ID",
  measurementId: (import.meta.env as any).VITE_FIREBASE_MEASUREMENT_ID || "YOUR_MEASUREMENT_ID"
};

// A function to check if the firebase config is set
// This will be true if the apiKey is not the default placeholder.
export const isFirebaseConfigured = firebaseConfig.apiKey !== "YOUR_API_KEY";

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize and export Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);