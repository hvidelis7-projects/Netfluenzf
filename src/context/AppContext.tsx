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
  sendEmailVerification,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import { UserRole, Campaign, Transaction, Influencer, UserProfile } from '../types';
import { clearPersistedSession } from '../persistedSession';
import { auth, createGoogleAuthProvider, isFirebaseConfigured, needsPasswordEmailVerification } from '../lib/firebase';
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
  authResendVerificationEmail: () => Promise<{ error: string | null }>;
  authReloadSessionUser: () => Promise<{ verified: boolean; error: string | null }>;
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
  const pendingOAuthRoleRef = useRef<UserRole | null>(null);

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
  }, []);

  const hydrateFromFirebaseUser = useCallback(
    async (fbUser: FirebaseUser | null) => {
      if (!auth) {
        setAuthReady(true);
        return;
      }
      if (!fbUser) {
        firebaseUidRef.current = null;
        setFirebaseUser(null);
        applyAuthSession(null, UserRole.GUEST, emptyGuestAccount);
        await hydrateDiscovery(false, null);
        setAuthReady(true);
        return;
      }

      setFirebaseUser(fbUser);
      firebaseUidRef.current = fbUser.uid;
      let profile = await loadProfileForUser(fbUser.uid);
      if (profile) {
        pendingOAuthRoleRef.current = null;
      }
      if (!profile && fbUser.email) {
        const roleToUse = pendingOAuthRoleRef.current ?? UserRole.BRAND;
        pendingOAuthRoleRef.current = null;
        await upsertProfileRow(
          fbUser.uid,
          fbUser.email,
          roleToUse,
          fbUser.displayName || fbUser.email.split('@')[0] || 'User'
        );
        await upsertUserData(fbUser.uid, {
          campaigns: [],
          transactions: [],
          walletBalance: 0,
          escrowBalance: 0,
          notifications: [],
        });
        profile = await loadProfileForUser(fbUser.uid);
      }

      const row = await loadUserDataRow(fbUser.uid);

      if (!profile || !row) {
        await signOut(auth);
        firebaseUidRef.current = null;
        setFirebaseUser(null);
        applyAuthSession(null, UserRole.GUEST, emptyGuestAccount);
        await hydrateDiscovery(false, null);
        setAuthReady(true);
        return;
      }

      applyAuthSession(profile, profile.role, {
        campaigns: row.campaigns,
        transactions: row.transactions,
        walletBalance: row.walletBalance,
        escrowBalance: row.escrowBalance,
        notifications: row.notifications,
      });
      await hydrateDiscovery(true, profile);
      setAuthReady(true);
    },
    [applyAuthSession, hydrateDiscovery]
  );

  useEffect(() => {
    if (!auth) return;

    const unsub = onAuthStateChanged(auth, (fbUser) => {
      void hydrateFromFirebaseUser(fbUser);
    });

    return () => unsub();
  }, [hydrateFromFirebaseUser]);

  useEffect(() => {
    if (!useFirebaseAuth || !firebaseUidRef.current) return;
    const uid = firebaseUidRef.current;
    const t = window.setTimeout(() => {
      void upsertUserData(uid, {
        campaigns,
        transactions,
        walletBalance,
        escrowBalance,
        notifications,
      });
    }, 400);
    return () => window.clearTimeout(t);
  }, [useFirebaseAuth, campaigns, transactions, walletBalance, escrowBalance, notifications]);

  const authSignIn = async (email: string, password: string): Promise<{ error: string | null }> => {
    if (!auth) return { error: 'Firebase Auth is not configured.' };
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return { error: null };
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Sign in failed.';
      return { error: msg };
    }
  };

  const authSignUp = async (
    email: string,
    password: string,
    selectedRole: UserRole
  ): Promise<{ error: string | null }> => {
    if (!auth) return { error: 'Firebase Auth is not configured.' };
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      const displayName = email.split('@')[0] || 'User';
      await upsertProfileRow(cred.user.uid, email, selectedRole, displayName);
      await upsertUserData(cred.user.uid, {
        campaigns: [],
        transactions: [],
        walletBalance: 0,
        escrowBalance: 0,
        notifications: [],
      });
      const continueUrl = typeof window !== 'undefined' ? `${window.location.origin}/auth` : undefined;
      await sendEmailVerification(cred.user, continueUrl ? { url: continueUrl } : undefined);
      return { error: null };
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Sign up failed.';
      return { error: msg };
    }
  };

  const authSignInWithGoogle = async (
    isRegister: boolean,
    roleForNewAccount: UserRole
  ): Promise<{ error: string | null }> => {
    if (!auth) return { error: 'Firebase Auth is not configured.' };
    try {
      pendingOAuthRoleRef.current = isRegister ? roleForNewAccount : null;
      await signInWithPopup(auth, createGoogleAuthProvider());
      return { error: null };
    } catch (e: unknown) {
      pendingOAuthRoleRef.current = null;
      const msg = e instanceof Error ? e.message : 'Google sign-in failed.';
      return { error: msg };
    }
  };

  const authResendVerificationEmail = async (): Promise<{ error: string | null }> => {
    if (!auth) return { error: 'Firebase Auth is not configured.' };
    const u = auth.currentUser;
    if (!u) return { error: 'You are not signed in.' };
    if (!needsPasswordEmailVerification(u)) return { error: null };
    try {
      const continueUrl = typeof window !== 'undefined' ? `${window.location.origin}/auth` : undefined;
      await sendEmailVerification(u, continueUrl ? { url: continueUrl } : undefined);
      return { error: null };
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Could not send verification email.';
      return { error: msg };
    }
  };

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
      const msg = e instanceof Error ? e.message : 'Could not refresh your session.';
      return { verified: false, error: msg };
    }
  };

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
      setUser({ ...user, ...updates });
      if (useFirebaseAuth && firebaseUidRef.current) {
        const uid = firebaseUidRef.current;
        const fs: Partial<{ displayName: string; avatarUrl: string; email: string; verified: boolean }> = {};
        if (updates.name !== undefined) fs.displayName = updates.name;
        if (updates.avatar !== undefined) fs.avatarUrl = updates.avatar;
        if (updates.email !== undefined) fs.email = updates.email;
        if (updates.verified !== undefined) fs.verified = updates.verified;
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
      // If prompt isn't captured (e.g. already installed or desktop browser), show guidance
      addNotification('To install, open this page in Chrome/Safari on your mobile device and select "Add to Home Screen".');
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
        authResendVerificationEmail,
        authReloadSessionUser,
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
