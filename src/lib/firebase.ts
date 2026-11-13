import { getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

const apiKey = import.meta.env.VITE_FIREBASE_API_KEY as string | undefined;
const authDomain = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string | undefined;
const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID as string | undefined;
const storageBucket = import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string | undefined;
const messagingSenderId = import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as
  | string
  | undefined;
const appId = import.meta.env.VITE_FIREBASE_APP_ID as string | undefined;

/** False when the Firebase web-app config is missing — the app then runs on demo (mock) data. */
export const isFirebaseConfigured = Boolean(apiKey && projectId);

/** Null in demo mode; nothing in the app may crash when env vars are absent. */
export const firebaseApp: FirebaseApp | null = isFirebaseConfigured
  ? (getApps().length > 0
      ? getApps()[0]
      : initializeApp({
          apiKey: apiKey as string,
          authDomain,
          projectId: projectId as string,
          storageBucket,
          messagingSenderId,
          appId,
        }))
  : null;

/** Null in demo mode. */
export const auth: Auth | null = firebaseApp ? getAuth(firebaseApp) : null;

/** Null in demo mode. */
export const db: Firestore | null = firebaseApp ? getFirestore(firebaseApp) : null;
