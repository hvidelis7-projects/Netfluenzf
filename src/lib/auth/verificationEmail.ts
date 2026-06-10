/**
 * Firebase email verification helpers — action URL, dispatch, and in-app link handling.
 */

import type { ActionCodeSettings } from 'firebase/auth';
import { applyActionCode, reload, sendEmailVerification, type Auth, type User } from 'firebase/auth';

/** Continue URL after Firebase completes the email action (must be an authorized domain). */
export function getVerificationContinueUrl(): string | undefined {
  if (typeof window === 'undefined') return undefined;

  const configured = (import.meta.env.VITE_APP_ORIGIN as string | undefined)?.trim();
  const origin = (configured && configured.length > 0 ? configured : window.location.origin).replace(
    /\/$/,
    ''
  );

  return `${origin}/verify-email`;
}

export function getEmailActionSettings(): ActionCodeSettings | undefined {
  const url = getVerificationContinueUrl();
  if (!url) return undefined;

  // Use Firebase hosted handler without in-app handling for reliable verification links.
  return { url, handleCodeInApp: false };
}

export async function dispatchVerificationEmail(user: User): Promise<void> {
  const settings = getEmailActionSettings();
  try {
    await sendEmailVerification(user, settings);
  } catch (e) {
    // Log the error for debugging; rethrow if needed.
    console.error('Failed to send verification email:', e);
    throw e;
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
