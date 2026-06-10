import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { UserRole } from '../types';
import { useApp } from '../context/AppContext';

export const ProtectedRoute: React.FC = () => {
  const { role, authReady, needsEmailVerification, useFirebaseAuth, firebaseUser } = useApp();
  const location = useLocation();

  if (!authReady) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center pt-24" role="status" aria-live="polite">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 rounded-full border-2 border-[#FF5500] border-t-transparent animate-spin" aria-hidden />
          <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Loading session…</span>
        </div>
      </div>
    );
  }

  if (!firebaseUser && role === UserRole.GUEST) {
    return <Navigate to="/auth" replace state={{ from: location.pathname }} />;
  }

  if (useFirebaseAuth && needsEmailVerification) {
    return <Navigate to="/verify-email" replace state={{ from: location.pathname }} />;
  }

  if (firebaseUser && role === UserRole.GUEST) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center pt-24" role="status" aria-live="polite">
        <div className="h-10 w-10 rounded-full border-2 border-[#FF5500] border-t-transparent animate-spin" aria-hidden />
      </div>
    );
  }

  if (role === UserRole.GUEST) {
    return <Navigate to="/auth" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
};
