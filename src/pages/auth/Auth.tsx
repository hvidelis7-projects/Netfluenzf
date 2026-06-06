/**
 * Login / register: email/password and Google when the deployment has sign-in enabled.
 */

import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { UserRole } from '../../types';
import { useApp } from '../../context/AppContext';
import { playSound } from '../../audio.ts';
import { auth, needsPasswordEmailVerification } from '../../lib/firebase';

const Auth: React.FC = () => {
  const { authSignIn, authSignUp, authSignInWithGoogle, authReady, useFirebaseAuth } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? '/dashboard';

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.BRAND);
  const [loadingAction, setLoadingAction] = useState<'form' | 'google' | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const isFormLoading = loadingAction === 'form';
  const isGoogleLoading = loadingAction === 'google';
  const isBusy = loadingAction !== null;

  const handleTabChange = (nextIsLogin: boolean) => {
    setIsLogin(nextIsLogin);
    setFormError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!useFirebaseAuth || isBusy) return;
    setFormError(null);
    setLoadingAction('form');
    playSound('click');

    if (isLogin) {
      const { error } = await authSignIn(email, password);
      setLoadingAction(null);
      if (error) {
        setFormError(error);
        playSound('click');
        return;
      }
      playSound('success');
      navigate(from, { replace: true });
      return;
    }
    const { error } = await authSignUp(email, password, selectedRole);
    setLoadingAction(null);
    if (error) {
      setFormError(error);
      return;
    }
    playSound('success');
    navigate('/verify-email', { replace: true, state: { next: '/onboarding' } });
    return;
  };

  const handleGoogle = async () => {
    if (!useFirebaseAuth || isBusy) return;
    setFormError(null);
    setLoadingAction('google');
    playSound('click');
    const { error } = await authSignInWithGoogle(!isLogin, selectedRole);
    setLoadingAction(null);
    if (error) {
      setFormError(error);
      return;
    }
    const u = auth?.currentUser;
    if (u && needsPasswordEmailVerification(u)) {
      playSound('success');
      navigate('/verify-email', {
        replace: true,
        state: { next: isLogin ? from : '/onboarding' },
      });
      return;
    }
    playSound('success');
    navigate(isLogin ? from : '/onboarding', { replace: true });
  };

  if (!authReady) {
    return (
      <div className="min-h-screen flex items-center justify-center px-5" role="status" aria-live="polite">
        <div className="h-10 w-10 rounded-full border-2 border-[#FF5500] border-t-transparent animate-spin" aria-hidden />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 py-8 sm:py-12">
      <div className="w-full max-w-sm sm:max-w-md bg-white/60 backdrop-blur-xl border border-white/50 p-5 sm:p-8 rounded-[2rem] shadow-2xl animate-in fade-in zoom-in duration-500">
        <div className="text-center space-y-2 mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl font-black serif italic brand-text tracking-tight">
            {isLogin ? 'Welcome back' : 'Create account'}
          </h2>
          <p className="text-sm text-gray-600 font-medium">
            {isLogin ? 'Log in to your dashboard.' : 'Sign up to connect with brands or creators.'}
          </p>
          <p className="text-[10px] text-gray-500">
            By continuing, you agree to the Trifluenz{' '}
            <Link to="/terms" className="text-[#FF5500] font-semibold underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand rounded">
              Terms
            </Link>{' '}
            and{' '}
            <Link to="/privacy" className="text-[#FF5500] font-semibold underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand rounded">
              Privacy Policy
            </Link>
            .
          </p>
        </div>

        <div className="flex bg-gray-100/50 p-1 rounded-full mb-8">
          <button
            type="button"
            onClick={() => handleTabChange(true)}
            className={`flex-1 py-2.5 rounded-full text-[11px] font-black uppercase tracking-widest transition-all ${
              isLogin ? 'bg-white shadow-md text-[#FF5500]' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => handleTabChange(false)}
            className={`flex-1 py-2.5 rounded-full text-[11px] font-black uppercase tracking-widest transition-all ${
              !isLogin ? 'bg-white shadow-md text-[#FF5500]' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Register
          </button>
        </div>

        {!useFirebaseAuth && (
          <div className="mb-6 rounded-2xl border border-amber-200/90 bg-amber-50/90 px-4 py-3 text-sm text-amber-900">
            <p className="font-bold">Sign-in unavailable</p>
            <p className="mt-1 text-xs sm:text-sm">
              Firebase authentication is not configured for this environment yet. Add the required
              `VITE_FIREBASE_*` values to enable email and Google sign-in.
            </p>
          </div>
        )}

        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-5" noValidate>
          {!isLogin && (
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 pl-2">Account type</span>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedRole(UserRole.BRAND)}
                  disabled={!useFirebaseAuth || isBusy}
                  className={`py-3 rounded-xl border-2 text-xs font-bold transition-all ${
                    selectedRole === UserRole.BRAND
                      ? 'border-[#FF5500] bg-[#FF5500]/5 text-[#FF5500]'
                      : 'border-transparent bg-white/50 text-gray-600 hover:bg-white'
                  } disabled:opacity-60 disabled:cursor-not-allowed`}
                >
                  Brand
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedRole(UserRole.INFLUENCER)}
                  disabled={!useFirebaseAuth || isBusy}
                  className={`py-3 rounded-xl border-2 text-xs font-bold transition-all ${
                    selectedRole === UserRole.INFLUENCER
                      ? 'border-[#FF5500] bg-[#FF5500]/5 text-[#FF5500]'
                      : 'border-transparent bg-white/50 text-gray-600 hover:bg-white'
                  } disabled:opacity-60 disabled:cursor-not-allowed`}
                >
                  Creator
                </button>
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label htmlFor="auth-email" className="text-[10px] font-black uppercase tracking-widest text-gray-500 pl-2">
              Email
            </label>
            <input
              id="auth-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={!useFirebaseAuth || isBusy}
              className="w-full bg-white/80 border border-white/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#FF5500] focus:ring-1 focus:ring-[#FF5500] transition-all"
              placeholder="name@example.com"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="auth-password" className="text-[10px] font-black uppercase tracking-widest text-gray-500 pl-2">
              Password
            </label>
            <input
              id="auth-password"
              type="password"
              autoComplete={isLogin ? 'current-password' : 'new-password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={!useFirebaseAuth || isBusy}
              className="w-full bg-white/80 border border-white/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#FF5500] focus:ring-1 focus:ring-[#FF5500] transition-all"
              placeholder="••••••••"
              minLength={6}
            />
          </div>

          {formError && (
            <p className="text-xs font-medium text-red-600 text-center" role="alert">
              {formError}
            </p>
          )}

          <button
            type="submit"
            disabled={!useFirebaseAuth || isBusy}
            className="w-full py-3.5 sm:py-4 button-brand rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest shadow-xl active:scale-95 transition-transform disabled:opacity-70 disabled:cursor-not-allowed mt-4 flex items-center justify-center gap-2"
          >
            {isFormLoading && <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" aria-hidden />}
            {isFormLoading ? 'Please wait...' : isLogin ? 'Log in' : 'Sign up'}
          </button>
        </form>

        {useFirebaseAuth && (
          <div className="mt-8 text-center space-y-4">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300/50" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white/60 backdrop-blur-xl px-2 text-gray-500 font-bold tracking-widest text-[9px]">
                Or continue with
              </span>
            </div>
          </div>

          <div className="flex gap-3 justify-center">
            <button
              type="button"
              disabled={isBusy}
              onClick={() => void handleGoogle()}
              className="h-12 w-12 flex items-center justify-center bg-white rounded-full shadow-sm hover:shadow-md transition-all border border-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Continue with Google"
            >
              {isGoogleLoading ? (
                <span className="h-5 w-5 rounded-full border-2 border-[#FF5500] border-t-transparent animate-spin" aria-hidden />
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden>
                  <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z" />
                </svg>
              )}
            </button>
          </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Auth;
