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
      return 'Too many email attempts. Wait 15–30 minutes, then use Resend verification email.';
    case 'auth/invalid-continue-uri':
    case 'auth/unauthorized-continue-uri': {
      const host = typeof window !== 'undefined' ? window.location.host : null;
      if (host) {
        return `Verification email blocked: "${host}" is not in Firebase Authorized domains. In Firebase Console → Authentication → Settings → Authorized domains, add "${host}" (and any custom domain like trifluenz.app), then redeploy.`;
      }
      return 'We could not send the email from this site URL. Add your live domain to Firebase Authorized domains, then try again.';
    }
    case 'auth/quota-exceeded':
      return 'Email sending is temporarily limited. Please try again later or contact support.';
    case 'auth/operation-not-allowed':
      return 'This sign-in method is not enabled. Contact support if this continues.';
    case 'auth/invalid-api-key':
    case 'auth/app-not-authorized':
      return 'Sign-in is temporarily unavailable. Please try again later or contact support.';
    case 'auth/user-disabled':
      return 'This account has been disabled. Contact support for help.';
    case 'auth/missing-password':
      return 'Enter your password to continue.';
    case 'auth/missing-email':
      return 'Enter your email address to continue.';
    default:
      break;
  }

  if (error instanceof Error) {
    const msg = error.message.trim();
    if (msg.length > 0 && !msg.toLowerCase().includes('firebase')) {
      return msg;
    }
  }
  return fallback || DEFAULT_AUTH_ERROR;
}
