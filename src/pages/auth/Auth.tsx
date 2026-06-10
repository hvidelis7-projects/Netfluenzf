/**
 * Login / register: email/password and Google when Firebase sign-in is enabled.
 */

import React, { useEffect, useId, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { UserRole } from '../../types';
import { useApp } from '../../context/AppContext';
import { playSound } from '../../audio.ts';
import { auth, needsPasswordEmailVerification } from '../../lib/firebase';

const AUTH_NEXT_KEY = 'trifluenz_auth_next';

function PasswordField({
  id,
  label,
  value,
  onChange,
  autoComplete,
  disabled,
  hint,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete: string;
  disabled: boolean;
  hint?: React.ReactNode;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="space-y-1">
      {label ? (
        <label htmlFor={id} className="text-[10px] font-black uppercase tracking-widest text-gray-500 pl-2">
          {label}
        </label>
      ) : null}
      <div className="relative">
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          autoComplete={autoComplete}
          required
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="w-full bg-white/80 border border-white/50 rounded-xl px-4 py-3 pr-11 text-sm focus:outline-none focus:border-[#FF5500] focus:ring-1 focus:ring-[#FF5500] transition-all disabled:opacity-60"
          placeholder="••••••••"
          minLength={6}
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setVisible((v) => !v)}
          disabled={disabled}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-700 disabled:opacity-50"
          aria-label={visible ? 'Hide password' : 'Show password'}
        >
          {visible ? <EyeOff className="h-4 w-4" aria-hidden /> : <Eye className="h-4 w-4" aria-hidden />}
        </button>
      </div>
      {hint}
    </div>
  );
}

