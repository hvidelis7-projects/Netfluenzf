/**
 * Marketing home copy and section data — kept separate from layout in `Home.tsx`.
 */

import { BarChart2, Shield, Sparkles } from 'lucide-react';

export const sectionY = 'py-24 md:py-32';
export const sectionShell = 'mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-10';
/** Uses `--home-label-tracking` via `.home-overline` in `index.css`. */
export const overline = 'home-overline text-[11px] font-semibold uppercase text-stone-500';

export const FLYWHEEL_ICONS = [Shield, BarChart2, Sparkles] as const;

export const FLYWHEEL_POINTS: { title: string; body: string }[] = [
  {
    title: 'Build trust',
    body: 'Verified creators help brands collaborate with confidence.',
  },
  {
    title: 'Learn from data',
    body: 'Every campaign gives insights that improve your next one.',
  },
  {
    title: 'Grow opportunities',
    body: 'More creators and brands create more opportunities for everyone.',
  },
];

export const BRAND_FLYWHEEL_BULLETS: string[] = [
  'Match with verified creators and reduce fake-engagement risk.',
  'Track campaign performance with practical, real-time metrics.',
  'Invest budget in what works and scale with confidence.',
];

export const IMPACT_PILLARS: { title: string; body: string }[] = [
  {
    title: 'Kenya-first',
    body: 'Built for local brands, creators, and the realities of working in Kenya.',
  },
  {
    title: 'Structured deals',
    body: 'Clear briefs, milestones, and deliverables — not handshake DMs.',
  },
  {
    title: 'Continent-scale vision',
    body: 'Starting in Kenya with infrastructure designed to grow across Africa.',
  },
];

export const MODULES: { title: string; body: string }[] = [
  {
    title: 'Dashboard',
    body: 'Your home screen for campaigns, earnings, and important updates.',
  },
  {
    title: 'Marketplace',
    body: 'Find and post opportunities where brands and creators can connect.',
  },
  {
    title: 'Campaign detail',
    body: 'See campaign goals, tasks, participants, deadlines, and progress in one place.',
  },
  {
    title: 'Profile',
    body: 'Show who you are, what you create, and why brands should work with you.',
  },
  {
    title: 'Wallet & transactions',
    body: 'Track your earnings, payout status, and transaction history clearly.',
  },
  {
    title: 'Media uploads',
    body: 'Upload profile photos and campaign content quickly and securely.',
  },
];

export const JOURNEY_STEPS: { title: string; body: string }[] = [
  { title: 'Create your account', body: 'Sign up and set up your profile in a few minutes.' },
  { title: 'Launch or find campaigns', body: 'Brands create campaign goals while creators discover matching opportunities.' },
  { title: 'Connect and collaborate', body: 'Brands and creators agree on the right fit and start working together.' },
  { title: 'Create and review content', body: 'Share deliverables, give feedback, and keep everything in one place.' },
  {
    title: 'Finish and get paid',
    body: 'Approve completed work and track payments clearly from start to finish.',
  },
];

export const FAQ_ITEMS: { q: string; a: string }[] = [
  {
    q: 'What is Trifluenz?',
    a: 'Trifluenz connects creators and brands through structured, performance-focused campaigns. It gives both sides clearer workflows, visibility, and outcomes.',
  },
  {
    q: 'Who can use it?',
    a: 'Creators and brands of all sizes can use Trifluenz. If you want to grow through creator partnerships, the platform is built for you.',
  },
  {
    q: 'How is data handled?',
    a: 'Creator and campaign data is stored securely. Relevant users get transparent performance metrics, and fake engagement is not supported.',
  },
  {
    q: 'Where do I get support?',
    a: 'Use the Contact page in the footer. Our team will guide you through setup, campaigns, and account support.',
  },
];
