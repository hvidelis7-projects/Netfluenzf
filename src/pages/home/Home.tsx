/**
 * Marketing home: mission narrative (Africa flywheel, brands, creators) plus factual product surface.
 *
 * Design tokens (keep in sync when editing):
 * — Section vertical rhythm: `sectionY` = py-24 md:py-32 (major bands); compact strips use py-6 md:py-7.
 * — Radius: cards/panels = rounded-2xl; primary actions = rounded-full only.
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, ChevronDown } from 'lucide-react';
import { HOME_PRODUCT_PILLARS } from '../../constants';
import { playSound } from '../../audio.ts';
import { HomeHeroKinetic, HomeSectionReveal } from '../../components/home';
import { useHomeHeroCarousel } from '../../context/home/HomeHeroCarouselContext';
import {
  sectionY,
  sectionShell,
  overline,
  FLYWHEEL_ICONS,
  FLYWHEEL_POINTS,
  BRAND_FLYWHEEL_BULLETS,
  IMPACT_PILLARS,
  MODULES,
  JOURNEY_STEPS,
  FAQ_ITEMS,
} from './content';

const PillarCard: React.FC<{ title: string; body: string; index: number }> = ({ title, body, index }) => (
  <div>
    <p className="font-mono text-[10px] font-medium tabular-nums text-white/40">{String(index + 1).padStart(2, '0')}</p>
    <h3 className="mt-2 font-sans text-sm font-semibold text-white">{title}</h3>
    <p className="home-body-prose mt-2 text-sm leading-relaxed text-white/65">{body}</p>
  </div>
);

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { index: heroIndex, total: heroTotal } = useHomeHeroCarousel();
  const cta = () => {
    playSound('click');
    navigate('/auth');
  };

  const scrollToMission = () => {
    playSound('click');
    document.getElementById('home-mission')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="home-brand text-stone-900 antialiased font-ui-refined pb-24 md:pb-32">
      {/* Hero — no scroll-reveal (staggered hero lines use .home-hero-anim) */}
      <section
        className="relative isolate flex min-h-[min(100svh,860px)] flex-col justify-end pb-12 pt-24 md:justify-center md:pb-20 md:pt-32"
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
              <aside className="home-hero-panel home-hero-anim home-hero-anim--d8 rounded-2xl border border-white/15 bg-white/[0.07] p-5 shadow-elevated-glass ring-1 ring-white/10 backdrop-blur-xl md:p-8">
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

        <div className="pointer-events-none absolute inset-x-0 bottom-6 z-10 flex flex-col items-center gap-3 md:bottom-8">
          <p className="home-scroll-cue text-[10px] font-semibold uppercase tracking-[0.18em] text-white/65" aria-hidden>
            Scroll
          </p>
          <div className="flex gap-2" aria-hidden>
            {Array.from({ length: heroTotal }).map((_, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full shadow-sm transition-all duration-500 ${
                  i === heroIndex ? 'w-8 bg-white' : 'w-1.5 bg-white/45'
                }`}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={scrollToMission}
            className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full border border-white/25 bg-white/10 text-white/80 backdrop-blur-md transition hover:border-white/40 hover:bg-white/15 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white motion-reduce:transition-none"
            aria-label="Scroll to learn more"
          >
            <ChevronDown className="h-5 w-5 motion-safe:animate-bounce" strokeWidth={2} aria-hidden />
          </button>
        </div>
      </section>

      <HomeSectionReveal
        id="home-mission"
        className={`home-narrative-band home-section-divider ${sectionY}`}
        aria-labelledby="home-mission-heading"
      >
        <div className={sectionShell}>
          <div className="home-glass-rail p-8 md:p-12 lg:p-14">
            <header className="mx-auto max-w-3xl text-center">
              <p className={overline}>Trifluenz</p>
              <h2
                id="home-mission-heading"
                className="mt-3 font-serif text-3xl font-semibold leading-tight tracking-tight text-balance text-stone-900 md:text-[2.125rem] md:leading-snug"
              >
                Why we exist
              </h2>
              <div className="home-body-prose mx-auto mt-6 max-w-prose space-y-5 text-left text-sm leading-relaxed text-pretty text-stone-600 md:text-center md:text-base">
                <p>
                  Trifluenz exists to formalize, structure, and scale Africa&apos;s influencer economy with data,
                  transparency, and performance.
                </p>
                <p className="font-medium text-stone-800">
                  We are Kenya-first, with infrastructure designed to scale across Africa.
                </p>
              </div>
            </header>

            <div className="mt-14 grid gap-6 lg:mt-16 lg:grid-cols-2 lg:gap-8">
              <div className="home-glass-card p-8 md:p-10">
                <h3 className="font-serif text-xl font-semibold tracking-tight text-stone-900 md:text-2xl">
                  Built for Kenya, ready to scale
                </h3>
                <ul className="mt-6 space-y-5">
                  {IMPACT_PILLARS.map((item) => (
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
                  Trifluenz is designed to fuel youth income, SME growth, and economic inclusion across Africa.
                </p>
              </div>
            </div>
          </div>
        </div>
      </HomeSectionReveal>

      <HomeSectionReveal
        id="for-brands"
        className={`home-narrative-band-alt home-section-divider ${sectionY}`}
        aria-labelledby="home-brands-heading"
      >
        <div className={sectionShell}>
          <div className="home-glass-rail p-8 md:p-10 lg:p-12">
            <p className={overline}>For brands</p>
            <h2
              id="home-brands-heading"
              className="mt-3 max-w-3xl font-serif text-3xl font-semibold leading-tight tracking-tight text-balance text-stone-900 md:text-[2.125rem] md:leading-snug"
            >
              For brands that want reliable growth
            </h2>
            <p className="home-body-prose mt-4 max-w-3xl text-sm leading-relaxed text-pretty text-stone-600 md:text-base">
              Find the right creators, manage delivery, and measure performance in one workflow.
            </p>
            <h3 className="mt-10 font-sans text-xs font-semibold uppercase tracking-[0.14em] text-stone-500">
              Why brands choose Trifluenz
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
              aria-label="Launch a campaign on Trifluenz"
            >
              Launch your campaign today
              <ArrowUpRight className="h-4 w-4 shrink-0" strokeWidth={2.25} aria-hidden />
            </button>
          </div>
        </div>
      </HomeSectionReveal>

      <HomeSectionReveal
        id="for-creators"
        className={`home-narrative-band home-section-divider ${sectionY}`}
        aria-labelledby="home-creators-heading"
      >
        <div className={sectionShell}>
          <div className="home-glass-rail p-8 md:p-10 lg:p-12">
            <p className={overline}>For creators</p>
            <h2
              id="home-creators-heading"
              className="mt-3 max-w-3xl font-serif text-3xl font-semibold leading-tight tracking-tight text-balance text-stone-900 md:text-[2.125rem] md:leading-snug"
            >
              For creators building steady income
            </h2>
            <div className="home-body-prose mt-6 max-w-3xl space-y-5 text-sm leading-relaxed text-pretty text-stone-600 md:text-base">
              <p>You don&apos;t need millions of followers to start earning.</p>
              <p>Find brand opportunities that match your style, audience, and strengths.</p>
              <p className="font-medium text-stone-800">Just getting started? You&apos;re welcome here.</p>
              <p>Build your profile, collaborate with brands, and grow with transparent campaign workflows.</p>
            </div>
            <p className="mt-10 max-w-3xl font-serif text-lg font-semibold leading-snug text-stone-900 md:text-xl">
              Start creating with purpose and get paid for your work.
            </p>
            <button
              type="button"
              onClick={cta}
              className="mt-6 inline-flex items-center justify-center gap-2 rounded-full border border-white/80 bg-white/70 px-8 py-3.5 text-sm font-semibold text-stone-900 shadow-md backdrop-blur-md transition hover:border-brand/35 hover:bg-white active:scale-[0.99] motion-reduce:transition-none"
              aria-label="Join Trifluenz as a creator"
            >
              Join Trifluenz today
              <ArrowRight className="h-4 w-4 shrink-0" strokeWidth={2.25} aria-hidden />
            </button>
          </div>
        </div>
      </HomeSectionReveal>

      <HomeSectionReveal
        className={`home-narrative-band-alt home-section-divider ${sectionY}`}
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
                What you can do on Trifluenz
              </h2>
              <p className="home-body-prose mt-4 max-w-prose text-sm leading-relaxed text-pretty text-stone-600 md:text-base">
                Core tools that keep collaboration clear from discovery to delivery and payment tracking.
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
      </HomeSectionReveal>

      <HomeSectionReveal
        className={`home-narrative-band home-section-divider px-4 sm:px-8 ${sectionY} lg:px-10`}
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
      </HomeSectionReveal>

      <HomeSectionReveal
        id="how-it-works"
        className={`home-narrative-band-alt home-section-divider ${sectionY}`}
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
                Five clear steps from account setup to campaign payout.
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
      </HomeSectionReveal>

      <HomeSectionReveal
        className={`home-narrative-band home-section-divider ${sectionY}`}
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
      </HomeSectionReveal>

      <HomeSectionReveal
        className="home-section-divider border-t border-stone-200/90 bg-home-surfaceMuted px-5 pb-8 pt-6 sm:px-8 lg:px-10"
        aria-labelledby="home-cta-heading"
      >
        <div className={`${sectionShell} max-w-3xl`}>
          <div className="home-cta-panel rounded-2xl border border-white/15 p-8 text-center shadow-elevated-cta md:p-10">
            <h2
              id="home-cta-heading"
              className="font-serif text-2xl font-semibold leading-snug tracking-tight text-balance text-white md:text-3xl"
            >
              Join Trifluenz
            </h2>
            <p className="home-body-prose mx-auto mt-4 max-w-prose text-sm leading-relaxed text-pretty text-white/80 md:text-[0.9375rem]">
              Brands can launch campaigns with structure. Creators can find opportunities, collaborate clearly, and grow
              earnings.
            </p>
            <button
              type="button"
              onClick={cta}
              className="mt-8 inline-flex items-center justify-center gap-2 rounded-full bg-white px-8 py-3.5 text-sm font-semibold text-stone-900 shadow-lg transition hover:bg-stone-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white active:scale-[0.99] motion-reduce:transition-none"
              aria-label="Continue to Trifluenz authentication"
            >
              Continue to sign in or register
              <ArrowUpRight className="h-4 w-4 shrink-0" strokeWidth={2.25} aria-hidden />
            </button>
          </div>
        </div>
      </HomeSectionReveal>
    </div>
  );
};

export default Home;
