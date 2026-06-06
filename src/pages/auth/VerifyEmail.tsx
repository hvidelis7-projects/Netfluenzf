/**
 * Shown when a user signs in with email/password but has not verified their address yet.
 */

import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { playSound } from '../../audio.ts';

const VerifyEmail: React.FC = () => {
  const { user, needsEmailVerification, authResendVerificationEmail, authReloadSessionUser, logout, addNotification } =
    useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const next =
    (location.state as { next?: string; from?: string } | null)?.next ??
    (location.state as { from?: string } | null)?.from ??
    '/dashboard';

  const [loadingAction, setLoadingAction] = useState<'continue' | 'resend' | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const busy = loadingAction !== null;

  const handleResend = async () => {
    setError(null);
    setMessage(null);
    setLoadingAction('resend');
    playSound('click');
    const { error: err } = await authResendVerificationEmail();
    setLoadingAction(null);
    if (err) {
      setError(err);
      return;
    }
    setMessage('Verification email sent. Check your inbox and spam folder.');
    addNotification('Verification email sent.');
    playSound('success');
  };

  const handleContinue = async () => {
    setError(null);
    setMessage(null);
    setLoadingAction('continue');
    playSound('click');
    const { verified, error: err } = await authReloadSessionUser();
    setLoadingAction(null);
    if (err) {
      setError(err);
      return;
    }
    if (!verified) {
      setError('Your email is not verified yet. Open the link we sent you, then try again.');
      return;
    }
    playSound('success');
    navigate(next, { replace: true });
  };

  if (!needsEmailVerification) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-5 py-20">
      <div className="w-full max-w-md bg-white/60 backdrop-blur-xl border border-white/50 p-6 sm:p-8 rounded-[2.5rem] shadow-2xl">
        <h1 className="text-2xl font-black serif italic brand-text text-center mb-2">Verify your email</h1>
        <p className="text-sm text-gray-600 text-center font-medium leading-relaxed mb-6">
          We sent a verification link to{' '}
          <span className="font-bold text-gray-900">{user?.email ?? 'your email'}</span>. You need to confirm it before
          using Trifluenz with email sign-in.
        </p>

        {message && (
          <p className="text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2 mb-4" role="status">
            {message}
          </p>
        )}
        {error && (
          <p className="text-xs font-medium text-red-600 text-center mb-4" role="alert">
            {error}
          </p>
        )}

        <div className="space-y-3">
          <button
            type="button"
            disabled={busy}
            onClick={() => void handleContinue()}
            className="w-full py-4 button-brand rounded-xl text-xs font-black uppercase tracking-widest shadow-xl active:scale-95 transition-transform disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {loadingAction === 'continue' && <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" aria-hidden />}
            {loadingAction === 'continue' ? 'Checking…' : "I've verified — continue"}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => void handleResend()}
            className="w-full py-3 rounded-xl text-xs font-bold uppercase tracking-widest border-2 border-gray-200 bg-white/70 text-gray-800 hover:border-[#FF5500]/40 transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {loadingAction === 'resend' && <span className="h-4 w-4 rounded-full border-2 border-gray-700 border-t-transparent animate-spin" aria-hidden />}
            {loadingAction === 'resend' ? 'Sending…' : 'Resend verification email'}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => {
              playSound('click');
              void (async () => {
                await logout();
                navigate('/auth', { replace: true });
              })();
            }}
            className="w-full py-2 text-[11px] font-semibold text-gray-500 hover:text-gray-800 underline"
          >
            Sign out
          </button>
        </div>

        <p className="mt-8 text-center text-[10px] text-gray-500">
          Wrong account?{' '}
          <Link to="/auth" className="text-[#FF5500] font-semibold underline">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default VerifyEmail;
