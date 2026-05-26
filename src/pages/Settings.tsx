/**
 * Account and session settings for signed-in users.
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { useApp } from '../context/AppContext';
import { playSound } from '../audio.ts';

const Settings: React.FC = () => {
  const { user, logout, useFirebaseAuth, firebaseUser, addNotification } = useApp();
  const [resetting, setResetting] = useState(false);

  if (!user) return null;

  const hasPasswordProvider =
    Boolean(firebaseUser?.providerData.some((p) => p.providerId === 'password'));

  const handlePasswordReset = async () => {
    if (!auth || !user.email) {
      addNotification('Password reset is only available when signed in with email.');
      return;
    }
    if (!hasPasswordProvider) {
      addNotification('You signed in with Google. Use Google account recovery to change your password.');
      return;
    }
    setResetting(true);
    playSound('click');
    try {
      await sendPasswordResetEmail(auth, user.email);
      addNotification('Check your email for a password reset link.');
      playSound('success');
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Could not send reset email.';
      addNotification(msg);
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-5 pt-28 pb-20 min-h-screen space-y-8">
      <div>
        <h1 className="text-3xl md:text-4xl font-black serif italic brand-text tracking-tight">Settings</h1>
        <p className="mt-2 text-sm font-medium text-gray-600">Account, security, and legal links.</p>
      </div>

      <section className="glass-card rounded-2xl border border-white/60 p-6 md:p-8 space-y-4 shadow-lg">
        <h2 className="text-[10px] font-black uppercase tracking-widest text-gray-500">Profile</h2>
        <dl className="grid gap-3 text-sm">
          <div className="flex justify-between gap-4 border-b border-gray-100 pb-3">
            <dt className="text-gray-500 font-medium">Name</dt>
            <dd className="font-semibold text-gray-900 text-right">{user.name}</dd>
          </div>
          <div className="flex justify-between gap-4 border-b border-gray-100 pb-3">
            <dt className="text-gray-500 font-medium">Email</dt>
            <dd className="font-semibold text-gray-900 text-right break-all">{user.email}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-gray-500 font-medium">Role</dt>
            <dd className="font-semibold text-gray-900">{user.role}</dd>
          </div>
        </dl>
        <Link
          to="/profile"
          className="inline-block mt-4 text-xs font-bold uppercase tracking-widest text-[#FF5500] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand rounded"
        >
          Edit public profile
        </Link>
      </section>

      <section className="glass-card rounded-2xl border border-white/60 p-6 md:p-8 space-y-4 shadow-lg">
        <h2 className="text-[10px] font-black uppercase tracking-widest text-gray-500">Security</h2>
        {useFirebaseAuth ? (
          <>
            <p className="text-sm text-gray-600 leading-relaxed">
              {hasPasswordProvider
                ? 'Send a password reset link to your account email.'
                : 'You use Google sign-in. Manage your password and 2-Step Verification in your Google account.'}
            </p>
            <button
              type="button"
              disabled={resetting || !hasPasswordProvider}
              onClick={() => void handlePasswordReset()}
              className="rounded-full border border-gray-200 bg-white px-6 py-2.5 text-[10px] font-black uppercase tracking-widest text-gray-900 shadow-sm transition hover:border-brand/30 hover:bg-orange-50/50 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              {resetting ? 'Sending…' : 'Email password reset link'}
            </button>
          </>
        ) : (
          <p className="text-sm text-gray-600">Demo mode uses local sign-in only. Enable Firebase to use password reset.</p>
        )}
      </section>

      <section className="glass-card rounded-2xl border border-white/60 p-6 md:p-8 space-y-3 shadow-lg">
        <h2 className="text-[10px] font-black uppercase tracking-widest text-gray-500">Legal</h2>
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold">
          <Link to="/terms" className="text-[#FF5500] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand rounded">
            Terms of use
          </Link>
          <Link to="/privacy" className="text-[#FF5500] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand rounded">
            Privacy policy
          </Link>
          <Link to="/contact" className="text-[#FF5500] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand rounded">
            Contact
          </Link>
        </div>
      </section>

      <section className="glass-card rounded-2xl border border-red-100 bg-red-50/30 p-6 md:p-8 shadow-lg">
        <h2 className="text-[10px] font-black uppercase tracking-widest text-red-700">Session</h2>
        <p className="text-sm text-gray-700 mt-2">Sign out on this device.</p>
        <button
          type="button"
          onClick={() => {
            playSound('click');
            void logout();
          }}
          className="mt-4 rounded-full bg-red-600 px-6 py-2.5 text-[10px] font-black uppercase tracking-widest text-white shadow-md transition hover:bg-red-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
        >
          Sign out
        </button>
      </section>
    </div>
  );
};

export default Settings;
