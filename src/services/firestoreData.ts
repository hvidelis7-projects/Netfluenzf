/**
 * Loads and persists user-scoped documents in Firestore (`profiles`, `userData`).
 * Global marketplace listings live in `marketplaceListings` (see `COLLECTIONS`).
 */

import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  setDoc,
  serverTimestamp,
  where,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { COLLECTIONS } from '../firebase/collections';
import type { Campaign, Transaction, UserProfile, Influencer } from '../types';
import { UserRole } from '../types';

export interface UserDataRow {
  campaigns: Campaign[];
  transactions: Transaction[];
  walletBalance: number;
  escrowBalance: number;
  notifications: string[];
}

const DEFAULT_AVATAR_BRAND =
  'https://images.unsplash.com/photo-1559526323-cb2f2fe2591b?auto=format&fit=crop&q=80&w=200';
const DEFAULT_AVATAR_CREATOR =
  'https://images.unsplash.com/photo-1552374196-c4e7ffc6e126?auto=format&fit=crop&q=80&w=200';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const firestoreCache: {
  marketplaceListings?: CacheEntry<Campaign[]>;
  influencerProfiles?: CacheEntry<Influencer[]>;
} = {};

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes TTL

function mapProfileDoc(id: string, data: Record<string, unknown>): UserProfile | null {
  const roleStr = data.role as string | undefined;
  if (roleStr !== 'BRAND' && roleStr !== 'INFLUENCER') return null;
  const role = roleStr === 'BRAND' ? UserRole.BRAND : UserRole.INFLUENCER;
  const base =
    role === UserRole.BRAND
      ? {
          id,
          role: UserRole.BRAND,
          name: (data.displayName as string) || 'Brand',
          email: (data.email as string) || '',
          avatar: (data.avatarUrl as string) || DEFAULT_AVATAR_BRAND,
          verified: Boolean(data.verified),
          industry: (data.industry as string) || 'General',
          website: (data.website as string) || '',
          bio: (data.bio as string) || '',
          location: (data.location as string) || '',
          budgetRange: (data.budgetRange as string) || '—',
          targetAudience: (data.targetAudience as string) || '',
        }
      : {
          id,
          role: UserRole.INFLUENCER,
          name: (data.displayName as string) || 'Creator',
          email: (data.email as string) || '',
          avatar: (data.avatarUrl as string) || DEFAULT_AVATAR_CREATOR,
          verified: Boolean(data.verified),
          niche: Array.isArray(data.niche) ? (data.niche as string[]) : ['General'],
          followers: typeof data.followers === 'number' ? data.followers : 0,
          engagementRate: typeof data.engagementRate === 'number' ? data.engagementRate : 0,
          location: (data.location as string) || '',
          budgetRange: (data.budgetRange as string) || '—',
          bio: (data.bio as string) || '',
          platformLinks: Array.isArray(data.platformLinks) ? data.platformLinks : [],
          portfolio: Array.isArray(data.portfolio) ? data.portfolio : [],
        };
  return base as UserProfile;
}

export function profileToInfluencer(p: UserProfile): Influencer | null {
  if (p.role !== UserRole.INFLUENCER) return null;
  const niche = p.niche ?? ['General'];
  const loc = p.location ?? '—';
  return {
    ...p,
    niche,
    followers: p.followers ?? 0,
    engagementRate: p.engagementRate ?? 0,
    location: loc,
    rating: 0,
    image: p.avatar,
    trustScore: p.verified ? 85 : 60,
    joinedDate: '',
  };
}

export async function loadProfileForUser(userId: string): Promise<UserProfile | null> {
  if (!db) return null;
  const snap = await getDoc(doc(db, COLLECTIONS.profiles, userId));
  if (!snap.exists()) return null;
  return mapProfileDoc(userId, snap.data() as Record<string, unknown>);
}

export async function loadUserDataRow(userId: string): Promise<UserDataRow | null> {
  if (!db) return null;
  const snap = await getDoc(doc(db, COLLECTIONS.userData, userId));
  if (!snap.exists()) {
    return {
      campaigns: [],
      transactions: [],
      walletBalance: 0,
      escrowBalance: 0,
      notifications: [],
    };
  }
  const d = snap.data() as Record<string, unknown>;
  return {
    campaigns: Array.isArray(d.campaigns) ? (d.campaigns as Campaign[]) : [],
    transactions: Array.isArray(d.transactions) ? (d.transactions as Transaction[]) : [],
    walletBalance: typeof d.walletBalance === 'number' ? d.walletBalance : 0,
    escrowBalance: typeof d.escrowBalance === 'number' ? d.escrowBalance : 0,
    notifications: Array.isArray(d.notifications) ? (d.notifications as string[]) : [],
  };
}

