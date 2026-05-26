/**
 * Clears legacy session keys from localStorage (previously used for browser-only demo state).
 * Active sessions are owned by Firebase Auth + Firestore.
 */

export const SESSION_STORAGE_KEY = 'netfluenz_session_v1';

/** Reserved for optional route restoration; cleared with the session key. */
export const PAGE_STORAGE_KEY = 'netfluenz_current_page';

export function clearPersistedSession(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(SESSION_STORAGE_KEY);
    localStorage.removeItem(PAGE_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
