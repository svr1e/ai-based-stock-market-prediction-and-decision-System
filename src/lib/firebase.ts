// Firebase configuration
import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
  updateProfile,
  type User,
} from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyB8zS0ibpvfFhgmPW-VX-igvBhyxwAi9n8",
  authDomain: "stock-b2418.firebaseapp.com",
  projectId: "stock-b2418",
  storageBucket: "stock-b2418.firebasestorage.app",
  messagingSenderId: "464454235998",
  appId: "1:464454235998:web:ae595f22718ccddc0a81cf",
  measurementId: "G-89DCS8RCCN",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export let analytics: any = null;
isSupported()
  .then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  })
  .catch((err) => {
    console.warn("Firebase Analytics not supported:", err);
  });

export const auth = getAuth(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

googleProvider.setCustomParameters({
  prompt: "select_account",
});

// Auth helpers
export const signInWithGoogle = () => signInWithPopup(auth, googleProvider);

export const signInWithEmail = (email: string, password: string) =>
  signInWithEmailAndPassword(auth, email, password);

export const signUpWithEmail = (email: string, password: string) =>
  createUserWithEmailAndPassword(auth, email, password);

export const resetPassword = (email: string) =>
  sendPasswordResetEmail(auth, email);

export const logOut = () => signOut(auth);

export const updateUserProfile = (user: User, data: { displayName?: string; photoURL?: string }) =>
  updateProfile(user, data);

export { onAuthStateChanged };
export type { User };
