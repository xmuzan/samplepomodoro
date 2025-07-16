
// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDRikfsPvUVvEgVnZWcby2nbjuVE-awlUY",
  authDomain: "system-tasker-9nocl.firebaseapp.com",
  projectId: "system-tasker-9nocl",
  storageBucket: "system-tasker-9nocl.appspot.com",
  messagingSenderId: "471061573536",
  appId: "1:471061573536:web:d7b597b7bf4dbced90bec5"
};

// Initialize Firebase for SSR and SSG, preventing duplicate app instances
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export { app, db };
