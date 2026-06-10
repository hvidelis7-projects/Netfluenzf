import { afterEach, describe, expect, it, vi } from 'vitest';
import { resolveFirebaseConfig } from './firebaseConfig';

describe('resolveFirebaseConfig', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('uses embedded defaults when Firebase env override is partial', () => {
    vi.stubEnv('VITE_FIREBASE_AUTH_DOMAIN', 'trifluenz-wrong.firebaseapp.com');

    const { options, fromEnvOnly } = resolveFirebaseConfig();

    expect(options.projectId).toBe('netfluenz-779d1');
    expect(options.authDomain).toBe('netfluenz-779d1.firebaseapp.com');
    expect(fromEnvOnly).toBe(false);
  });

  it('accepts a complete valid Firebase env override', () => {
    vi.stubEnv('VITE_FIREBASE_API_KEY', 'AIzaSyBOF2nx1tcP0nSmqMAL1RZ9tZmSfKOHXcY');
    vi.stubEnv('VITE_FIREBASE_AUTH_DOMAIN', 'netfluenz-779d1.firebaseapp.com');
    vi.stubEnv('VITE_FIREBASE_PROJECT_ID', 'netfluenz-779d1');
    vi.stubEnv('VITE_FIREBASE_APP_ID', '1:502792375649:web:baa854947cf67769854920');

    const { options, fromEnvOnly } = resolveFirebaseConfig();

    expect(options.projectId).toBe('netfluenz-779d1');
    expect(fromEnvOnly).toBe(true);
  });
});
