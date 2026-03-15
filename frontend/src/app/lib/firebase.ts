/**
 * Firebase Auth integration. Provides init, token for API client, and sign-in helpers.
 * Set VITE_FIREBASE_* in .env (see .env.example).
 */
import { getApp, getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  type Auth,
  type UserCredential,
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

/** True when Firebase env vars are set (non-empty API key). Avoids auth/invalid-api-key on load. */
export function isFirebaseConfigured(): boolean {
  const key = import.meta.env.VITE_FIREBASE_API_KEY;
  return typeof key === 'string' && key.length > 0;
}

let app: FirebaseApp | null = null;
let auth: Auth | null = null;

export function getFirebaseApp(): FirebaseApp {
  if (!isFirebaseConfigured()) {
    throw new Error(
      'Firebase is not configured. Add VITE_FIREBASE_API_KEY (and other VITE_FIREBASE_*) to .env. See .env.example.'
    );
  }
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApp();
  }
  return app;
}

export function getFirebaseAuth(): Auth {
  if (!isFirebaseConfigured()) {
    throw new Error('Firebase is not configured. Add VITE_FIREBASE_* to .env.');
  }
  if (!auth) {
    getFirebaseApp();
    auth = getAuth(app!);
  }
  return auth;
}

/** Returns current Firebase ID token for Authorization header, or null if not signed in or Firebase not configured. */
export async function getFirebaseIdToken(forceRefresh?: boolean): Promise<string | null> {
  if (!isFirebaseConfigured()) return null;
  try {
    const a = getFirebaseAuth();
    const user = a.currentUser;
    if (!user) return null;
    return await user.getIdToken(forceRefresh ?? false);
  } catch {
    return null;
  }
}

export async function signInWithEmail(email: string, password: string): Promise<UserCredential> {
  if (!isFirebaseConfigured()) throw new Error('Firebase is not configured. Add VITE_FIREBASE_* to .env.');
  return signInWithEmailAndPassword(getFirebaseAuth(), email, password);
}

export async function signUpWithEmail(email: string, password: string): Promise<UserCredential> {
  if (!isFirebaseConfigured()) throw new Error('Firebase is not configured. Add VITE_FIREBASE_* to .env.');
  return createUserWithEmailAndPassword(getFirebaseAuth(), email, password);
}

export async function signInWithGoogle(): Promise<UserCredential> {
  if (!isFirebaseConfigured()) throw new Error('Firebase is not configured. Add VITE_FIREBASE_* to .env.');
  return signInWithPopup(getFirebaseAuth(), new GoogleAuthProvider());
}
