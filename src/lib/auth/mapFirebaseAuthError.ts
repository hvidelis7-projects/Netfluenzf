import type { FirebaseError } from 'firebase/app';

export const DEFAULT_AUTH_ERROR = 'Something went wrong. Please try again.';

export function mapFirebaseAuthError(error: unknown, fallback: string): string {
  const firebaseCode = (error as FirebaseError | undefined)?.code;
  switch (firebaseCode) {
    case 'auth/invalid-email':
      return 'Enter a valid email address.';
    case 'auth/user-not-found':
      return 'No account found for this email. Try signing up first.';
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Incorrect email or password.';
    case 'auth/email-already-in-use':
      return 'That email is already in use. Try logging in instead.';
    case 'auth/weak-password':
      return 'Password is too weak. Use at least 6 characters.';
    case 'auth/network-request-failed':
      return 'Network error. Check your connection and try again.';
    case 'auth/popup-closed-by-user':
      return 'Google sign-in was canceled before completion.';
    case 'auth/popup-blocked':
      return 'Popup was blocked. Allow popups and try Google sign-in again.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please wait a moment and try again.';
    default:
      break;
  }

  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }
  return fallback || DEFAULT_AUTH_ERROR;
}
