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

/** Official Trifluenz icon — creator tripod with 3-blade lens aperture hub. */
export const TrifluenzLogo: React.FC<{ className?: string }> = ({ className = 'w-10 h-10' }) => {
  const uid = useId().replace(/:/g, '');

  return (
    <svg viewBox="0 0 256 256" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden>
      <defs>
        <linearGradient id={`${uid}-ring`} x1="94" y1="24" x2="162" y2="84" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#FFE066" />
          <stop offset="0.45" stopColor="#FF5500" />
          <stop offset="1" stopColor="#FF3366" />
        </linearGradient>
        <radialGradient
          id={`${uid}-ringFill`}
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(128 54) rotate(90) scale(36)"
        >
          <stop offset="0" stopColor="#312E81" />
          <stop offset="0.55" stopColor="#1E1B4B" />
          <stop offset="1" stopColor="#FF5500" stopOpacity="0.35" />
        </radialGradient>
        <linearGradient id={`${uid}-bladeA`} x1="128" y1="28" x2="128" y2="60" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#FFF3B0" />
          <stop offset="0.5" stopColor="#FFB020" />
          <stop offset="1" stopColor="#FF7700" />
        </linearGradient>
        <linearGradient id={`${uid}-bladeB`} x1="128" y1="28" x2="128" y2="60" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#FFD4A8" />
          <stop offset="0.45" stopColor="#FF5500" />
          <stop offset="1" stopColor="#FF2200" />
        </linearGradient>
        <linearGradient id={`${uid}-bladeC`} x1="128" y1="28" x2="128" y2="60" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#FFCCE8" />
          <stop offset="0.45" stopColor="#FF6688" />
          <stop offset="1" stopColor="#FF4400" />
        </linearGradient>
        <radialGradient
          id={`${uid}-iris`}
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(128 54) rotate(90) scale(14)"
        >
          <stop offset="0" stopColor="#FFFFFF" />
          <stop offset="0.35" stopColor="#FFE8A3" />
          <stop offset="0.75" stopColor="#FF8833" />
          <stop offset="1" stopColor="#FF3300" />
        </radialGradient>
        <linearGradient id={`${uid}-stem`} x1="128" y1="86" x2="128" y2="110" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#A78BFA" />
          <stop offset="0.5" stopColor="#FF8833" />
          <stop offset="1" stopColor="#FF5500" />
        </linearGradient>
        <linearGradient id={`${uid}-legL`} x1="128" y1="118" x2="40" y2="210" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#818CF8" />
          <stop offset="0.45" stopColor="#FF8833" />
          <stop offset="1" stopColor="#FF3300" />
        </linearGradient>
        <linearGradient id={`${uid}-legR`} x1="128" y1="118" x2="216" y2="210" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#C084FC" />
          <stop offset="0.45" stopColor="#FF6644" />
          <stop offset="1" stopColor="#FF2255" />
        </linearGradient>
        <linearGradient id={`${uid}-legC`} x1="128" y1="118" x2="128" y2="224" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#FFB020" />
          <stop offset="0.5" stopColor="#FF5500" />
          <stop offset="1" stopColor="#E03000" />
        </linearGradient>
        <radialGradient
          id={`${uid}-hub`}
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(128 116) rotate(90) scale(12)"
        >
          <stop offset="0" stopColor="#FFE566" />
          <stop offset="0.6" stopColor="#FF5500" />
          <stop offset="1" stopColor="#FF3366" />
        </radialGradient>
        <filter id={`${uid}-glow`} x="-40%" y="-40%" width="180%" height="180%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#FF8833" floodOpacity="0.55" />
          <feDropShadow dx="0" dy="6" stdDeviation="10" floodColor="#FF4400" floodOpacity="0.28" />
        </filter>
        <filter id={`${uid}-bloom`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Ambient colour wash behind mark */}
      <ellipse cx="128" cy="130" rx="88" ry="96" fill="#FF5500" opacity="0.07" />
      <ellipse cx="128" cy="54" rx="42" ry="38" fill="#FF8833" opacity="0.12" />

      <g filter={`url(#${uid}-glow)`}>
        {/* Aperture ring */}
        <circle cx="128" cy="54" r="34" stroke={`url(#${uid}-ring)`} strokeWidth="5.5" fill={`url(#${uid}-ringFill)`} />

        {/* 3 iris blades — distinct warm hues */}
        <g transform="translate(128 54)">
          <path
            d="M0 -26 C9 -24 16 -16 14 -5 L0 6 L-14 -5 C-16 -16 -9 -24 0 -26 Z"
            fill={`url(#${uid}-bladeA)`}
          />
          <path
            d="M0 -26 C9 -24 16 -16 14 -5 L0 6 L-14 -5 C-16 -16 -9 -24 0 -26 Z"
            fill={`url(#${uid}-bladeB)`}
            transform="rotate(120)"
          />
          <path
            d="M0 -26 C9 -24 16 -16 14 -5 L0 6 L-14 -5 C-16 -16 -9 -24 0 -26 Z"
            fill={`url(#${uid}-bladeC)`}
            transform="rotate(240)"
          />
        </g>

        {/* Inner iris + lens bloom */}
        <g filter={`url(#${uid}-bloom)`}>
          <circle cx="128" cy="54" r="11" fill={`url(#${uid}-iris)`} />
        </g>
        <ellipse cx="121" cy="47" rx="9" ry="6" fill="#FFFFFF" opacity="0.45" />
        <circle cx="133" cy="58" r="2.5" fill="#FFFFFF" opacity="0.6" />

        {/* Mount stem */}
        <rect x="119" y="86" width="18" height="26" rx="5" fill={`url(#${uid}-stem)`} />
        <rect x="122" y="88" width="5" height="20" rx="2.5" fill="#FFFFFF" opacity="0.35" />

        {/* Y-junction hub */}
        <circle cx="128" cy="116" r="11" fill={`url(#${uid}-hub)`} />
        <circle cx="128" cy="116" r="5.5" fill="#FFFFFF" opacity="0.5" />

        {/* Tripod legs — each a distinct warm gradient */}
        <path
          d="M128 124 Q96 160 40 208"
          stroke={`url(#${uid}-legL)`}
          strokeWidth="16"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M128 124 Q160 160 216 208"
          stroke={`url(#${uid}-legR)`}
          strokeWidth="16"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M128 124 L128 222"
          stroke={`url(#${uid}-legC)`}
          strokeWidth="12"
          strokeLinecap="round"
          fill="none"
        />

        {/* Leg specular highlights */}
        <path
          d="M128 130 Q100 164 50 204"
          stroke="#FFFFFF"
          strokeWidth="3.5"
          strokeLinecap="round"
          fill="none"
          opacity="0.28"
        />
        <path
          d="M128 130 Q156 164 206 204"
          stroke="#FFFFFF"
          strokeWidth="3.5"
          strokeLinecap="round"
          fill="none"
          opacity="0.28"
        />
        <path
          d="M128 134 L128 214"
          stroke="#FFFFFF"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
          opacity="0.22"
        />

        {/* Rubber feet — jewel-tone accents */}
        <circle cx="40" cy="208" r="11" fill="#4C1D95" />
        <circle cx="216" cy="208" r="11" fill="#9D174D" />
        <circle cx="128" cy="222" r="10" fill="#C2410C" />
        <circle cx="40" cy="208" r="6" fill="#FFB020" />
        <circle cx="216" cy="208" r="6" fill="#FF6688" />
        <circle cx="128" cy="222" r="5.5" fill="#FF8833" />
        <circle cx="40" cy="208" r="2.5" fill="#FFFFFF" opacity="0.7" />
        <circle cx="216" cy="208" r="2.5" fill="#FFFFFF" opacity="0.7" />
        <circle cx="128" cy="222" r="2" fill="#FFFFFF" opacity="0.65" />
      </g>
    </svg>
  );
};

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
