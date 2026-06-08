/**
 * Application shell: React Router + `AppProvider` for campaigns, wallet, and auth.
 */

import React from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Home from './pages/home/Home';
import Dashboard from './pages/Dashboard';
import Marketplace from './pages/Marketplace';
import Auth from './pages/auth/Auth';
import VerifyEmail from './pages/auth/VerifyEmail';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Onboarding from './pages/Onboarding';
import Terms from './pages/legal/Terms';
import Privacy from './pages/legal/Privacy';
import Contact from './pages/legal/Contact';
import CampaignPage from './pages/CampaignPage';
import { UserRole } from './types';
import { AppProvider, useApp } from './context/AppContext';
import { ProtectedRoute } from './routes/ProtectedRoute';

const AuthGate: React.FC = () => {
  const location = useLocation();
  const { role, authReady, useFirebaseAuth, needsEmailVerification } = useApp();
  const from = (location.state as { from?: string } | null)?.from ?? '/dashboard';

  if (!authReady) {
    return (
      <div className="min-h-screen flex items-center justify-center" role="status" aria-live="polite">
        <div className="h-10 w-10 rounded-full border-2 border-[#FF5500] border-t-transparent animate-spin" aria-hidden />
      </div>
    );
  }
  if (role !== UserRole.GUEST) {
    if (useFirebaseAuth && needsEmailVerification) {
      const next =
        typeof sessionStorage !== 'undefined'
          ? sessionStorage.getItem('trifluenz_auth_next') ?? from
          : from;
      return <Navigate to="/verify-email" replace state={{ next }} />;
    }
    const destination =
      typeof sessionStorage !== 'undefined'
        ? sessionStorage.getItem('trifluenz_auth_next') ?? from
        : from;
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.removeItem('trifluenz_auth_next');
    }
    return <Navigate to={destination} replace />;
  }
  return <Auth />;
};

const VerifyEmailGate: React.FC = () => {
  const location = useLocation();
  const { role, authReady, useFirebaseAuth, needsEmailVerification } = useApp();
  if (!authReady) {
    return (
      <div className="min-h-screen flex items-center justify-center" role="status" aria-live="polite">
        <div className="h-10 w-10 rounded-full border-2 border-[#FF5500] border-t-transparent animate-spin" aria-hidden />
      </div>
    );
  }
  if (role === UserRole.GUEST) {
    return <Navigate to="/auth" replace />;
  }
  if (!useFirebaseAuth || !needsEmailVerification) {
    const to = (location.state as { from?: string } | null)?.from ?? '/dashboard';
    return <Navigate to={to} replace />;
  }
  return <VerifyEmail />;
};

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="auth" element={<AuthGate />} />
        <Route path="verify-email" element={<VerifyEmailGate />} />
        <Route path="terms" element={<Terms />} />
        <Route path="privacy" element={<Privacy />} />
        <Route path="contact" element={<Contact />} />
        <Route element={<ProtectedRoute />}>
          <Route path="onboarding" element={<Onboarding />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="marketplace" element={<Marketplace />} />
          <Route path="profile" element={<Profile />} />
          <Route path="settings" element={<Settings />} />
          <Route path="campaign/:id" element={<CampaignPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AppProvider>
        <AppRoutes />
      </AppProvider>
    </BrowserRouter>
  );
};

export default App;
