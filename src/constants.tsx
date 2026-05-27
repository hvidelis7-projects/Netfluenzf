/**
 * Design tokens, marketing copy, and the Netfluenz logo.
 * Runtime campaign and creator data comes from Firestore (`AppContext` + `firestoreData.ts`).
 */

import React from 'react';

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

/** Official Netfluenz icon logo (SVG, transparent background). */
export const NetfluenzLogo: React.FC<{ className?: string }> = ({ className = 'w-10 h-10' }) => {
  return (
    <svg viewBox="0 0 256 256" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <linearGradient id="logoOrangeGrad" x1="60" y1="180" x2="200" y2="60" gradientUnits="userSpaceOnUse">
          <stop offset="0" stop-color="#FF7A00" />
          <stop offset="1" stop-color="#FF3300" />
        </linearGradient>
        <filter id="logoShadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="3" stdDeviation="3.5" flood-color="#FF3300" flood-opacity="0.22" />
        </filter>
      </defs>
      
      {/* Modern corporate hexagonal connectivity grid representing the "Net" */}
      <g stroke="#334155" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" opacity="0.8">
        <polygon points="128,32 211,80 211,176 128,224 45,176 45,80" />
        <line x1="128" y1="32" x2="128" y2="128" />
        <line x1="211" y1="80" x2="128" y2="128" />
        <line x1="211" y1="176" x2="128" y2="128" />
        <line x1="128" y1="224" x2="128" y2="128" />
        <line x1="45" y1="176" x2="128" y2="128" />
        <line x1="45" y1="80" x2="128" y2="128" />
      </g>

      {/* Network Node Vertices */}
      <circle cx="128" cy="32" r="9" fill="#1E293B" />
      <circle cx="211" cy="80" r="9" fill="#1E293B" />
      <circle cx="211" cy="176" r="9" fill="#1E293B" />
      <circle cx="128" cy="224" r="9" fill="#1E293B" />
      <circle cx="45" cy="176" r="9" fill="#1E293B" />
      <circle cx="45" cy="80" r="9" fill="#1E293B" />
      <circle cx="128" cy="128" r="7" fill="#475569" />

      {/* Sleek Orange Gradient "N"-shaped Growth Arrow */}
      <g filter="url(#logoShadow)">
        <path
          d="M80,165 L80,92 L176,165 L176,104"
          stroke="url(#logoOrangeGrad)"
          strokeWidth="16"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M158,104 L176,104 L176,122"
          stroke="url(#logoOrangeGrad)"
          strokeWidth="16"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
};

/** Custom premium PWA Download Icon resembling the Netfluenz logo. */
export const PwaDownloadIcon: React.FC<{ className?: string }> = ({ className = 'w-10 h-10' }) => {
  return (
    <svg viewBox="0 0 256 256" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <radialGradient id="dlTip" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(128 56) rotate(90) scale(60)">
          <stop offset="0" stop-color="#FFECC7"/>
          <stop offset="0.5" stop-color="#FFC060"/>
          <stop offset="1" stop-color="#FF5500"/>
        </radialGradient>
        <linearGradient id="dlArrowGrad" x1="128" y1="50" x2="128" y2="180" gradientUnits="userSpaceOnUse">
          <stop offset="0" stop-color="#FFE3C1"/>
          <stop offset="1" stop-color="#FF5500"/>
        </linearGradient>
        <filter id="dlShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="3" stdDeviation="3" flood-opacity="0.3"/>
        </filter>
        <g id="petal-half">
          <path d="M128 48C143 48 154 59 154 73C154 89 141 101 128 101C115 101 102 89 102 73C102 59 113 48 128 48Z" fill="url(#dlTip)" opacity="0.45"/>
        </g>
      </defs>
      
      <g filter="url(#dlShadow)">
        <use href="#petal-half" transform="rotate(0 128 128)"/>
        <use href="#petal-half" transform="rotate(45 128 128)"/>
        <use href="#petal-half" transform="rotate(90 128 128)"/>
        <use href="#petal-half" transform="rotate(135 128 128)"/>
        <use href="#petal-half" transform="rotate(180 128 128)"/>
        <use href="#petal-half" transform="rotate(225 128 128)"/>
        <use href="#petal-half" transform="rotate(270 128 128)"/>
        <use href="#petal-half" transform="rotate(315 128 128)"/>
      </g>

      <g filter="url(#dlShadow)">
        <path 
          d="M128 45V155M128 155L90 117M128 155L166 117" 
          stroke="url(#dlArrowGrad)" 
          strokeWidth="20" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
        <path 
          d="M75 190H181" 
          stroke="#FF5500" 
          strokeWidth="20" 
          strokeLinecap="round"
        />
      </g>
      
      <circle cx="128" cy="24" r="6.5" fill="#FF5500"/>
      <circle cx="202" cy="54" r="6" fill="#FFB44B"/>
      <circle cx="232" cy="128" r="6.5" fill="#FF5500"/>
      <circle cx="202" cy="202" r="6" fill="#FFB44B"/>
      <circle cx="128" cy="232" r="6.5" fill="#FF5500"/>
      <circle cx="54" cy="202" r="6" fill="#FFB44B"/>
      <circle cx="24" cy="128" r="6.5" fill="#FF5500"/>
      <circle cx="54" cy="54" r="6" fill="#FFB44B"/>
    </svg>
  );
};
