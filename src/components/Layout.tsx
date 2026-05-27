/**
 * App chrome: fixed nav, optional mobile drawer, global background image, footer.
 * Registers `window.showToast` for `AppContext.addNotification` and local toasts.
 */

import React, { useState, useEffect, useRef } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { NetfluenzLogo, APP_SHELL_BACKGROUND, PwaDownloadIcon } from '../constants';
import HomeHeroBackground from './HomeHeroBackground';
import { UserRole } from '../types';
import { playSound } from '../audio.ts';
import { useApp } from '../context/AppContext';
import { navKeyFromPath } from '../lib/navKey';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'info';
}

const Layout: React.FC = () => {
  const { 
    notifications, 
    role, 
    logout, 
    isPwaInstallable, 
    installPwa, 
    showIosInstallInstructions, 
    setShowIosInstallInstructions 
  } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const currentPage = navKeyFromPath(location.pathname);

  const [scrolled, setScrolled] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isBannerDismissed, setIsBannerDismissed] = useState(false);
  const notifPanelRef = useRef<HTMLDivElement>(null);
  const notifButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [isMobileMenuOpen]);

  useEffect(() => {
    (window as unknown as { showToast?: (message: string, type?: 'success' | 'info') => void }).showToast = (
      message: string,
      type: 'success' | 'info' = 'success'
    ) => {
      playSound(type === 'success' ? 'success' : 'click');
      const id = Math.random().toString(36).substr(2, 6);
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 3000);
    };
  }, []);

  useEffect(() => {
    if (!showNotifications) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowNotifications(false);
    };
    const onPointer = (e: MouseEvent) => {
      const t = e.target as Node;
      if (notifPanelRef.current?.contains(t) || notifButtonRef.current?.contains(t)) return;
      setShowNotifications(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onPointer);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onPointer);
    };
  }, [showNotifications]);

  const handleNavClick = (action: () => void) => {
    playSound('click');
    action();
  };

  const isHomePage = currentPage === 'home';
  /** Translucent dark nav over hero photography (readable + premium). */
  const navGlassHero = isHomePage && !scrolled && !isMobileMenuOpen;

  const handleLogout = async () => {
    playSound('click');
    await logout();
    navigate('/');
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col selection:bg-[#FF5500] selection:text-white relative">
      <div className="fixed inset-0 w-full h-full z-0 pointer-events-none overflow-hidden">
        {isHomePage ? (
          <HomeHeroBackground />
        ) : (
          <img
            src={APP_SHELL_BACKGROUND}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 ease-out scale-110"
            alt=""
            aria-hidden
          />
        )}
        <div
          className={`absolute inset-0 z-[2] transition-all duration-700 ease-in-out ${
            isHomePage ? 'bg-gradient-to-b from-black/15 via-white/5 to-black/25 backdrop-blur-[0px]' : 'bg-white/60 backdrop-blur-2xl'
          }`}
        />
      </div>

      <div
        className="fixed top-4 right-4 z-[5000] space-y-2 pointer-events-none"
        aria-live="polite"
        aria-relevant="additions"
        aria-atomic="true"
      >
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto animate-in slide-in-from-right-10 fade-in duration-500">
            <div className="glass-card px-5 py-3 rounded-2xl border-[#FF5500]/20 flex items-center space-x-3 shadow-xl bg-white/90 backdrop-blur-md">
              <div className="w-1.5 h-1.5 rounded-full bg-[#FF5500]" aria-hidden />
              <span className="text-[9px] font-black uppercase tracking-widest text-gray-900">{toast.message}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <nav
          className={`fixed left-0 right-0 top-0 z-[200] px-4 transition-all duration-500 sm:px-5 ${
            isMobileMenuOpen
              ? 'border-b border-white/60 bg-white/85 py-3 shadow-[0_8px_32px_-12px_rgba(255,85,0,0.12)] backdrop-blur-2xl'
              : scrolled
                ? 'border-b border-white/20 bg-white/80 py-3 shadow-sm backdrop-blur-xl'
                : navGlassHero
                  ? 'border-transparent bg-transparent py-5 md:py-6'
                  : 'bg-transparent py-6'
          }`}
        >
          <div
            className={`max-w-7xl mx-auto flex justify-between items-center transition-all duration-500 ${
              navGlassHero
                ? 'rounded-full border border-white/10 bg-black/30 px-4 py-2 shadow-[0_12px_48px_-16px_rgba(0,0,0,0.55)] backdrop-blur-xl sm:px-5 md:px-6'
                : ''
            }`}
          >
            <Link
              to="/"
              className={`flex items-center space-x-3 cursor-pointer rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
                navGlassHero ? 'focus-visible:outline-white' : 'focus-visible:outline-brand'
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <NetfluenzLogo className="w-8 h-8 md:w-10 md:h-10" />
              <div className="flex flex-col">
                <span className="text-xl font-black brand-text serif uppercase leading-none tracking-tight">Netfluenz</span>
                <span
                  className={`text-[7px] uppercase tracking-widest font-black ${navGlassHero ? 'text-white/50' : 'text-gray-900'}`}
                >
                  Creator growth infrastructure
                </span>
              </div>
            </Link>

            <button
              type="button"
              className={`md:hidden z-[110] rounded-full p-2.5 transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
                navGlassHero ? 'focus-visible:outline-white' : 'focus-visible:outline-brand'
              } ${
                isMobileMenuOpen
                  ? 'bg-white/95 text-gray-800 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.12),inset_0_1px_0_0_rgba(255,255,255,1)] ring-1 ring-black/[0.06]'
                  : navGlassHero
                    ? 'text-white'
                    : 'text-gray-900'
              }`}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-nav-overlay"
              aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              <div className="relative flex h-4 w-6 flex-col justify-between">
                <div
                  className={`h-0.5 w-full origin-center rounded-full bg-current transition-all duration-300 ease-out ${isMobileMenuOpen ? 'translate-y-[7px] rotate-45' : ''}`}
                />
                <div
                  className={`h-0.5 w-full rounded-full bg-current transition-all duration-300 ${isMobileMenuOpen ? 'scale-0 opacity-0' : 'opacity-100'}`}
                />
                <div
                  className={`h-0.5 w-full origin-center rounded-full bg-current transition-all duration-300 ease-out ${isMobileMenuOpen ? '-translate-y-[7px] -rotate-45' : ''}`}
                />
              </div>
            </button>

            <div className="hidden md:flex items-center space-x-12">
              {isPwaInstallable && (
                <button
                  type="button"
                  onClick={() => handleNavClick(() => void installPwa())}
                  className={`flex items-center space-x-2 px-5 py-2.5 rounded-full border ${
                    navGlassHero
                      ? 'border-white/30 bg-white/10 hover:bg-white/20 text-white focus-visible:outline-white shadow-[0_4px_20px_rgba(255,255,255,0.1)]'
                      : 'border-brand/30 bg-brand/5 hover:bg-brand/10 text-brand focus-visible:outline-brand shadow-[0_4px_20px_rgba(255,85,0,0.1)]'
                  } text-[9px] font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 focus-visible:outline focus-visible:outline-2`}
                >
                  <PwaDownloadIcon className="w-4 h-4" />
                  <span>Download App</span>
                </button>
              )}
              {role === UserRole.GUEST ? (
                <div className="flex items-center space-x-6">
                  <button
                    type="button"
                    onClick={() => handleNavClick(() => navigate('/auth'))}
                    className={`px-8 py-2.5 button-brand rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-orange-500/20 active:scale-95 transition-transform motion-reduce:transition-none ${
                      navGlassHero ? 'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white' : ''
                    }`}
                  >
                    Get Started
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-10">
                  <button
                    type="button"
                    onClick={() => handleNavClick(() => navigate('/dashboard'))}
                    className={`text-[10px] font-black uppercase tracking-widest transition-colors rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
                      navGlassHero ? 'focus-visible:outline-white' : 'focus-visible:outline-brand'
                    } ${
                      currentPage === 'dashboard'
                        ? 'brand-text'
                        : navGlassHero
                          ? 'text-white/85 hover:text-white'
                          : 'text-gray-900 hover:text-brand'
                    }`}
                  >
                    Dashboard
                  </button>
                  <button
                    type="button"
                    onClick={() => handleNavClick(() => navigate('/marketplace'))}
                    className={`text-[10px] font-black uppercase tracking-widest transition-colors rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
                      navGlassHero ? 'focus-visible:outline-white' : 'focus-visible:outline-brand'
                    } ${
                      currentPage === 'marketplace'
                        ? 'brand-text'
                        : navGlassHero
                          ? 'text-white/85 hover:text-white'
                          : 'text-gray-900 hover:text-brand'
                    }`}
                  >
                    Discover
                  </button>
                  <button
                    type="button"
                    onClick={() => handleNavClick(() => navigate('/profile'))}
                    className={`text-[10px] font-black uppercase tracking-widest transition-colors rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
                      navGlassHero ? 'focus-visible:outline-white' : 'focus-visible:outline-brand'
                    } ${
                      currentPage === 'profile'
                        ? 'brand-text'
                        : navGlassHero
                          ? 'text-white/85 hover:text-white'
                          : 'text-gray-900 hover:text-brand'
                    }`}
                  >
                    Profile
                  </button>
                  <button
                    type="button"
                    onClick={() => handleNavClick(() => navigate('/settings'))}
                    className={`text-[10px] font-black uppercase tracking-widest transition-colors rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
                      navGlassHero ? 'focus-visible:outline-white' : 'focus-visible:outline-brand'
                    } ${
                      currentPage === 'settings'
                        ? 'brand-text'
                        : navGlassHero
                          ? 'text-white/85 hover:text-white'
                          : 'text-gray-900 hover:text-brand'
                    }`}
                  >
                    Settings
                  </button>

                  <div className="relative">
                    <button
                      ref={notifButtonRef}
                      type="button"
                      onClick={() => {
                        playSound('click');
                        setShowNotifications(!showNotifications);
                      }}
                      aria-expanded={showNotifications}
                      aria-haspopup="dialog"
                      aria-controls="notifications-popover"
                      className={`relative p-2 rounded-lg transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
                        navGlassHero
                          ? 'text-white/85 hover:text-white focus-visible:outline-white'
                          : 'text-gray-900 hover:text-brand focus-visible:outline-brand'
                      }`}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                      </svg>
                      {notifications.length > 0 && (
                        <span className="absolute top-1 right-1 w-2 h-2 bg-[#FF5500] rounded-full animate-pulse" aria-hidden />
                      )}
                      <span className="sr-only">Notifications</span>
                    </button>

                    {showNotifications && (
                      <div
                        ref={notifPanelRef}
                        id="notifications-popover"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="notifications-heading"
                        className="absolute right-0 mt-4 w-80 bg-white/90 backdrop-blur-xl border border-white/50 rounded-2xl shadow-2xl p-4 animate-in fade-in slide-in-from-top-2 duration-200 z-[200]"
                      >
                        <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-100">
                          <h3 id="notifications-heading" className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                            Notifications
                          </h3>
                          <button
                            type="button"
                            onClick={() => setShowNotifications(false)}
                            className="text-gray-400 hover:text-gray-600 rounded p-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                            aria-label="Close notifications"
                          >
                            &times;
                          </button>
                        </div>
                        <div className="space-y-3 max-h-60 overflow-y-auto custom-scroll">
                          {notifications.length > 0 ? (
                            notifications.map((notif, idx) => (
                              <div key={idx} className="flex gap-3 items-start p-2 hover:bg-gray-50 rounded-lg transition-colors">
                                <div className="w-1.5 h-1.5 rounded-full bg-[#FF5500] mt-1.5 flex-shrink-0" aria-hidden />
                                <p className="text-xs font-medium text-gray-800 leading-snug">{notif}</p>
                              </div>
                            ))
                          ) : (
                            <p className="text-xs text-gray-400 text-center py-4 italic">No new alerts.</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleNavClick(() => void handleLogout())}
                    className={`text-[10px] font-black uppercase tracking-widest rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-400 ${
                      navGlassHero ? 'text-red-300 hover:text-red-200' : 'text-red-500 hover:text-red-600'
                    }`}
                  >
                    Log out
                  </button>
                </div>
              )}
            </div>
          </div>
        </nav>

        <main id="main-content" className="relative z-0 flex-grow" tabIndex={-1}>
          <Outlet />
        </main>

        <div
          id="mobile-nav-overlay"
          className={`mobile-nav-overlay md:hidden fixed inset-0 z-[160] flex flex-col transition-[opacity,visibility] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
            isMobileMenuOpen ? 'visible opacity-100' : 'pointer-events-none invisible opacity-0'
          }`}
          aria-hidden={!isMobileMenuOpen}
        >
          <div
            className="pointer-events-none absolute inset-0 bg-[linear-gradient(165deg,#FFFCF9_0%,#FFF5EB_38%,#FFE8D4_72%,#F4F4F5_100%)]"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -right-32 -top-28 h-[22rem] w-[22rem] rounded-full bg-[radial-gradient(circle_at_center,rgba(255,85,0,0.18),transparent_68%)] blur-2xl"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -bottom-24 -left-28 h-[20rem] w-[20rem] rounded-full bg-[radial-gradient(circle_at_center,rgba(255,136,51,0.14),transparent_65%)] blur-2xl"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand/60 to-transparent"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-x-8 top-[5.5rem] h-px bg-gradient-to-r from-transparent via-white/80 to-transparent opacity-90"
            aria-hidden
          />

          <div className="relative mx-auto flex min-h-0 w-full max-w-md flex-1 flex-col overflow-y-auto px-5 pb-[max(2.5rem,env(safe-area-inset-bottom))] pt-[5.75rem]">
            <header className="mb-8 text-center">
              <p className="font-serif text-3xl font-medium italic tracking-tight text-gray-900">Menu</p>
              <p className="mt-2 text-[10px] font-black uppercase tracking-[0.45em] text-brand/90">
                {role === UserRole.GUEST ? 'Explore' : 'Navigate'}
              </p>
              <div className="mx-auto mt-4 h-px w-12 bg-gradient-to-r from-transparent via-brand/50 to-transparent" aria-hidden />
            </header>

            <div className="rounded-[1.75rem] border border-white/80 bg-white/45 p-5 shadow-[0_24px_64px_-28px_rgba(255,85,0,0.2),inset_0_1px_0_0_rgba(255,255,255,0.95)] backdrop-blur-xl">
              <div className="space-y-3">
                {role === UserRole.GUEST ? (
                  <>
                    <button
                      type="button"
                      onClick={() => handleNavClick(() => { navigate('/'); setIsMobileMenuOpen(false); })}
                      className="group flex w-full items-center justify-between rounded-2xl border border-white/90 bg-white/80 px-5 py-[1.125rem] text-left shadow-[0_2px_16px_-6px_rgba(0,0,0,0.06),inset_0_1px_0_0_rgba(255,255,255,1)] transition-all duration-300 hover:border-brand/25 hover:shadow-[0_12px_40px_-16px_rgba(255,85,0,0.22)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand active:scale-[0.99] motion-reduce:transition-none"
                    >
                      <span className="flex items-center gap-4">
                        <span
                          className="h-9 w-[3px] shrink-0 rounded-full bg-gradient-to-b from-brand to-brand-light shadow-[0_0_12px_rgba(255,85,0,0.35)]"
                          aria-hidden
                        />
                        <span className="text-[15px] font-semibold tracking-tight text-gray-900">Home</span>
                      </span>
                      <ChevronRight
                        className="h-5 w-5 shrink-0 text-brand/50 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:text-brand"
                        strokeWidth={2}
                        aria-hidden
                      />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleNavClick(() => { navigate('/auth'); setIsMobileMenuOpen(false); })}
                      className="mt-2 w-full rounded-full py-[1.125rem] text-[11px] font-black uppercase tracking-[0.32em] text-white shadow-[0_12px_40px_-8px_rgba(255,85,0,0.45)] transition hover:brightness-[1.03] active:scale-[0.99] motion-reduce:transition-none button-brand"
                    >
                      Get started
                    </button>
                  </>
                ) : (
                  <>
                    {(
                      [
                        { id: 'dashboard', path: '/dashboard', label: 'Dashboard' },
                        { id: 'marketplace', path: '/marketplace', label: 'Discover' },
                        { id: 'profile', path: '/profile', label: 'Profile' },
                        { id: 'settings', path: '/settings', label: 'Settings' },
                      ] as const
                    ).map(({ id, path, label }) => {
                      const active = currentPage === id;
                      return (
                        <button
                          key={id}
                          type="button"
                          onClick={() => handleNavClick(() => { navigate(path); setIsMobileMenuOpen(false); })}
                          className={`group flex w-full items-center justify-between rounded-2xl border px-5 py-[1.125rem] text-left transition-all duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand active:scale-[0.99] motion-reduce:transition-none ${
                            active
                              ? 'border-brand/35 bg-gradient-to-br from-white via-orange-50/90 to-amber-50/50 shadow-[0_12px_40px_-14px_rgba(255,85,0,0.28),inset_0_1px_0_0_rgba(255,255,255,0.9)] ring-1 ring-brand/15'
                              : 'border-white/90 bg-white/70 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.85)] hover:border-brand/20 hover:bg-white/90 hover:shadow-[0_8px_28px_-12px_rgba(255,85,0,0.15)]'
                          }`}
                        >
                          <span className="flex min-w-0 items-center gap-4">
                            <span
                              className={`h-9 w-[3px] shrink-0 rounded-full shadow-sm ${
                                active
                                  ? 'bg-gradient-to-b from-brand to-brand-light shadow-[0_0_14px_rgba(255,85,0,0.45)]'
                                  : 'bg-gradient-to-b from-orange-100 to-orange-50'
                              }`}
                              aria-hidden
                            />
                            <span
                              className={`truncate text-[15px] font-semibold tracking-tight ${active ? 'brand-text' : 'text-gray-800'}`}
                            >
                              {label}
                            </span>
                          </span>
                          {active ? (
                            <span
                              className="h-2 w-2 shrink-0 rounded-full bg-brand shadow-[0_0_10px_rgba(255,85,0,0.7)]"
                              aria-hidden
                            />
                          ) : (
                            <ChevronRight
                              className="h-5 w-5 shrink-0 text-gray-300 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:text-brand/60"
                              strokeWidth={2}
                              aria-hidden
                            />
                          )}
                        </button>
                      );
                    })}
                    <div className="mt-6 border-t border-white/60 pt-6">
                      <button
                        type="button"
                        onClick={() => handleNavClick(() => void handleLogout())}
                        className="w-full rounded-2xl border border-red-100/90 bg-white/60 px-5 py-3.5 text-center text-[11px] font-bold uppercase tracking-[0.28em] text-red-600/95 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.8)] transition hover:border-red-200 hover:bg-red-50/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-400"
                      >
                        Sign out
                      </button>
                    </div>
                  </>
                )}
                {isPwaInstallable && (
                  <div className="mt-6 pt-6 border-t border-white/60">
                    <div className="rounded-2xl bg-gradient-to-br from-brand/10 to-amber-500/5 border border-brand/20 p-4 flex flex-col items-center text-center shadow-inner">
                      <PwaDownloadIcon className="w-12 h-12 mb-2 animate-pulse" />
                      <h4 className="text-xs font-black uppercase tracking-wider text-gray-900 leading-none">Netfluenz Mobile</h4>
                      <p className="text-[9px] font-medium text-gray-600 mt-1.5 mb-3">Install on your home screen for rapid offline access.</p>
                      <button
                        type="button"
                        onClick={() => handleNavClick(() => { installPwa(); setIsMobileMenuOpen(false); })}
                        className="w-full py-2.5 rounded-full text-[9px] font-black uppercase tracking-widest text-white shadow-md transition-all active:scale-[0.98] button-brand shadow-orange-500/25"
                      >
                        Install App
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <p className="mt-auto pt-10 text-center text-[9px] font-semibold uppercase tracking-[0.35em] text-gray-400">
              Netfluenz
            </p>
          </div>
        </div>

        <footer className="mt-auto border-t border-white/50 bg-gradient-to-b from-white/50 via-orange-50/15 to-[#FFF8F3] px-6 pb-10 pt-16 shadow-[0_-12px_48px_-28px_rgba(255,85,0,0.08)] backdrop-blur-xl">
          <div className="max-w-7xl mx-auto space-y-12">
            <div className="flex flex-col items-center space-y-4">
              <NetfluenzLogo className="w-12 h-12" />
              <h4 className="text-xl font-black brand-text serif italic uppercase">Netfluenz</h4>
              <p className="text-gray-800 text-[10px] font-black uppercase tracking-widest text-center">
                Built to power global creator growth
              </p>
            </div>
            <nav className="flex flex-wrap justify-center gap-x-8 gap-y-2 text-[9px] font-black uppercase tracking-widest">
              <Link to="/terms" className="text-gray-700 hover:text-[#FF5500] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand rounded">
                Terms
              </Link>
              <Link to="/privacy" className="text-gray-700 hover:text-[#FF5500] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand rounded">
                Privacy
              </Link>
              <Link to="/contact" className="text-gray-700 hover:text-[#FF5500] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand rounded">
                Contact
              </Link>
            </nav>
            <div className="text-[8px] font-black text-gray-600 uppercase tracking-widest text-center">
              © 2026 Netfluenz. Structured influence, measurable growth.
            </div>
          </div>
        </footer>
      </div>

      {/* Premium Floating Mobile Install Banner */}
      {isPwaInstallable && !isBannerDismissed && (
        <div className="md:hidden fixed bottom-6 left-4 right-4 z-[4000] animate-in slide-in-from-bottom-10 fade-in duration-500">
          <div className="glass-card p-4 rounded-3xl border-brand/20 bg-white/90 backdrop-blur-xl shadow-2xl flex items-center justify-between space-x-3">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 shrink-0 rounded-2xl bg-gradient-to-br from-brand/10 to-amber-500/10 border border-brand/20 flex items-center justify-center shadow-md">
                <PwaDownloadIcon className="w-8 h-8 animate-pulse" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-wider text-gray-900 leading-none">Install Netfluenz App</span>
                <span className="text-[8px] font-semibold text-gray-600 mt-0.5 leading-snug">Tap to install for pure mobile speed!</span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => handleNavClick(() => void installPwa())}
                className="px-4 py-2 rounded-full button-brand text-[8px] font-black uppercase tracking-widest shadow-md shadow-brand/20 active:scale-95 transition-transform"
              >
                Install
              </button>
              <button
                type="button"
                onClick={() => handleNavClick(() => setIsBannerDismissed(true))}
                className="p-1 rounded-full text-gray-400 hover:text-gray-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand"
                aria-label="Dismiss banner"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Premium iOS share sheets manual installer instructions modal */}
      {showIosInstallInstructions && (
        <div 
          className="fixed inset-0 z-[6000] flex items-end justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md bg-white rounded-t-[2.5rem] p-6 shadow-2xl animate-in slide-in-from-bottom duration-500 border border-gray-100 pb-[max(2rem,env(safe-area-inset-bottom))]">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center space-x-3">
                <PwaDownloadIcon className="w-8 h-8" />
                <h3 className="text-sm font-black uppercase tracking-wider text-gray-900 serif italic">Install Netfluenz App</h3>
              </div>
              <button
                type="button"
                onClick={() => { playSound('click'); setShowIosInstallInstructions(false); }}
                className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-700 transition"
                aria-label="Close modal"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <p className="text-xs text-gray-600 mb-6 font-medium leading-relaxed">
              Safari on iOS does not support automatic one-click installation. You can easily add Netfluenz to your home screen manually in <span className="font-bold text-gray-900">3 simple steps</span>:
            </p>

            <div className="space-y-4">
              <div className="flex items-start space-x-4 p-3 bg-orange-50/50 rounded-2xl border border-orange-100/50">
                <div className="w-7 h-7 rounded-xl bg-orange-500/10 flex items-center justify-center text-xs font-black text-brand shrink-0">1</div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-wider text-gray-900 leading-none">Tap Share Button</span>
                  <span className="text-[9px] text-gray-600 mt-1">Tap the Safari share icon <span className="inline-block p-1 bg-white border border-gray-200 rounded mx-1 shadow-sm"><svg className="w-3.5 h-3.5 inline text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg></span> in Safari's bottom toolbar.</span>
                </div>
              </div>

              <div className="flex items-start space-x-4 p-3 bg-orange-50/50 rounded-2xl border border-orange-100/50">
                <div className="w-7 h-7 rounded-xl bg-orange-500/10 flex items-center justify-center text-xs font-black text-brand shrink-0">2</div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-wider text-gray-900 leading-none">Add to Home Screen</span>
                  <span className="text-[9px] text-gray-600 mt-1">Scroll down the sharing options sheet and tap <span className="font-bold text-gray-900">"Add to Home Screen"</span> <span className="inline-block p-1 bg-white border border-gray-200 rounded mx-1 shadow-sm"><span className="text-gray-700 font-bold text-xs inline-block line-height-none leading-none">+</span></span>.</span>
                </div>
              </div>

              <div className="flex items-start space-x-4 p-3 bg-orange-50/50 rounded-2xl border border-orange-100/50">
                <div className="w-7 h-7 rounded-xl bg-orange-500/10 flex items-center justify-center text-xs font-black text-brand shrink-0">3</div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-wider text-gray-900 leading-none">Confirm Installation</span>
                  <span className="text-[9px] text-gray-600 mt-1">Tap <span className="font-bold text-gray-900">"Add"</span> in the top-right corner of the confirmation panel!</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => { playSound('click'); setShowIosInstallInstructions(false); }}
              className="w-full mt-6 py-3 rounded-full text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-brand/20 button-brand active:scale-[0.98]"
            >
              Got It
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Layout;
