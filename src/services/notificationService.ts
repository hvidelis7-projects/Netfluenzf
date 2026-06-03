import { messaging, db } from '../lib/firebase';
import { getToken, onMessage } from 'firebase/messaging';
import { doc, setDoc } from 'firebase/firestore';
import { COLLECTIONS } from '../firebase/collections';

/**
 * Handles Web Push FCM token registration and transactional notification dispatch.
 */

const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY || ''; // Add your VAPID key from Firebase console here

/**
 * Requests browser push notification permission and registers the device token in Firestore.
 */
export async function registerPushNotifications(userId: string): Promise<string | null> {
  if (!messaging) {
    console.warn('Firebase Messaging is not configured or supported in this environment.');
    return null;
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.warn('Push notification permission denied by user.');
      return null;
    }

    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY || undefined,
    });

    if (token) {
      // Save token to user's profile in Firestore
      if (db) {
        await setDoc(
          doc(db, COLLECTIONS.profiles, userId),
          {
            pushToken: token,
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );
      }
      return token;
    }
    return null;
  } catch (err) {
    console.error('Failed to retrieve FCM push token:', err);
    return null;
  }
}

/**
 * Listens to foreground push notifications and triggers client-side in-app toasts.
 */
export function setupForegroundNotificationListener(onShowToast: (message: string) => void) {
  if (!messaging) return () => {};

  try {
    return onMessage(messaging, (payload) => {
      if (payload.notification?.body) {
        onShowToast(payload.notification.body);
      }
    });
  } catch (err) {
    console.error('Failed to setup foreground listener:', err);
    return () => {};
  }
}

interface SendNotificationPayload {
  toEmail?: string;
  toPushToken?: string;
  title: string;
  body: string;
  type: 'email' | 'push' | 'both';
}

/**
 * Sends a transactional notification.
 * In a real production deployment, this makes an API request to a secure backend/Cloud Function
 * which executes SendGrid / Amazon SES (emails) and Firebase Admin SDK (FCM pushes).
 */
export async function sendTransactionalNotification(payload: SendNotificationPayload): Promise<boolean> {
  console.log('[Notification Dispatcher]', payload);

  // In production: POST to the secure cloud functions endpoint
  const functionsEndpoint = import.meta.env.VITE_NOTIFICATIONS_API_URL || '/api/notifications';

  try {
    const response = await fetch(functionsEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...payload,
        timestamp: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      throw new Error(`Server returned status ${response.status}`);
    }
    return true;
  } catch (err) {
    // If backend is not wired up yet, log the dispatch and fallback gracefully
    console.warn(
      `Could not dispatch live notification via backend endpoint: ${err instanceof Error ? err.message : 'Unknown error'}. Notification simulated in local client console.`
    );
    return false;
  }
}
