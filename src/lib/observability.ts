/**
 * Client-side error reporting via Sentry when VITE_SENTRY_DSN is set.
 * API keys and secrets belong on the server only; the browser DSN is public by design.
 */

import * as Sentry from '@sentry/browser';

let initialized = false;

export function initObservability(): void {
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  if (!dsn || initialized) return;
  Sentry.init({
    dsn,
    environment: import.meta.env.MODE,
    tracesSampleRate: import.meta.env.PROD ? 0.1 : 1,
  });
  initialized = true;
}

export function captureException(error: unknown, context?: Record<string, string>): void {
  if (import.meta.env.VITE_SENTRY_DSN) {
    Sentry.captureException(error, { extra: context });
  } else {
    console.error(error, context);
  }
}
