import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, type Auth } from "firebase/auth";

const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "homeal-10b67";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  // Use custom authDomain if set, otherwise fall back to default Firebase domain.
  // Custom domains (e.g. auth.homeal.uk) can break if DNS/SSL drifts.
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || `${projectId}.firebaseapp.com`,
  projectId,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let _app: FirebaseApp | undefined;
let _auth: Auth | undefined;
let _initError: Error | undefined;

function getFirebaseApp(): FirebaseApp {
  if (_initError) throw _initError;
  if (!_app) {
    try {
      _app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    } catch (err) {
      _initError = err instanceof Error ? err : new Error("Firebase initialization failed");
      console.error("[Firebase] Init failed:", _initError.message);
      throw _initError;
    }
  }
  return _app;
}

export function getFirebaseAuth(): Auth {
  if (!_auth) {
    _auth = getAuth(getFirebaseApp());
  }
  return _auth;
}

/** Returns true if Firebase is properly configured */
export function isFirebaseConfigured(): boolean {
  return !!(firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId);
}

export const googleProvider = new GoogleAuthProvider();
