/**
 * Design tokens, marketing copy, and the Trifluenz logo.
 * Runtime campaign and creator data comes from Firestore (`AppContext` + `firestoreData.ts`).
 */

import React, { useId } from 'react';

/**
 * Full-bleed welcome-page backgrounds: portraits & lifestyle (creator / model energy).
 * Used by `HomeHeroBackground` in Layout — crossfades every few seconds on the home route.
 */
export const HOME_HERO_BACKGROUNDS: string[] = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=85&w=1920',
  'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&q=85&w=1920',
  'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=85&w=1920',
  'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&q=85&w=1920',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=85&w=1920',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=85&w=1920',
];

/** Single static image for non-home routes (dashboard, etc.). */
export const APP_SHELL_BACKGROUND =
  'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=1600';

/** Mirrors Tailwind usage in CSS; handy if you need programmatic access. */
export const COLORS = {
  primary: '#FF5500',
  bg: '#FFFFFF',
  card: '#F3F4F6',
  textMuted: '#6B7280',
};

/**
 * Home page capability strip: factual product scope only (no fabricated metrics or endorsements).
 * Wording should stay aligned with what the shipped web app actually exposes.
 */
export const HOME_PRODUCT_PILLARS = [
  {
    title: 'Personalized experience',
    body: 'Creators and brands each get a tailored dashboard and easy sign-in options.',
  },
  {
    title: 'Campaign management',
    body: 'Plan campaigns, invite collaborators, and track progress in one organized workspace.',
  },
  {
    title: 'Wallet & payments',
    body: 'Monitor earnings, payout progress, and transaction history with clear visibility.',
  },
  {
    title: 'Saved history',
    body: 'Your profile, campaigns, and activity stay saved so you can pick up where you left off.',
  },
] as const;

/** Official Trifluenz icon — premium creator tripod with jewel aperture lens. */
export const TrifluenzLogo: React.FC<{ className?: string }> = ({ className = 'w-10 h-10' }) => (
  <img
    src="/trifluenz-logo.svg"
    alt=""
    className={className}
    aria-hidden
    decoding="async"
    draggable={false}
  />
);

/** @deprecated Use TrifluenzLogo */
export const NetfluenzLogo = TrifluenzLogo;

/** PWA install icon — aperture tripod base with download arrow. */
export const PwaDownloadIcon: React.FC<{ className?: string }> = ({ className = 'w-10 h-10' }) => {
  const uid = useId().replace(/:/g, '');

  return (
    <svg viewBox="0 0 256 256" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden>
      <defs>
        <linearGradient id={`${uid}-dl-ring`} x1="100" y1="24" x2="156" y2="80" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#FFE066" />
          <stop offset="1" stopColor="#FF5500" />
        </linearGradient>
        <linearGradient id={`${uid}-dl-bladeA`} x1="128" y1="32" x2="128" y2="58" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#FFF3B0" />
          <stop offset="1" stopColor="#FF8800" />
        </linearGradient>
        <linearGradient id={`${uid}-dl-bladeB`} x1="128" y1="32" x2="128" y2="58" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#FFD4A8" />
          <stop offset="1" stopColor="#FF4400" />
        </linearGradient>
        <linearGradient id={`${uid}-dl-bladeC`} x1="128" y1="32" x2="128" y2="58" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#FFCCE8" />
          <stop offset="1" stopColor="#FF6688" />
        </linearGradient>
        <linearGradient id={`${uid}-dl-legL`} x1="128" y1="96" x2="52" y2="168" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#A78BFA" />
          <stop offset="1" stopColor="#FF8833" />
        </linearGradient>
        <linearGradient id={`${uid}-dl-legR`} x1="128" y1="96" x2="204" y2="168" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#C084FC" />
          <stop offset="1" stopColor="#FF5577" />
        </linearGradient>
        <linearGradient id={`${uid}-dl-legC`} x1="128" y1="96" x2="128" y2="172" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#FFB020" />
          <stop offset="1" stopColor="#FF4400" />
        </linearGradient>
        <linearGradient id={`${uid}-dl-arrow`} x1="128" y1="108" x2="128" y2="196" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#FFF8EE" />
          <stop offset="1" stopColor="#FF5500" />
        </linearGradient>
        <filter id={`${uid}-dl-shadow`} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="#FF8833" floodOpacity="0.45" />
        </filter>
      </defs>

      {/* Ghost tripod — upper portion */}
      <g opacity="0.62">
        <circle cx="128" cy="52" r="28" stroke={`url(#${uid}-dl-ring)`} strokeWidth="4" fill="#312E81" opacity="0.7" />
        <g transform="translate(128 52)">
          <path d="M0 -20 C7 -18 12 -12 11 -4 L0 5 L-11 -4 C-12 -12 -7 -18 0 -20 Z" fill={`url(#${uid}-dl-bladeA)`} />
          <path d="M0 -20 C7 -18 12 -12 11 -4 L0 5 L-11 -4 C-12 -12 -7 -18 0 -20 Z" fill={`url(#${uid}-dl-bladeB)`} transform="rotate(120)" />
          <path d="M0 -20 C7 -18 12 -12 11 -4 L0 5 L-11 -4 C-12 -12 -7 -18 0 -20 Z" fill={`url(#${uid}-dl-bladeC)`} transform="rotate(240)" />
        </g>
        <circle cx="128" cy="52" r="8" fill="#FFE566" />
        <rect x="121" y="78" width="14" height="16" rx="3" fill="#A78BFA" />
        <path d="M128 96 Q98 124 52 168" stroke={`url(#${uid}-dl-legL)`} strokeWidth="10" strokeLinecap="round" />
        <path d="M128 96 Q158 124 204 168" stroke={`url(#${uid}-dl-legR)`} strokeWidth="10" strokeLinecap="round" />
        <path d="M128 96 L128 172" stroke={`url(#${uid}-dl-legC)`} strokeWidth="7" strokeLinecap="round" />
        <circle cx="52" cy="168" r="6" fill="#FFB020" />
        <circle cx="204" cy="168" r="6" fill="#FF6688" />
        <circle cx="128" cy="172" r="5" fill="#FF8833" />
      </g>

      {/* Download arrow — centered below aperture, above feet */}
      <g filter={`url(#${uid}-dl-shadow)`}>
        <path
          d="M128 108V168M128 168L96 136M128 168L160 136"
          stroke={`url(#${uid}-dl-arrow)`}
          strokeWidth="16"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M88 196H168" stroke="#FF5500" strokeWidth="16" strokeLinecap="round" />
      </g>
    </svg>
  );
};