export async function upsertUserData(userId: string, payload: UserDataRow): Promise<void> {
  if (!db) return;
  await setDoc(
    doc(db, COLLECTIONS.userData, userId),
    {
      campaigns: payload.campaigns,
      transactions: payload.transactions,
      walletBalance: payload.walletBalance,
      escrowBalance: payload.escrowBalance,
      notifications: payload.notifications,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

export async function upsertProfileRow(
  userId: string,
  email: string,
  role: UserRole,
  displayName: string
): Promise<void> {
  // Invalidate public creator profiles cache on edits
  delete firestoreCache.influencerProfiles;

  if (!db) return;
  const r = role === UserRole.BRAND ? 'BRAND' : 'INFLUENCER';
  await setDoc(
    doc(db, COLLECTIONS.profiles, userId),
    {
      email,
      role: r,
      displayName,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

export async function mergeProfileFields(
  userId: string,
  partial: Partial<{
    displayName: string;
    avatarUrl: string;
    email: string;
    verified: boolean;
    bio: string;
    location: string;
    niche: string[];
    followers: number;
    engagementRate: number;
    platformLinks: { platform: string; url: string }[];
    portfolio: string[];
    industry: string;
    website: string;
    targetAudience: string;
    budgetRange: string;
  }>
): Promise<void> {
  // Invalidate public creator profiles cache on edits
  delete firestoreCache.influencerProfiles;

  if (!db) return;
  await setDoc(
    doc(db, COLLECTIONS.profiles, userId),
    {
      ...partial,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

/** All published marketplace campaigns (newest first). */
export async function listMarketplaceListings(max = 100, forceRefresh = false): Promise<Campaign[]> {
  const now = Date.now();
  if (!forceRefresh && firestoreCache.marketplaceListings && (now - firestoreCache.marketplaceListings.timestamp < CACHE_TTL_MS)) {
    return firestoreCache.marketplaceListings.data;
  }

  if (!db) return [];
  let result: Campaign[] = [];
  try {
    const q = query(
      collection(db, COLLECTIONS.marketplaceListings),
      orderBy('updatedAt', 'desc'),
      limit(max)
    );
    const snap = await getDocs(q);
    const out: Campaign[] = [];
    snap.forEach((s) => {
      const c = (s.data() as { campaign?: Campaign }).campaign;
      if (c && typeof c.id === 'string') out.push(c);
    });
    result = out;
  } catch {
    const snap = await getDocs(query(collection(db, COLLECTIONS.marketplaceListings), limit(max)));
    const out: Campaign[] = [];
    snap.forEach((s) => {
      const c = (s.data() as { campaign?: Campaign }).campaign;
      if (c && typeof c.id === 'string') out.push(c);
    });
    result = out.sort((a, b) => (a.title > b.title ? 1 : -1));
  }

  firestoreCache.marketplaceListings = { data: result, timestamp: now };
  return result;
}

/** Brand publishes or updates a listing (document id = campaign id). */
export async function upsertMarketplaceListing(brandId: string, campaign: Campaign): Promise<void> {
  // Invalidate read cache on new publications/updates
  delete firestoreCache.marketplaceListings;

  if (!db) return;
  await setDoc(
    doc(db, COLLECTIONS.marketplaceListings, campaign.id),
    {
      brandId,
      campaign,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

export async function removeMarketplaceListing(campaignId: string): Promise<void> {
  // Invalidate read cache on listing deletions
  delete firestoreCache.marketplaceListings;

  if (!db) return;
  await deleteDoc(doc(db, COLLECTIONS.marketplaceListings, campaignId));
}

/** Creator profiles visible to signed-in brands (respects Firestore rules: any auth may read). */
export async function listPublicInfluencerProfiles(max = 80, forceRefresh = false): Promise<Influencer[]> {
  const now = Date.now();
  if (!forceRefresh && firestoreCache.influencerProfiles && (now - firestoreCache.influencerProfiles.timestamp < CACHE_TTL_MS)) {
    return firestoreCache.influencerProfiles.data;
  }

  if (!db) return [];
  let result: Influencer[] = [];
  try {
    const q = query(collection(db, COLLECTIONS.profiles), where('role', '==', 'INFLUENCER'), limit(max));
    const snap = await getDocs(q);
    const out: Influencer[] = [];
    snap.forEach((s) => {
      const p = mapProfileDoc(s.id, s.data() as Record<string, unknown>);
      const inf = p ? profileToInfluencer(p) : null;
      if (inf) out.push(inf);
    });
    result = out;
  } catch {
    result = [];
  }

  firestoreCache.influencerProfiles = { data: result, timestamp: now };
  return result;
}
