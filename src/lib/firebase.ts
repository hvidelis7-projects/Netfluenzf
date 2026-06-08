/**
 * Firebase client (Auth + Firestore). Uses resolved config from env or Trifluenz project defaults.
 * Media uploads use Cloudinary (`src/services/cloudinary.ts`), not Firebase Storage.
 */

import { initializeApp, type FirebaseApp } from 'firebase/app';
import { connectAuthEmulator, getAuth, GoogleAuthProvider, type Auth, type User } from 'firebase/auth';
import {
  connectFirestoreEmulator,
  getFirestore,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  type Firestore,
} from 'firebase/firestore';
import { getMessaging, isSupported, type Messaging } from 'firebase/messaging';
import { resolveFirebaseConfig } from './firebaseConfig';

const { options: firebaseOptions, isConfigured } = resolveFirebaseConfig();

/** True when Firestore is initialized (same condition as full Firebase client). */
export function isFirestoreConfigured(): boolean {
  return db !== null;
}

export function isFirebaseConfigured(): boolean {
  return isConfigured && app !== null;
}

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let messaging: Messaging | null = null;

if (isConfigured) {
  app = initializeApp(firebaseOptions);
  auth = getAuth(app);

  try {
    db = initializeFirestore(app, {
      localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
    });
  } catch {
    db = getFirestore(app);
  }

  if (import.meta.env.DEV) {
    const authEmu = (import.meta.env.VITE_AUTH_EMULATOR_HOST as string | undefined)?.trim();
    if (authEmu && auth) {
      const url = authEmu.startsWith('http') ? authEmu : `http://${authEmu}`;
      try {
        connectAuthEmulator(auth, url, { disableWarnings: true });
      } catch {
        /* emulator already connected (HMR) */
      }
    }

    const firestoreEmu = (import.meta.env.VITE_FIRESTORE_EMULATOR_HOST as string | undefined)?.trim();
    if (firestoreEmu && db) {
      const [emuHost, portPart] = firestoreEmu.split(':');
      const emuPort = Number(portPart);
      if (emuHost && Number.isFinite(emuPort)) {
        try {
          connectFirestoreEmulator(db, emuHost, emuPort);
        } catch {
          /* emulator already connected (HMR) */
        }
      }
    }
  }

  void isSupported()
    .then((supported) => {
      if (supported && app) {
        messaging = getMessaging(app);
      }
    })
    .catch(() => {
      /* messaging unsupported in this browser */
    });
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

export { app, auth, db, messaging };
