/**
 * Global React context: auth, campaigns, wallet, marketplace, and notifications.
 * With Firebase env: Auth + Firestore (`profiles`, `userData`, `marketplaceListings`). Media uploads use Cloudinary (`services/cloudinary.ts`).
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import type { User as FirebaseUser } from 'firebase/auth';
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  reload,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import { UserRole, Campaign, Transaction, Influencer, UserProfile } from '../types';
import { clearPersistedSession } from '../persistedSession';
import { auth, createGoogleAuthProvider, isFirebaseConfigured, needsPasswordEmailVerification } from '../lib/firebase';
import { mapFirebaseAuthError } from '../lib/auth/mapFirebaseAuthError';
import {
  completeEmailVerificationFromUrl,
  dispatchVerificationEmail,
} from '../lib/auth/verificationEmail';
import {
  loadProfileForUser,
  loadUserDataRow,
  upsertUserData,
  upsertProfileRow,
  mergeProfileFields,
  listMarketplaceListings,
  listPublicInfluencerProfiles,
  upsertMarketplaceListing,
} from '../services/firestoreData';


interface AppContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  authReady: boolean;
  /** True when Firebase Auth + Firestore are active (env configured). */
  useFirebaseAuth: boolean;
  /** Current Firebase user when using Firebase Auth; null when signed out. */
  firebaseUser: FirebaseUser | null;
  /** True when the signed-in user must verify email (email/password provider only). */
  needsEmailVerification: boolean;
  logout: () => void | Promise<void>;
  authSignIn: (email: string, password: string) => Promise<{ error: string | null }>;
  authSignUp: (email: string, password: string, role: UserRole) => Promise<{ error: string | null }>;
  authSignInWithGoogle: (isRegister: boolean, roleForNewAccount: UserRole) => Promise<{ error: string | null }>;
  authSendPasswordReset: (email: string) => Promise<{ error: string | null }>;
  authResendVerificationEmail: () => Promise<{ error: string | null }>;
  authReloadSessionUser: () => Promise<{ verified: boolean; error: string | null }>;
  /** Resolves once Firestore profile hydration catches up after sign-in/sign-up. */
  waitForSessionReady: (timeoutMs?: number) => Promise<boolean>;
  updateUserProfile: (profile: Partial<UserProfile>) => void;

  role: UserRole;
  setRole: (role: UserRole) => void;
  campaigns: Campaign[];
  addCampaign: (campaign: Campaign) => void;
  updateCampaign: (campaign: Campaign) => void;
  marketplaceCampaigns: Campaign[];
  addMarketplaceCampaign: (campaign: Campaign) => void;
  transactions: Transaction[];
  addTransaction: (transaction: Transaction) => void;
  walletBalance: number;
  updateWalletBalance: (amount: number) => void;
  escrowBalance: number;
  updateEscrowBalance: (amount: number) => void;
  notifications: string[];
  addNotification: (msg: string) => void;
  availableInfluencers: Influencer[];
  isPwaInstallable: boolean;
  installPwa: () => Promise<void>;
  showIosInstallInstructions: boolean;
  setShowIosInstallInstructions: (val: boolean) => void;
  showAndroidInstallInstructions: boolean;
  setShowAndroidInstallInstructions: (val: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

type AccountData = {
  campaigns: Campaign[];
  transactions: Transaction[];
  walletBalance: number;
  escrowBalance: number;
  notifications: string[];
};

const emptyGuestAccount: AccountData = {
  campaigns: [],
  transactions: [],
  walletBalance: 0,
  escrowBalance: 0,
  notifications: [],
};

function buildInitialState() {
  return {
    role: UserRole.GUEST as UserRole,
    user: null as UserProfile | null,
    campaigns: [] as Campaign[],
    marketplaceCampaigns: [] as Campaign[],
    transactions: [] as Transaction[],
    walletBalance: 0,
    escrowBalance: 0,
    notifications: [] as string[],
  };
}

const initial = buildInitialState();

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(initial.user);
  const [role, setRole] = useState<UserRole>(initial.role);
  const [campaigns, setCampaigns] = useState<Campaign[]>(initial.campaigns);
  const [marketplaceCampaigns, setMarketplaceCampaigns] = useState<Campaign[]>(initial.marketplaceCampaigns);
  const [transactions, setTransactions] = useState<Transaction[]>(initial.transactions);
  const [walletBalance, setWalletBalance] = useState(initial.walletBalance);
  const [escrowBalance, setEscrowBalance] = useState(initial.escrowBalance);
  const [notifications, setNotifications] = useState<string[]>(initial.notifications);
  const [availableInfluencers, setAvailableInfluencers] = useState<Influencer[]>([]);
  const [authReady, setAuthReady] = useState(!isFirebaseConfigured());
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const firebaseUidRef = useRef<string | null>(null);
  const userRef = useRef<UserProfile | null>(initial.user);
  userRef.current = user;
  const pendingOAuthRoleRef = useRef<UserRole | null>(null);
  const lastWrittenDataRef = useRef<string>('');

  const useFirebaseAuth = isFirebaseConfigured();
  const needsEmailVerification =
    Boolean(firebaseUser) && needsPasswordEmailVerification(firebaseUser!);

  const applyAccountData = useCallback((data: AccountData) => {
    setCampaigns(data.campaigns);
    setTransactions(data.transactions);
    setWalletBalance(data.walletBalance);
    setEscrowBalance(data.escrowBalance);
    setNotifications(data.notifications);
  }, []);

  const applyAuthSession = useCallback(
    (u: UserProfile | null, r: UserRole, data: AccountData) => {
      setUser(u);
      setRole(r);
      applyAccountData(data);
    },
    [applyAccountData]
  );

  const hydrateDiscovery = useCallback(async (signedIn: boolean, profile: UserProfile | null) => {
    if (!signedIn) {
      setMarketplaceCampaigns([]);
      setAvailableInfluencers([]);
      return;
    }

    if (!useFirebaseAuth) return;

    try {
      const listings = await listMarketplaceListings();
      setMarketplaceCampaigns(listings);
    } catch {
      setMarketplaceCampaigns([]);
    }
    if (profile?.role === UserRole.BRAND) {
      try {
        const creators = await listPublicInfluencerProfiles();
        setAvailableInfluencers(creators);
      } catch {
        setAvailableInfluencers([]);
      }
    } else {
      setAvailableInfluencers([]);
    }
  }, [useFirebaseAuth]);

  const ensureUserRecords = useCallback(async (fbUser: FirebaseUser) => {
    let profile = await loadProfileForUser(fbUser.uid);
    if (profile) {
      pendingOAuthRoleRef.current = null;
      return profile;
    }

    if (!fbUser.email) return null;

    const roleToUse = pendingOAuthRoleRef.current ?? UserRole.BRAND;
    pendingOAuthRoleRef.current = null;
    const displayName = fbUser.displayName || fbUser.email.split('@')[0] || 'User';

    await upsertProfileRow(fbUser.uid, fbUser.email, roleToUse, displayName);
    await upsertUserData(fbUser.uid, {
      campaigns: [],
      transactions: [],
      walletBalance: 0,
      escrowBalance: 0,
      notifications: [],
    });

    return loadProfileForUser(fbUser.uid);
  }, []);

  const hydrateFromFirebaseUser = useCallback(
    async (fbUser: FirebaseUser | null) => {
      if (!auth) {
        setAuthReady(true);
        return;
      }

      try {
        if (!fbUser) {
          firebaseUidRef.current = null;
          setFirebaseUser(null);
          applyAuthSession(null, UserRole.GUEST, emptyGuestAccount);
          await hydrateDiscovery(false, null);
          return;
        }

        setFirebaseUser(fbUser);
        firebaseUidRef.current = fbUser.uid;

        const profile = await ensureUserRecords(fbUser);
        const row = await loadUserDataRow(fbUser.uid);

        if (!profile || !row) {
          applyAuthSession(null, UserRole.GUEST, emptyGuestAccount);
          await hydrateDiscovery(false, null);
          return;
        }

        applyAuthSession(profile, profile.role, {
          campaigns: row.campaigns,
          transactions: row.transactions,
          walletBalance: row.walletBalance,
          escrowBalance: row.escrowBalance,
          notifications: row.notifications,
        });

        if (typeof window !== 'undefined' && 'Notification' in window) {
          import('../services/notificationService').then(({ registerPushNotifications }) => {
            void registerPushNotifications(fbUser.uid);
          });
        }

        await hydrateDiscovery(true, profile);
      } catch {
        if (fbUser) {
          setFirebaseUser(fbUser);
          firebaseUidRef.current = fbUser.uid;
        }
        applyAuthSession(null, UserRole.GUEST, emptyGuestAccount);
        await hydrateDiscovery(false, null);
      } finally {
        setAuthReady(true);
      }
    },
    [applyAuthSession, ensureUserRecords, hydrateDiscovery]
  );

  // 1. Firebase auth state listener
  useEffect(() => {
    if (!auth) return;

    const unsub = onAuthStateChanged(auth, (fbUser) => {
      void hydrateFromFirebaseUser(fbUser);
    });

    return () => unsub();
  }, [hydrateFromFirebaseUser]);

  // 2. Firebase updates persistence
  useEffect(() => {
    if (!useFirebaseAuth || !firebaseUidRef.current) return;
    const uid = firebaseUidRef.current;

    const payload = {
      campaigns,
      transactions,
      walletBalance,
      escrowBalance,
      notifications,
    };

    const payloadStr = JSON.stringify(payload);
    // Skip Firestore writes if the payload is identical to the last written data
    if (payloadStr === lastWrittenDataRef.current) return;

    const t = window.setTimeout(() => {
      lastWrittenDataRef.current = payloadStr;
      void upsertUserData(uid, payload);
    }, 400);
    return () => window.clearTimeout(t);
  }, [useFirebaseAuth, campaigns, transactions, walletBalance, escrowBalance, notifications]);

  const authSignIn = async (email: string, password: string): Promise<{ error: string | null }> => {
    if (!useFirebaseAuth) {
      return { error: 'Authentication is unavailable until Firebase is configured.' };
    }

    if (!auth) return { error: 'Firebase Auth is not configured.' };
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return { error: null };
    } catch (e: unknown) {
      return { error: mapFirebaseAuthError(e, 'Sign in failed. Please try again.') };
    }
  };

  const authSignUp = async (
    email: string,
    password: string,
    selectedRole: UserRole
  ): Promise<{ error: string | null }> => {
    if (!useFirebaseAuth) {
      return { error: 'Sign up is unavailable until Firebase is configured.' };
    }

    if (!auth) return { error: 'Firebase Auth is not configured.' };
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);

      // Send verification immediately — never block on Firestore profile writes.
      try {
        await dispatchVerificationEmail(cred.user);
      } catch (emailErr: unknown) {
        return {
          error: mapFirebaseAuthError(
            emailErr,
            'Your account was created, but the verification email could not be sent. Sign in and tap Resend verification email, or try again in a few minutes.'
          ),
        };
      }

      const displayName = email.split('@')[0] || 'User';
      try {
        await upsertProfileRow(cred.user.uid, email, selectedRole, displayName);
        await upsertUserData(cred.user.uid, {
          campaigns: [],
          transactions: [],
          walletBalance: 0,
          escrowBalance: 0,
          notifications: [],
        });
      } catch {
        // Profile hydration will retry after sign-in; verification email already sent.
      }

      return { error: null };
    } catch (e: unknown) {
      return { error: mapFirebaseAuthError(e, 'Sign up failed. Please try again.') };
    }
  };

  const authSendPasswordReset = async (email: string): Promise<{ error: string | null }> => {
    if (!useFirebaseAuth) {
      return { error: 'Password reset is unavailable until Firebase is configured.' };
    }
    if (!auth) return { error: 'Firebase Auth is not configured.' };

    const trimmed = email.trim();
    if (!trimmed) return { error: 'Enter your email address to reset your password.' };

    try {
      await sendPasswordResetEmail(auth, trimmed);
      return { error: null };
    } catch (e: unknown) {
      return { error: mapFirebaseAuthError(e, 'Could not send password reset email.') };
    }
  };

  const authSignInWithGoogle = async (
    isRegister: boolean,
    roleForNewAccount: UserRole
  ): Promise<{ error: string | null }> => {
    if (!useFirebaseAuth) {
      return { error: 'Google sign-in is unavailable until Firebase is configured.' };
    }

    if (!auth) return { error: 'Firebase Auth is not configured.' };
    try {
      pendingOAuthRoleRef.current = isRegister ? roleForNewAccount : null;
      await signInWithPopup(auth, createGoogleAuthProvider());
      return { error: null };
    } catch (e: unknown) {
      pendingOAuthRoleRef.current = null;
      return { error: mapFirebaseAuthError(e, 'Google sign-in failed. Please try again.') };
    }
  };

  const authResendVerificationEmail = async (): Promise<{ error: string | null }> => {
    if (!auth) return { error: 'Firebase Auth is not configured.' };
    const u = auth.currentUser;
    if (!u) return { error: 'You are not signed in.' };
    if (!needsPasswordEmailVerification(u)) return { error: null };
    try {
      await dispatchVerificationEmail(u);
      return { error: null };
    } catch (e: unknown) {
      return { error: mapFirebaseAuthError(e, 'Could not send verification email.') };
    }
  };

  const waitForSessionReady = useCallback((timeoutMs = 10000): Promise<boolean> => {
    return new Promise((resolve) => {
      const deadline = Date.now() + timeoutMs;
      const check = () => {
        const fbUser = auth?.currentUser;
        const profile = userRef.current;
        if (fbUser && profile && profile.id === fbUser.uid) {
          resolve(true);
          return;
        }
        if (Date.now() >= deadline) {
          resolve(Boolean(fbUser && profile && profile.id === fbUser.uid));
          return;
        }
        window.setTimeout(check, 40);
      };
      check();
    });
  }, []);

  const authReloadSessionUser = async (): Promise<{ verified: boolean; error: string | null }> => {
    if (!auth) return { verified: false, error: 'Firebase Auth is not configured.' };
    const u = auth.currentUser;
    if (!u) return { verified: false, error: 'You are not signed in.' };
    try {
      await reload(u);
      const fresh = auth.currentUser;
      if (fresh) setFirebaseUser(fresh);
      const verified = fresh ? !needsPasswordEmailVerification(fresh) : false;
      return { verified, error: null };
    } catch (e: unknown) {
      return { verified: false, error: mapFirebaseAuthError(e, 'Could not refresh your session.') };
    }
  };

  // Complete verification when the app opens from an email action link.
  useEffect(() => {
    if (!auth || typeof window === 'undefined') return;

    void completeEmailVerificationFromUrl(auth, window.location.search).then((result) => {
      if (!result?.ok) return;
      void authReloadSessionUser();
    });
  }, []);

  const logout = useCallback(async () => {
    clearPersistedSession();
    if (auth) {
      await signOut(auth);
    }
    firebaseUidRef.current = null;
    setFirebaseUser(null);
    setRole(UserRole.GUEST);
    setUser(null);
    setCampaigns([]);
    setMarketplaceCampaigns([]);
    setAvailableInfluencers([]);
    setTransactions([]);
    setWalletBalance(0);
    setEscrowBalance(0);
    setNotifications([]);
  }, []);

  const updateUserProfile = (updates: Partial<UserProfile>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      if (useFirebaseAuth && firebaseUidRef.current) {
        const uid = firebaseUidRef.current;
        const fs: Partial<any> = {};
        if (updates.name !== undefined) fs.displayName = updates.name;
        if (updates.avatar !== undefined) fs.avatarUrl = updates.avatar;
        if (updates.email !== undefined) fs.email = updates.email;
        if (updates.verified !== undefined) fs.verified = updates.verified;
        if (updates.bio !== undefined) fs.bio = updates.bio;
        if (updates.location !== undefined) fs.location = updates.location;
        if (updates.niche !== undefined) fs.niche = updates.niche;
        if (updates.followers !== undefined) fs.followers = updates.followers;
        if (updates.engagementRate !== undefined) fs.engagementRate = updates.engagementRate;
        if (updates.platformLinks !== undefined) fs.platformLinks = updates.platformLinks;
        if (updates.portfolio !== undefined) fs.portfolio = updates.portfolio;
        if (updates.industry !== undefined) fs.industry = updates.industry;
        if (updates.website !== undefined) fs.website = updates.website;
        if (updates.targetAudience !== undefined) fs.targetAudience = updates.targetAudience;
        if (updates.budgetRange !== undefined) fs.budgetRange = updates.budgetRange;
        if (Object.keys(fs).length > 0) void mergeProfileFields(uid, fs);
      }
    }
  };

  const addCampaign = (campaign: Campaign) => {
    setCampaigns((prev) => [campaign, ...prev]);
  };

  const updateCampaign = (updatedCampaign: Campaign) => {
    setCampaigns((prev) => prev.map((c) => (c.id === updatedCampaign.id ? updatedCampaign : c)));
  };

  const addMarketplaceCampaign = useCallback(
    (campaign: Campaign) => {
      setMarketplaceCampaigns((prev) => [campaign, ...prev]);
      const uid = firebaseUidRef.current;
      if (useFirebaseAuth && uid && user?.role === UserRole.BRAND) {
        void upsertMarketplaceListing(uid, campaign);
      }
    },
    [useFirebaseAuth, user?.role]
  );

  const addTransaction = (transaction: Transaction) => {
    setTransactions((prev) => [transaction, ...prev]);
  };

  const updateWalletBalance = (amount: number) => {
    setWalletBalance((prev) => prev + amount);
  };

  const updateEscrowBalance = (amount: number) => {
    setEscrowBalance((prev) => prev + amount);
  };

  const addNotification = (msg: string) => {
    setNotifications((prev) => [msg, ...prev]);
    if ((window as unknown as { showToast?: (m: string) => void }).showToast) {
      (window as unknown as { showToast: (m: string) => void }).showToast(msg);
    }
  };

  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isPwaInstallable, setIsPwaInstallable] = useState(false);
  const [showIosInstallInstructions, setShowIosInstallInstructions] = useState(false);
  const [showAndroidInstallInstructions, setShowAndroidInstallInstructions] = useState(false);

  useEffect(() => {
    const isIosDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsPwaInstallable(true);
    };

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setIsPwaInstallable(false);
      addNotification('Trifluenz has been successfully installed as a Progressive Web App! 🎉');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // If it's iOS and not standalone, PWA can be installed via Safari Share -> Add to Home Screen
    if (isIosDevice && !isStandalone) {
      setIsPwaInstallable(true);
    }

    // Fallback: Enable the download button on mobile devices so they can see/interact with it
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (isMobile && !isStandalone) {
      setIsPwaInstallable(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const installPwa = useCallback(async () => {
    const isIosDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    if (isIosDevice) {
      setShowIosInstallInstructions(true);
      return;
    }

    if (!deferredPrompt) {
      // Show Android/generic browser installation guide if automatic prompt is missing
      setShowAndroidInstallInstructions(true);
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsPwaInstallable(false);
      setDeferredPrompt(null);
    }
  }, [deferredPrompt]);

  return (
    <AppContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        authReady,
        useFirebaseAuth,
        firebaseUser,
        needsEmailVerification,
        logout,
        authSignIn,
        authSignUp,
        authSignInWithGoogle,
        authSendPasswordReset,
        authResendVerificationEmail,
        authReloadSessionUser,
        waitForSessionReady,
        updateUserProfile,
        role,
        setRole,
        campaigns,
        addCampaign,
        updateCampaign,
        marketplaceCampaigns,
        addMarketplaceCampaign,
        transactions,
        addTransaction,
        walletBalance,
        updateWalletBalance,
        escrowBalance,
        updateEscrowBalance,
        notifications,
        addNotification,
        availableInfluencers,
        isPwaInstallable,
        installPwa,
        showIosInstallInstructions,
        setShowIosInstallInstructions,
        showAndroidInstallInstructions,
        setShowAndroidInstallInstructions,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
