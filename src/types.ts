/**
 * Shared TypeScript contracts for Trifluenz.
 *
 * Domain model: brands and influencers collaborate on {@link Campaign}s with
 * escrow-style money flow, deliverables, messaging, and audit-style logs.
 * Most list/detail views consume these shapes from `AppContext`.
 */

/** Who is acting in the app; drives navigation, mock data, and UI copy. */
export enum UserRole {
  BRAND = 'BRAND',
  INFLUENCER = 'INFLUENCER',
  GUEST = 'GUEST',
  ADMIN = 'ADMIN'
}

/** Lifecycle of funds held for a campaign (UI metaphor; not a real blockchain). */
export type EscrowStatus = 'pending' | 'funded' | 'released' | 'disputed';

/** A row in wallet / ledger views (M-Pesa, escrow, bank are illustrative). */
export interface Transaction {
  id: string;
  date: string;
  type: 'Payout' | 'Deposit' | 'Withdrawal' | 'Refund' | 'Payment held' | 'Payment released';
  amount: number;
  status: 'Success' | 'Processing' | 'Failed';
  method: 'M-Pesa' | 'Secure hold' | 'Bank';
}

/** Immutable-style event for the campaign “protocol” timeline. */
export interface CampaignLog {
  date: string;
  action: string;
  /** Placeholder hash string for the product’s “on-chain” aesthetic. */
  hash: string;
}

/** Single piece of work owed under a campaign (posts, reels, etc.). */
export interface Deliverable {
  id: string;
  type: 'Post' | 'Story' | 'Reel' | 'Video' | 'Tweet';
  description?: string;
  platform: 'Instagram' | 'TikTok' | 'X' | 'YouTube';
  status: 'pending' | 'submitted' | 'approved' | 'rejected';
  dueDate: string;
  submissionUrl?: string;
}

/** Brand ↔ creator collaboration: budget, status machine, optional chat and tasks. */
export interface Campaign {
  id: string;
  title: string;
  brand: string;
  budget: number;
  niche: string;
  status: 'active' | 'completed' | 'draft' | 'auditing' | 'paid';
  description: string;
  platform: 'Instagram' | 'TikTok' | 'X' | 'YouTube' | 'Multi';
  escrowStatus?: EscrowStatus;
  proofUrl?: string;
  assignedInfluencerId?: string;
  logs?: CampaignLog[];
  messages?: Message[];
  deliverables?: Deliverable[];
  timeline?: {
    startDate: string;
    endDate: string;
  };
}

/** Base profile; role-specific fields are optional until filled in onboarding/profile. */
export interface UserProfile {
  id: string;
  role: UserRole;
  name: string;
  email: string;
  avatar: string;
  bio?: string;
  location?: string;
  verified: boolean;
  pushToken?: string;
  // Influencer Specific
  niche?: string[];
  followers?: number;
  engagementRate?: number;
  platformLinks?: { platform: string; url: string }[];
  portfolio?: string[];
  // Brand Specific
  industry?: string;
  website?: string;
  targetAudience?: string;
  budgetRange?: string;
}

/** Marketplace card + stats; extends `UserProfile` with required creator metrics. */
export interface Influencer extends UserProfile {
  niche: string[];
  followers: number;
  engagementRate: number;
  location: string;
  rating: number;
  /** Hero image URL (some UI uses `avatar`, some uses `image`). */
  image: string;
  trustScore: number;
  joinedDate: string;
}

/** Chat bubble stored on `Campaign.messages`. */
export interface Message {
  id: string;
  senderRole: UserRole;
  text: string;
  timestamp: string;
}

/** Simple `{ name, value }` pair for charts. */
export interface AnalyticsData {
  name: string;
  value: number;
}

/** Per-campaign KPIs (reserved for future wiring to real analytics). */
export interface CampaignPerformance {
  campaignId: string;
  impressions: number;
  engagement: number;
  clicks: number;
  conversions: number;
  roi: number;
}