const Auth: React.FC = () => {
  const {
    authSignIn,
    authSignUp,
    authSignInWithGoogle,
    authSendPasswordReset,
    authReady,
    useFirebaseAuth,
    waitForSessionReady,
  } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? '/dashboard';
  const formId = useId();
  const emailRef = useRef<HTMLInputElement>(null);

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.BRAND);
  const [loadingAction, setLoadingAction] = useState<'form' | 'google' | 'reset' | null>(null);
  const [transitionMessage, setTransitionMessage] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const isFormLoading = loadingAction === 'form';
  const isGoogleLoading = loadingAction === 'google';
  const isResetLoading = loadingAction === 'reset';
  const isBusy = loadingAction !== null;
  const isTransitioning = transitionMessage !== null;

  const passwordsMatch = password.length > 0 && password === confirmPassword;
  const showPasswordMismatch = !isLogin && confirmPassword.length > 0 && !passwordsMatch;

  useEffect(() => {
    if (authReady) emailRef.current?.focus();
  }, [authReady, isLogin]);

  const resetFormMessages = () => {
    setFormError(null);
    setFormSuccess(null);
  };

  const handleTabChange = (nextIsLogin: boolean) => {
    setIsLogin(nextIsLogin);
    resetFormMessages();
    setShowForgotPassword(false);
    setConfirmPassword('');
  };

  const setAuthDestination = (destination: string) => {
    try {
      sessionStorage.setItem(AUTH_NEXT_KEY, destination);
    } catch {
      /* ignore */
    }
  };

  const finishAuthFlow = async (isRegisterFlow: boolean) => {
    const destination = isRegisterFlow ? '/onboarding' : from;
    setAuthDestination(destination);
    setTransitionMessage(isRegisterFlow ? 'Setting up your account…' : 'Signing you in…');

    await waitForSessionReady();

    const u = auth?.currentUser;
    if (u && needsPasswordEmailVerification(u)) {
      setAuthDestination(isRegisterFlow ? '/onboarding' : from);
      playSound('success');
      navigate('/verify-email', {
        replace: true,
        state: { next: isRegisterFlow ? '/onboarding' : from, justRegistered: isRegisterFlow },
      });
      return;
    }

    playSound('success');
    navigate(destination, { replace: true });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!useFirebaseAuth || isBusy || isTransitioning) return;

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setFormError('Enter your email address.');
      return;
    }
    if (password.length < 6) {
      setFormError('Password must be at least 6 characters.');
      return;
    }
    if (!isLogin && password !== confirmPassword) {
      setFormError('Passwords do not match.');
      return;
    }

    resetFormMessages();
    setLoadingAction('form');
    playSound('click');

    if (isLogin) {
      const { error } = await authSignIn(trimmedEmail, password);
      if (error) {
        setLoadingAction(null);
        setFormError(error);
        playSound('click');
        return;
      }
      setLoadingAction(null);
      await finishAuthFlow(false);
      return;
    }

    const { error } = await authSignUp(trimmedEmail, password, selectedRole);
    if (error) {
      setLoadingAction(null);
      setFormError(error);
      return;
    }
    setLoadingAction(null);
    await finishAuthFlow(true);
  };

  const handleGoogle = async () => {
    if (!useFirebaseAuth || isBusy || isTransitioning) return;
    resetFormMessages();
    setLoadingAction('google');
    playSound('click');
    const isRegister = !isLogin;
    const { error } = await authSignInWithGoogle(isRegister, selectedRole);
    if (error) {
      setLoadingAction(null);
      setFormError(error);
      return;
    }
    setLoadingAction(null);
    await finishAuthFlow(isRegister);
  };

  const handleForgotPassword = async () => {
    if (!useFirebaseAuth || isBusy || isTransitioning) return;
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setFormError('Enter your email address, then tap "Send reset link".');
      setShowForgotPassword(true);
      return;
    }
    resetFormMessages();
    setLoadingAction('reset');
    playSound('click');
    const { error } = await authSendPasswordReset(trimmedEmail);
    setLoadingAction(null);
    if (error) {
      setFormError(error);
      return;
    }
    setFormSuccess('Password reset email sent. Check your inbox and spam folder.');
    setShowForgotPassword(false);
    playSound('success');
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
      <div className="relative w-full max-w-sm sm:max-w-md bg-white/60 backdrop-blur-xl border border-white/50 p-5 sm:p-8 rounded-[2rem] shadow-2xl animate-in fade-in zoom-in duration-500">
        {isTransitioning && (
          <div
            className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 rounded-[2rem] bg-white/80 backdrop-blur-md"
            role="status"
            aria-live="polite"
          >
            <div className="h-10 w-10 rounded-full border-2 border-[#FF5500] border-t-transparent animate-spin" aria-hidden />
            <p className="text-sm font-semibold text-gray-800">{transitionMessage}</p>
          </div>
        )}

        <div className="text-center space-y-2 mb-5 sm:mb-6">
          <h2 className="text-2xl sm:text-3xl font-black serif italic brand-text tracking-tight transition-all duration-300">
            {isLogin ? 'Welcome back' : 'Create account'}
          </h2>
          <p className="text-sm text-gray-600 font-medium">
            {isLogin ? 'Log in to your dashboard.' : 'Join as a brand or creator in seconds.'}
          </p>
          <p className="text-[10px] text-gray-500">
            By continuing, you agree to the Trifluenz{' '}
            <Link
              to="/terms"
              className="text-[#FF5500] font-semibold underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand rounded"
            >
              Terms
            </Link>{' '}
            and{' '}
            <Link
              to="/privacy"
              className="text-[#FF5500] font-semibold underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand rounded"
            >
              Privacy Policy
            </Link>
            .
          </p>
        </div>

        <div className="relative flex bg-gray-100/50 p-1 rounded-full mb-6">
          <span
            className={`absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-full bg-white shadow-md transition-transform duration-300 ease-out ${
              isLogin ? 'left-1 translate-x-0' : 'left-1 translate-x-full'
            }`}
            aria-hidden
          />
          <button
            type="button"
            onClick={() => handleTabChange(true)}
            className={`relative z-10 flex-1 py-2.5 rounded-full text-[11px] font-black uppercase tracking-widest transition-colors duration-200 ${
              isLogin ? 'text-[#FF5500]' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => handleTabChange(false)}
            className={`relative z-10 flex-1 py-2.5 rounded-full text-[11px] font-black uppercase tracking-widest transition-colors duration-200 ${
              !isLogin ? 'text-[#FF5500]' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Register
          </button>
        </div>

        <form id={formId} onSubmit={(e) => void handleSubmit(e)} className="space-y-4" noValidate>
          <div
            className={`space-y-4 transition-all duration-300 ${!isLogin ? 'opacity-100' : 'hidden'}`}
            aria-hidden={isLogin}
          >
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 pl-2">Account type</span>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedRole(UserRole.BRAND)}
                  disabled={!useFirebaseAuth || isBusy || isTransitioning}
                  className={`py-2.5 rounded-xl border-2 text-xs font-bold transition-all ${
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
                  disabled={!useFirebaseAuth || isBusy || isTransitioning}
                  className={`py-2.5 rounded-xl border-2 text-xs font-bold transition-all ${
                    selectedRole === UserRole.INFLUENCER
                      ? 'border-[#FF5500] bg-[#FF5500]/5 text-[#FF5500]'
                      : 'border-transparent bg-white/50 text-gray-600 hover:bg-white'
                  } disabled:opacity-60 disabled:cursor-not-allowed`}
                >
                  Creator
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label htmlFor="auth-email" className="text-[10px] font-black uppercase tracking-widest text-gray-500 pl-2">
              Email
            </label>
            <input
              ref={emailRef}
              id="auth-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={!useFirebaseAuth || isBusy || isTransitioning}
              className="w-full bg-white/80 border border-white/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#FF5500] focus:ring-1 focus:ring-[#FF5500] transition-all disabled:opacity-60"
              placeholder="name@example.com"
            />
          </div>

          {!showForgotPassword && (
            <>
              <div className="space-y-1">
                <div className="flex items-center justify-between pl-2 pr-1">
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Password</span>
                  {isLogin && (
                    <button
                      type="button"
                      onClick={() => {
                        setShowForgotPassword(true);
                        resetFormMessages();
                      }}
                      disabled={isBusy || isTransitioning}
                      className="text-[10px] font-semibold text-[#FF5500] hover:underline disabled:opacity-60"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <PasswordField
                  id="auth-password"
                  label=""
                  value={password}
                  onChange={setPassword}
                  autoComplete={isLogin ? 'current-password' : 'new-password'}
                  disabled={!useFirebaseAuth || isBusy || isTransitioning}
                  hint={
                    !isLogin ? (
                      <p className="text-[10px] text-gray-500 pl-2">At least 6 characters.</p>
                    ) : undefined
                  }
                />
              </div>

              {!isLogin && (
                <PasswordField
                  id="auth-confirm-password"
                  label="Confirm password"
                  value={confirmPassword}
                  onChange={setConfirmPassword}
                  autoComplete="new-password"
                  disabled={!useFirebaseAuth || isBusy || isTransitioning}
                  hint={
                    confirmPassword.length > 0 ? (
                      <p
                        className={`text-[10px] pl-2 font-medium ${
                          passwordsMatch ? 'text-emerald-600' : 'text-red-500'
                        }`}
                      >
                        {passwordsMatch ? 'Passwords match' : 'Passwords do not match'}
                      </p>
                    ) : undefined
                  }
                />
              )}
            </>
          )}

          {showForgotPassword && (
            <div className="rounded-xl border border-gray-200 bg-white/70 px-4 py-3 text-sm text-gray-700 animate-in fade-in slide-in-from-top-2 duration-200">
              <p className="font-semibold text-gray-900">Reset your password</p>
              <p className="mt-1 text-xs">
                We&apos;ll email a reset link to <span className="font-medium">{email.trim() || 'your address'}</span>.
              </p>
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  disabled={isBusy || isTransitioning}
                  onClick={() => void handleForgotPassword()}
                  className="flex-1 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest button-brand disabled:opacity-70"
                >
                  {isResetLoading ? 'Sending…' : 'Send reset link'}
                </button>
                <button
                  type="button"
                  disabled={isBusy || isTransitioning}
                  onClick={() => setShowForgotPassword(false)}
                  className="px-3 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-widest border border-gray-200 text-gray-600"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {formSuccess && (
            <p
              className="text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2 text-center animate-in fade-in duration-200"
              role="status"
            >
              {formSuccess}
            </p>
          )}

          {(formError || showPasswordMismatch) && (
            <p className="text-xs font-medium text-red-600 text-center animate-in fade-in duration-200" role="alert">
              {formError ?? 'Passwords do not match.'}
            </p>
          )}

          {!showForgotPassword && (
            <button
              type="submit"
              disabled={
                !useFirebaseAuth ||
                isBusy ||
                isTransitioning ||
                (!isLogin && confirmPassword.length > 0 && !passwordsMatch)
              }
              className="w-full py-3.5 sm:py-4 button-brand rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed mt-2 flex items-center justify-center gap-2"
            >
              {isFormLoading && (
                <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" aria-hidden />
              )}
              {isFormLoading ? 'One moment…' : isLogin ? 'Log in' : 'Create account'}
            </button>
          )}
        </form>

        {useFirebaseAuth && (
          <div className="mt-6 text-center space-y-4">
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

            <button
              type="button"
              disabled={isBusy || isTransitioning}
              onClick={() => void handleGoogle()}
              className="mx-auto h-12 w-12 flex items-center justify-center bg-white rounded-full shadow-sm hover:shadow-md hover:scale-105 transition-all border border-gray-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
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
        )}
      </div>
    </div>
  );
};

export default Auth;
