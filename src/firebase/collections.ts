/**
 * Firestore collection / document ids used by the app.
 * Keep names stable; update security rules in `firebase/firestore.rules` when changing access patterns.
 */

export const COLLECTIONS = {
  profiles: 'profiles',
  userData: 'userData',
  /** Published campaign briefs visible to all signed-in users (brands publish from dashboard). */
  marketplaceListings: 'marketplaceListings',
} as const;
