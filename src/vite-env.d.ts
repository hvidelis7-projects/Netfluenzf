/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_FIREBASE_API_KEY: string;
  readonly VITE_FIREBASE_AUTH_DOMAIN: string;
  readonly VITE_FIREBASE_PROJECT_ID: string;
  readonly VITE_FIREBASE_APP_ID: string;
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID: string;
  readonly VITE_FIREBASE_STORAGE_BUCKET: string;
  /** Dev only: e.g. `127.0.0.1:8080` — connects Firestore to the local emulator (`firebase emulators:start`). */
  readonly VITE_FIRESTORE_EMULATOR_HOST?: string;
  readonly VITE_CLOUDINARY_CLOUD_NAME: string;
  readonly VITE_CLOUDINARY_UPLOAD_PRESET: string;
  readonly VITE_APP_ORIGIN: string;
  readonly VITE_SENTRY_DSN: string;
  readonly VITE_SIMULATE_AI_FAILURE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
