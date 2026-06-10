/**
 * Firebase email verification helpers — action URL, dispatch, and in-app link handling.
 */

import type { FirebaseError } from 'firebase/app';
import type { ActionCodeSettings } from 'firebase/auth';
import { applyActionCode, reload, sendEmailVerification, type Auth, type User } from 'firebase/auth';

function normalizeOrigin(value: string): string {
  return value.replace(/\/$/, '');
}

function hostFromOrigin(origin: string): string | null {
  try {
    return new URL(origin).host;
  } catch {
    return null;
  }
}

function isPlaceholderOrigin(origin: string): boolean {
  const host = hostFromOrigin(origin);
  if (!host) return true;
  return host === 'trifluenz.example' || host.endsWith('.example') || host === 'example.com';
}

/** Continue URL after Firebase completes the email action (must be an authorized domain). */
export function getVerificationContinueUrl(): string | undefined {
  if (typeof window === 'undefined') return undefined;

  const currentOrigin = normalizeOrigin(window.location.origin);
  const configured = (import.meta.env.VITE_APP_ORIGIN as string | undefined)?.trim();

  // Only use VITE_APP_ORIGIN when it matches the site the user is actually on.
  // A mismatched value (e.g. trifluenz.example on a Vercel URL) makes Firebase reject the email.
  let origin = currentOrigin;
  if (configured && configured.length > 0) {
    const configuredOrigin = normalizeOrigin(configured);
    const configuredHost = hostFromOrigin(configuredOrigin);
    const currentHost = hostFromOrigin(currentOrigin);
    if (
      configuredHost &&
      currentHost &&
      configuredHost === currentHost &&
      !isPlaceholderOrigin(configuredOrigin)
    ) {
      origin = configuredOrigin;
    }
  }

  return `${origin}/verify-email`;
}

export function getEmailActionSettings(): ActionCodeSettings | undefined {
  const url = getVerificationContinueUrl();
  if (!url) return undefined;

  try {
    const origin = normalizeOrigin(new URL(url).origin);
    if (isPlaceholderOrigin(origin)) return undefined;
  } catch {
    return undefined;
  }

  // Use Firebase hosted handler without in-app handling for reliable verification links.
  return { url, handleCodeInApp: false };
}

function isContinueUriError(error: unknown): boolean {
  const code = (error as FirebaseError | undefined)?.code;
  return code === 'auth/unauthorized-continue-uri' || code === 'auth/invalid-continue-uri';
}

export async function dispatchVerificationEmail(user: User): Promise<void> {
  const settings = getEmailActionSettings();

  if (!settings) {
    await sendEmailVerification(user);
    return;
  }

  try {
    await sendEmailVerification(user, settings);
  } catch (e) {
    if (!isContinueUriError(e)) {
      throw e;
    }
    console.warn('Verification continue URL rejected by Firebase; sending without custom settings.', e);
    await sendEmailVerification(user);
  }
}


export type EmailActionResult = { ok: true } | { ok: false; error: string };

/**
 * Completes verifyEmail when the app is opened with ?mode=verifyEmail&oobCode=…
 * (some clients / redirect flows land here with the code in the query string).
 */
export async function completeEmailVerificationFromUrl(
  authInstance: Auth,
  search: string
): Promise<EmailActionResult | null> {
  const params = new URLSearchParams(search);
  const mode = params.get('mode');
  const oobCode = params.get('oobCode');

  if (mode !== 'verifyEmail' || !oobCode) return null;

  try {
    await applyActionCode(authInstance, oobCode);
    const user = authInstance.currentUser;
    if (user) await reload(user);

    if (typeof window !== 'undefined') {
      const clean = new URL(window.location.href);
      ['mode', 'oobCode', 'apiKey', 'lang', 'continueUrl'].forEach((k) => clean.searchParams.delete(k));
      window.history.replaceState({}, '', clean.pathname + clean.search + clean.hash);
    }

    return { ok: true };
  } catch {
    return { ok: false, error: 'This verification link is invalid or has expired. Resend a new email.' };
  }
}
