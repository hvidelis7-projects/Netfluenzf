/**
 * Firebase client (Auth + Firestore). Omit env vars to disable Auth/Firestore until configuration is present.
 * Media uploads use Cloudinary (`src/services/cloudinary.ts`), not Firebase Storage.
 *
 * Uses the modular JS SDK (`firebase/app`, `firebase/auth`, `firebase/firestore`).
 */

import { initializeApp, type FirebaseApp, type FirebaseOptions } from 'firebase/app';
import { getAuth, GoogleAuthProvider, type Auth, type User } from 'firebase/auth';
import {
  connectFirestoreEmulator,
  getFirestore,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  type Firestore,
} from 'firebase/firestore';

const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
const authDomain = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN;
const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;

/** True when Firestore is initialized (same condition as full Firebase client). */
export function isFirestoreConfigured(): boolean {
  return db !== null;
}

export function isFirebaseConfigured(): boolean {
  return Boolean(
    apiKey &&
      authDomain &&
      projectId &&
      apiKey.length > 0 &&
      authDomain.length > 0 &&
      projectId.length > 0
  );
}

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

if (isFirebaseConfigured()) {
  const config: FirebaseOptions = {
    apiKey: apiKey!,
    authDomain: authDomain!,
    projectId: projectId!,
  };
  const appId = import.meta.env.VITE_FIREBASE_APP_ID;
  if (appId) config.appId = appId;
  const messagingSenderId = import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID;
  if (messagingSenderId) config.messagingSenderId = messagingSenderId;
  const storageBucket = import.meta.env.VITE_FIREBASE_STORAGE_BUCKET;
  if (storageBucket) config.storageBucket = storageBucket;

  app = initializeApp(config);
  auth = getAuth(app);

  /** Same {@link FirebaseApp} as Auth; uses modular Firestore with IndexedDB persistence when available. */
  try {
    db = initializeFirestore(app, {
      localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
    });
  } catch {
    // Private mode / restricted storage / HMR edge cases — fall back to default (in-memory) Firestore.
    db = getFirestore(app);
  }

  const firestoreEmu = (import.meta.env.VITE_FIRESTORE_EMULATOR_HOST as string | undefined)?.trim();
  if (import.meta.env.DEV && firestoreEmu) {
    const [emuHost, portPart] = firestoreEmu.split(':');
    const emuPort = Number(portPart);
    if (emuHost && Number.isFinite(emuPort)) {
      connectFirestoreEmulator(db, emuHost, emuPort);
    }
  }
}

/** Email/password accounts must complete Firebase email verification before app access. */
export function needsPasswordEmailVerification(user: User): boolean {
  const hasPassword = user.providerData.some((p) => p.providerId === 'password');
  return hasPassword && !user.emailVerified;
}

/** New instance per sign-in attempt (recommended for popup flows). */
export function createGoogleAuthProvider(): GoogleAuthProvider {
  const p = new GoogleAuthProvider();
  p.setCustomParameters({ prompt: 'select_account' });
  return p;
}

export { app, auth, db };
