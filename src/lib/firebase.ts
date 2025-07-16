
import { initializeApp, getApps, getApp, FirebaseOptions } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Check for missing environment variables during development
if (process.env.NODE_ENV !== 'production') {
    for (const key in firebaseConfig) {
        if (firebaseConfig[key as keyof FirebaseOptions] === undefined) {
            console.error(`Firebase config is missing or undefined for key: ${key}. Make sure all NEXT_PUBLIC_FIREBASE_* environment variables are set in your .env file and the server is restarted.`);
        }
    }
}

// Initialize Firebase safely for both client and server environments (Singleton Pattern)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export { db };
