/**
 * Marketing home: mission narrative (Africa flywheel, brands, creators) plus factual product surface.
 *
 * Design tokens (keep in sync when editing):
 * — Section vertical rhythm: `sectionY` = py-24 md:py-32 (major bands); compact strips use py-6 md:py-7.
 * — Radius: cards/panels = rounded-2xl; primary actions = rounded-full only.
 */

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, BarChart2, ChevronDown, Shield, Sparkles } from 'lucide-react';
import { HOME_PRODUCT_PILLARS } from '../constants';
import { playSound } from '../audio.ts';
import { HomeHeroKinetic } from '../components/HomeHeroKinetic';

const sectionY = 'py-24 md:py-32';
const sectionShell = 'mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-10';
/** Uses `--home-label-tracking` via `.home-overline` in `index.css`. */
const overline = 'home-overline text-[11px] font-semibold uppercase text-stone-500';

/** Mission narrative — marketing home (aligned with product positioning). */
const FLYWHEEL_ICONS = [Shield, BarChart2, Sparkles] as const;

const FLYWHEEL_POINTS: { title: string; body: string }[] = [
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

const BRAND_FLYWHEEL_BULLETS: string[] = [
  'Work with verified creators and reduce the risk of fake engagement.',
  'Track campaign performance in real time with clear, practical metrics.',
  'Focus your budget on results and scale what works.',
];

const MODULES: { title: string; body: string }[] = [
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

const JOURNEY_STEPS: { title: string; body: string }[] = [
  { title: 'Create your account', body: 'Sign up and set up your profile in a few minutes.' },
  { title: 'Launch or find campaigns', body: 'Brands create campaign goals while creators discover matching opportunities.' },
  { title: 'Connect and collaborate', body: 'Brands and creators agree on the right fit and start working together.' },
  { title: 'Create and review content', body: 'Share deliverables, give feedback, and keep everything in one place.' },
  {
    title: 'Finish and get paid',
    body: 'Approve completed work and track payments clearly from start to finish.',
  },
];

const FAQ_ITEMS: { q: string; a: string }[] = [
  {
    q: 'What is Netfluenz?',
    a: 'Netfluenz is a platform that connects creators and brands through a transparent, performance-focused system. It helps both sides run campaigns with more structure, visibility, and better results.',
  },
  {
    q: 'Who can use it?',
    a: 'Creators of all sizes and brands of all sizes can use Netfluenz. If you have an engaged audience or want to grow through creator partnerships, the platform is built for you.',
  },
  {
    q: 'How is data handled?',
    a: 'Creator and campaign data is stored securely. Key performance metrics are shared transparently with relevant users, and fake engagement is not supported.',
  },
  {
    q: 'Where do I get support?',
    a: 'Use the Contact page in the footer. Our team will guide you through setup, campaigns, and account support.',
  },
];

const PillarCard: React.FC<{ title: string; body: string; index: number }> = ({ title, body, index }) => (
  <div>
    <p className="font-mono text-[10px] font-medium tabular-nums text-white/40">{String(index + 1).padStart(2, '0')}</p>
    <h3 className="mt-2 font-sans text-sm font-semibold text-white">{title}</h3>
    <p className="home-body-prose mt-2 text-sm leading-relaxed text-white/65">{body}</p>
  </div>
);

const Home: React.FC = () => {
  const navigate = useNavigate();
  const cta = () => {
    playSound('click');
    navigate('/auth');
  };

  return (
    <div className="home-brand text-stone-900 antialiased font-ui-refined pb-24 md:pb-32">
      {/* Hero — no scroll-reveal (staggered hero lines use .home-hero-anim) */}
      <section
        className="relative isolate flex min-h-[min(100svh,880px)] flex-col justify-end pb-14 pt-28 md:justify-center md:pb-20 md:pt-32"
        aria-labelledby="home-hero-title"
      >
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black via-black/72 to-black/38"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-br from-brand/15 via-transparent to-transparent opacity-60 mix-blend-soft-light"
          aria-hidden
        />
        <div className="pointer-events-none absolute inset-0 home-hero-mesh" aria-hidden />
        <div className="pointer-events-none absolute inset-0 home-hero-scrim-read" aria-hidden />
        <div className="pointer-events-none absolute inset-0 home-hero-top-glow" aria-hidden />
        <div className="pointer-events-none absolute inset-0 home-hero-vignette" aria-hidden />

        <div className={`${sectionShell} relative z-10`}>
          <div className="grid items-end gap-12 lg:grid-cols-12 lg:items-center lg:gap-16">
            <div className="lg:col-span-7">
              <HomeHeroKinetic onPrimaryCta={cta} />
            </div>

            <div className="lg:col-span-5">
              <aside className="home-hero-panel home-hero-anim home-hero-anim--d8 rounded-2xl border border-white/15 bg-white/[0.07] p-6 shadow-elevated-glass ring-1 ring-white/10 backdrop-blur-xl md:p-8">
                <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/60">North star</h2>
                <p className="mt-4 font-serif text-xl font-semibold leading-snug tracking-tight text-white md:text-2xl">
                  A growing ecosystem where creators and brands can work, earn, and grow together.
                </p>
                <h3 className="mt-8 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/55">The flywheel</h3>
                <ul className="mt-4 space-y-3">
                  {FLYWHEEL_POINTS.map((item, i) => {
                    const Icon = FLYWHEEL_ICONS[i];
                    return (
                      <li
                        key={item.title}
                        className="flex gap-3 rounded-xl border border-white/10 bg-white/[0.04] p-3 font-sans text-sm leading-snug text-white/85"
                      >
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10 text-white/90">
                          <Icon className="h-4 w-4" strokeWidth={2} aria-hidden />
                        </span>
                        <span>
                          <span className="font-semibold text-white">{item.title}</span>
                          <span className="mt-0.5 block text-[13px] leading-relaxed text-white/70">{item.body}</span>
                        </span>
                      </li>
                    );
                  })}
                </ul>
                <p className="mt-6 border-t border-white/10 pt-5 font-sans text-xs leading-relaxed text-white/65 md:text-sm">
                  <span className="font-semibold text-white/90">Growth with impact</span> for creators, brands, and local
                  communities.
                </p>
              </aside>
            </div>
          </div>
        </div>
      </section>

      <section
        className={`home-section-reveal home-narrative-band ${sectionY}`}
        aria-labelledby="home-mission-heading"
      >
        <div className={sectionShell}>
          <div className="home-glass-rail p-8 md:p-12 lg:p-14">
            <header className="mx-auto max-w-3xl text-center">
              <p className={overline}>Netfluenz</p>
              <h2
                id="home-mission-heading"
                className="mt-3 font-serif text-3xl font-semibold leading-tight tracking-tight text-balance text-stone-900 md:text-[2.125rem] md:leading-snug"
              >
                Why we exist
              </h2>
              <div className="home-body-prose mx-auto mt-6 max-w-prose space-y-5 text-left text-sm leading-relaxed text-pretty text-stone-600 md:text-center md:text-base">
                <p>
                  Netfluenz exists to formalize, structure, and scale Africa&apos;s influencer economy. We are replacing
                  informal, trust-based deals with a system built on data, transparency, and performance, unlocking access
                  for millions.
                </p>
                <p className="font-medium text-stone-800">
                  Our target is clear: a 10 million+ engaged ecosystem of creators, brands, and opportunities.
                </p>
              </div>
            </header>

            <div className="mt-14 grid gap-6 lg:mt-16 lg:grid-cols-2 lg:gap-8">
              <div className="home-glass-card p-8 md:p-10">
                <h3 className="font-serif text-xl font-semibold tracking-tight text-stone-900 md:text-2xl">
                  The flywheel effect
                </h3>
                <ul className="mt-6 space-y-5">
                  {FLYWHEEL_POINTS.map((item) => (
                    <li key={item.title} className="border-l-2 border-brand/50 pl-4">
                      <p className="font-sans text-xs font-semibold uppercase tracking-[0.12em] text-stone-500">{item.title}</p>
                      <p className="home-body-prose mt-1.5 text-sm leading-relaxed text-stone-700 md:text-[0.9375rem]">{item.body}</p>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="home-glass-card home-glass-card--warm p-8 md:p-10">
                <h3 className="font-serif text-xl font-semibold tracking-tight text-stone-900 md:text-2xl">
                  Profit with purpose
                </h3>
                <p className="home-body-prose mt-5 text-sm leading-relaxed text-stone-700 md:text-[0.9375rem]">
                  We don&apos;t just generate returns; we expand access.
                </p>
                <p className="home-body-prose mt-4 text-sm leading-relaxed text-stone-700 md:text-[0.9375rem]">
                  Netfluenz is designed to fuel youth income, SME growth, and economic inclusion across Africa.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        id="for-brands"
        className={`home-section-reveal home-narrative-band-alt ${sectionY}`}
        aria-labelledby="home-brands-heading"
      >
        <div className={sectionShell}>
          <div className="home-glass-rail p-8 md:p-10 lg:p-12">
            <p className={overline}>For brands</p>
            <h2
              id="home-brands-heading"
              className="mt-3 max-w-3xl font-serif text-3xl font-semibold leading-tight tracking-tight text-balance text-stone-900 md:text-[2.125rem] md:leading-snug"
            >
              Growth-minded brands don&apos;t guess. They scale.
            </h2>
            <p className="home-body-prose mt-5 max-w-3xl text-sm leading-relaxed text-pretty text-stone-600 md:text-base">
              Netfluenz gives brands the tools to run creator campaigns in one place.
            </p>
            <p className="home-body-prose mt-4 max-w-3xl text-sm leading-relaxed text-pretty text-stone-600 md:text-base">
              Find the right creators, manage delivery, and measure results with more confidence.
            </p>
            <h3 className="mt-10 font-sans text-xs font-semibold uppercase tracking-[0.14em] text-stone-500">
              Why brands choose Netfluenz
            </h3>
            <ul className="mt-5 max-w-3xl list-disc space-y-3 pl-5 text-sm leading-relaxed text-stone-700 marker:text-orange-200/80 md:text-[0.9375rem]">
              {BRAND_FLYWHEEL_BULLETS.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
            <p className="mt-10 max-w-3xl font-serif text-lg font-semibold leading-snug text-stone-900 md:text-xl">
              Run creator campaigns with less guesswork and better outcomes.
            </p>
            <button
              type="button"
              onClick={cta}
              className="mt-6 inline-flex items-center justify-center gap-2 rounded-full px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-brand/25 transition hover:brightness-105 active:scale-[0.99] motion-reduce:transition-none button-brand"
            >
              Launch your campaign today
              <ArrowUpRight className="h-4 w-4 shrink-0" strokeWidth={2.25} aria-hidden />
            </button>
          </div>
        </div>
      </section>

      <section
        id="for-creators"
        className={`home-section-reveal home-narrative-band ${sectionY}`}
        aria-labelledby="home-creators-heading"
      >
        <div className={sectionShell}>
          <div className="home-glass-rail p-8 md:p-10 lg:p-12">
            <p className={overline}>For creators</p>
            <h2
              id="home-creators-heading"
              className="mt-3 max-w-3xl font-serif text-3xl font-semibold leading-tight tracking-tight text-balance text-stone-900 md:text-[2.125rem] md:leading-snug"
            >
              Turn your creativity into steady income opportunities.
            </h2>
            <div className="home-body-prose mt-6 max-w-3xl space-y-5 text-sm leading-relaxed text-pretty text-stone-600 md:text-base">
              <p>You don&apos;t need millions of followers to start earning.</p>
              <p>
                Netfluenz helps you find brand opportunities that match your style, audience, and strengths.
              </p>
              <p className="font-medium text-stone-800">Just getting started? You&apos;re welcome here.</p>
              <p>
                Build your profile, collaborate with brands, and grow step by step with transparent campaign workflows.
              </p>
            </div>
            <p className="mt-10 max-w-3xl font-serif text-lg font-semibold leading-snug text-stone-900 md:text-xl">
              Start creating with purpose and get paid for your work.
            </p>
            <button
              type="button"
              onClick={cta}
              className="mt-6 inline-flex items-center justify-center gap-2 rounded-full border border-white/80 bg-white/70 px-8 py-3.5 text-sm font-semibold text-stone-900 shadow-md backdrop-blur-md transition hover:border-brand/35 hover:bg-white active:scale-[0.99] motion-reduce:transition-none"
            >
              Join Netfluenz today
              <ArrowRight className="h-4 w-4 shrink-0" strokeWidth={2.25} aria-hidden />
            </button>
          </div>
        </div>
      </section>

      <section
        className={`home-section-reveal home-narrative-band-alt ${sectionY}`}
        aria-labelledby="home-modules-heading"
      >
        <div className={sectionShell}>
          <div className="home-glass-rail p-8 md:p-10 lg:p-12">
            <header className="mb-10 max-w-2xl border-b border-white/50 pb-8 md:mb-12 md:pb-10">
              <p className={`${overline} mb-3`}>Application surface</p>
              <h2
                id="home-modules-heading"
                className="font-serif text-3xl font-semibold leading-tight tracking-tight text-balance text-stone-900 md:text-[2.125rem]"
              >
                What you can do on Netfluenz
              </h2>
              <p className="home-body-prose mt-4 max-w-prose text-sm leading-relaxed text-pretty text-stone-600 md:text-base">
                Everything below is designed to help creators and brands work together smoothly, from discovery to campaign
                completion and payment tracking.
              </p>
            </header>

            <div className="grid gap-4 md:grid-cols-2">
              {MODULES.map((m, i) => (
                <div
                  key={m.title}
                  className="home-glass-card home-glass-card--bento rounded-2xl p-6 md:p-8"
                >
                  <p className="font-mono text-[10px] font-medium tabular-nums text-stone-400">{String(i + 1).padStart(2, '0')}</p>
                  <h3 className="mt-2 font-sans text-base font-semibold text-stone-900">{m.title}</h3>
                  <p className="home-body-prose mt-2 text-sm leading-relaxed text-stone-600">{m.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section
        className={`home-section-reveal home-narrative-band px-4 sm:px-8 ${sectionY} lg:px-10`}
        aria-labelledby="home-pillars-heading"
      >
        <div className={`${sectionShell} max-w-6xl`}>
          <div className="home-pillars-frame">
            <div className="home-pillars-slab overflow-hidden rounded-2xl border border-white/10">
              <div className="border-b border-white/10 px-6 py-10 md:px-10 md:py-12">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/50">Scope</p>
                <h2
                  id="home-pillars-heading"
                  className="mt-3 max-w-2xl font-serif text-2xl font-semibold tracking-tight text-balance text-white md:text-3xl"
                >
                  What you can rely on
                </h2>
                <p className="home-body-prose mt-4 max-w-prose text-sm text-pretty text-white/60 md:text-[0.9375rem]">
                  Core features designed to help creators and brands work with confidence.
                </p>
              </div>
              <div className="grid gap-8 px-6 py-8 md:grid-cols-2 md:gap-x-10 md:gap-y-8 md:px-10 md:py-10 lg:grid-cols-4">
                {HOME_PRODUCT_PILLARS.map((pillar, idx) => (
                  <PillarCard key={pillar.title} title={pillar.title} body={pillar.body} index={idx} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        className={`home-section-reveal home-narrative-band-alt ${sectionY}`}
        aria-labelledby="home-journey-heading"
      >
        <div className={`${sectionShell} max-w-3xl`}>
          <div className="home-glass-rail p-8 md:p-10 lg:p-12">
            <header className="mb-8 border-b border-white/50 pb-8 md:mb-10 md:pb-10">
              <p className={`${overline} mb-2`}>Workflow</p>
              <h2
                id="home-journey-heading"
                className="font-serif text-3xl font-semibold tracking-tight text-balance text-stone-900 md:text-[2.125rem]"
              >
                How it works
              </h2>
              <p className="home-body-prose mt-3 max-w-prose text-sm text-pretty text-stone-600 md:text-base">
                A simple step-by-step flow for both creators and brands.
              </p>
            </header>

            <ol className="relative m-0 list-none border-l border-orange-200/40 p-0 pl-6 md:pl-8">
              {JOURNEY_STEPS.map((step, i) => (
                <li key={step.title} className="relative pb-8 pl-2 last:pb-0 md:pb-10">
                  <span
                    className="absolute -left-6 top-1.5 flex h-5 w-5 -translate-x-px items-center justify-center rounded-full border border-white/90 bg-white/90 font-mono text-[10px] font-semibold text-stone-700 shadow-md backdrop-blur-sm md:-left-8 md:h-6 md:w-6 md:text-[11px]"
                    aria-hidden
                  >
                    {i + 1}
                  </span>
                  <div className="home-glass-card rounded-2xl p-5 md:p-6">
                    <h4 className="font-sans text-base font-semibold text-stone-900">{step.title}</h4>
                    <p className="home-body-prose mt-1.5 text-sm leading-relaxed text-stone-600">{step.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section
        className={`home-section-reveal home-narrative-band ${sectionY}`}
        aria-labelledby="home-faq-heading"
      >
        <div className={`${sectionShell} max-w-2xl`}>
          <div className="home-glass-rail p-8 md:p-10">
            <header className="mb-8 border-b border-white/50 pb-8 md:mb-10 md:pb-10">
              <h2
                id="home-faq-heading"
                className="font-serif text-3xl font-semibold tracking-tight text-balance text-stone-900 md:text-[2.125rem]"
              >
                Common questions
              </h2>
              <p className="home-body-prose mt-2 max-w-prose text-sm text-pretty text-stone-600 md:text-base">
                Quick answers to the most common questions from creators and brands.
              </p>
            </header>
            <div className="space-y-2.5">
              {FAQ_ITEMS.map((item) => (
                <details
                  key={item.q}
                  className="home-glass-faq group overflow-hidden [&::-webkit-details-marker]:hidden"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-4 py-3.5 text-left font-sans text-sm font-semibold text-stone-900 transition-colors duration-200 hover:bg-white/25 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-900 md:text-[0.9375rem] [&::-webkit-details-marker]:hidden">
                    {item.q}
                    <ChevronDown
                      className="h-4 w-4 shrink-0 text-stone-400 transition-transform duration-300 group-open:rotate-180 group-open:text-brand motion-reduce:transition-none"
                      aria-hidden
                    />
                  </summary>
                  <p className="home-body-prose border-t border-white/55 bg-white/55 px-4 py-3 text-sm leading-relaxed text-stone-600 backdrop-blur-md">
                    {item.a}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section
        className={`home-section-reveal border-t border-stone-200/90 bg-home-surfaceMuted px-5 pb-8 pt-6 sm:px-8 lg:px-10`}
        aria-labelledby="home-cta-heading"
      >
        <div className={`${sectionShell} max-w-3xl`}>
          <div className="home-cta-panel rounded-2xl border border-white/15 p-8 text-center shadow-elevated-cta md:p-10">
            <h2
              id="home-cta-heading"
              className="font-serif text-2xl font-semibold leading-snug tracking-tight text-balance text-white md:text-3xl"
            >
              Get on the platform
            </h2>
            <p className="home-body-prose mx-auto mt-4 max-w-prose text-sm leading-relaxed text-pretty text-white/80 md:text-[0.9375rem]">
              Brands can launch and manage campaigns with ease. Creators can find opportunities, collaborate, and grow
              their earnings. Sign up or log in to get started.
            </p>
            <button
              type="button"
              onClick={cta}
              className="mt-8 inline-flex items-center justify-center gap-2 rounded-full bg-white px-8 py-3.5 text-sm font-semibold text-stone-900 shadow-lg transition hover:bg-stone-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white active:scale-[0.99] motion-reduce:transition-none"
            >
              Continue to sign in / register
              <ArrowUpRight className="h-4 w-4 shrink-0" strokeWidth={2.25} aria-hidden />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
