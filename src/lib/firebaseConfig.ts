/**
 * Resolves Firebase web client config from Vite env vars, with Trifluenz project defaults
 * so sign-in works without a local `.env` (client keys are public; security is via rules + domains).
 */

import type { FirebaseOptions } from 'firebase/app';

/** Matches Firebase Console → Project settings → Your apps → Web app (`netfluenz-779d1`). */
const PROJECT_DEFAULTS: FirebaseOptions = {
  apiKey: 'AIzaSyBOF2nx1tcP0nSmqMAL1RZ9tZmSfKOHXcY',
  authDomain: 'netfluenz-779d1.firebaseapp.com',
  projectId: 'netfluenz-779d1',
  storageBucket: 'netfluenz-779d1.firebasestorage.app',
  messagingSenderId: '502792375649',
  appId: '1:502792375649:web:baa854947cf67769854920',
};

function readEnv(key: keyof ImportMetaEnv): string | undefined {
  const raw = import.meta.env[key];
  if (typeof raw !== 'string') return undefined;
  const trimmed = raw.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function pick(primary: string | undefined, fallback: string | undefined): string | undefined {
  return primary ?? fallback;
}

export type ResolvedFirebaseConfig = {
  options: FirebaseOptions;
  /** True when apiKey, authDomain, and projectId are all present after resolution. */
  isConfigured: boolean;
  /** True when every value came from env (no project defaults used). */
  fromEnvOnly: boolean;
};

export function resolveFirebaseConfig(): ResolvedFirebaseConfig {
  const apiKey = pick(readEnv('VITE_FIREBASE_API_KEY'), PROJECT_DEFAULTS.apiKey);
  const authDomain = pick(readEnv('VITE_FIREBASE_AUTH_DOMAIN'), PROJECT_DEFAULTS.authDomain);
  const projectId = pick(readEnv('VITE_FIREBASE_PROJECT_ID'), PROJECT_DEFAULTS.projectId);

  const options: FirebaseOptions = {
    apiKey,
    authDomain,
    projectId,
    appId: pick(readEnv('VITE_FIREBASE_APP_ID'), PROJECT_DEFAULTS.appId),
    messagingSenderId: pick(
      readEnv('VITE_FIREBASE_MESSAGING_SENDER_ID'),
      PROJECT_DEFAULTS.messagingSenderId
    ),
    storageBucket: pick(readEnv('VITE_FIREBASE_STORAGE_BUCKET'), PROJECT_DEFAULTS.storageBucket),
  };

  const isConfigured = Boolean(
    options.apiKey && options.authDomain && options.projectId
  );

  const fromEnvOnly = Boolean(
    readEnv('VITE_FIREBASE_API_KEY') &&
      readEnv('VITE_FIREBASE_AUTH_DOMAIN') &&
      readEnv('VITE_FIREBASE_PROJECT_ID')
  );

  return { options, isConfigured, fromEnvOnly };
}
