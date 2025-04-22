
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDKLInuLcWCGlH3pUlEKVDk7yYziuT6cec",
  authDomain: "treasurebook-e2641.firebaseapp.com",
  projectId: "treasurebook-e2641",
  storageBucket: "treasurebook-e2641.firebasestorage.app",
  messagingSenderId: "235976888120",
  appId: "1:235976888120:web:8a024860a1d87928cafbcd",
  measurementId: "G-S5DWKX1F88"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const analytics = getAnalytics(app);

export default app;
