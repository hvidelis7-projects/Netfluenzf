import { afterEach, describe, expect, it, vi } from 'vitest';
import { getEmailActionSettings, getVerificationContinueUrl } from './verificationEmail';

describe('verificationEmail', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('uses the live browser origin when VITE_APP_ORIGIN is a placeholder', () => {
    vi.stubEnv('VITE_APP_ORIGIN', 'https://trifluenz.example');
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { origin: 'https://netfluenz.vercel.app' },
    });

    expect(getVerificationContinueUrl()).toBe('https://netfluenz.vercel.app/verify-email');
    expect(getEmailActionSettings()).toEqual({
      url: 'https://netfluenz.vercel.app/verify-email',
      handleCodeInApp: false,
    });
  });

  it('uses VITE_APP_ORIGIN when it matches the current host', () => {
    vi.stubEnv('VITE_APP_ORIGIN', 'https://app.trifluenz.com');
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { origin: 'https://app.trifluenz.com' },
    });

    expect(getVerificationContinueUrl()).toBe('https://app.trifluenz.com/verify-email');
    expect(getEmailActionSettings()).toEqual({
      url: 'https://app.trifluenz.com/verify-email',
      handleCodeInApp: false,
    });
  });
});
