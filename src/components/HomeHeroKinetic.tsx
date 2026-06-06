/**
 * Hero left column: springy stagger (motion) + factual trust chips; respects reduced motion.
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { HOME_PRODUCT_PILLARS } from '../constants';
import { playSound } from '../audio.ts';

export type HomeHeroKineticProps = {
  onPrimaryCta: () => void;
};

const trustChipLabels = [
  HOME_PRODUCT_PILLARS[0].title,
  HOME_PRODUCT_PILLARS[1].title,
  HOME_PRODUCT_PILLARS[2].title,
] as const;

const HERO_TITLE_PLAIN =
  "Formalize, structure, and scale Africa's influencer economy. Trifluenz helps brands run measurable creator campaigns and helps creators earn through transparent workflows.";

const easeOut = [0.16, 1, 0.32, 1] as const;

export const HomeHeroKinetic: React.FC<HomeHeroKineticProps> = ({ onPrimaryCta }) => {
  const reduceMotion = useReducedMotion();

  const container = {
    hidden: {},
    show: {
      transition: reduceMotion
        ? { staggerChildren: 0, delayChildren: 0 }
        : { staggerChildren: 0.09, delayChildren: 0.04 },
    },
  };

  const item = {
    hidden: { opacity: 0, y: reduceMotion ? 0 : 18 },
    show: {
      opacity: 1,
      y: 0,
      transition: reduceMotion ? { duration: 0 } : { duration: 0.72, ease: easeOut },
    },
  };

  return (
    <motion.div
      className="space-y-6 lg:space-y-7"
      variants={container}
      initial="hidden"
      animate="show"
    >
      <motion.p variants={item} className="font-mono text-[11px] font-medium uppercase tracking-[0.22em] text-white/55">
        Trifluenz
      </motion.p>

      <motion.div variants={item} className="h-px max-w-[4.5rem] bg-gradient-to-r from-white/50 to-transparent" aria-hidden />

      <motion.div variants={item}>
        <h1 id="home-hero-title" className="max-w-3xl space-y-3 md:space-y-4">
          <span className="sr-only">{HERO_TITLE_PLAIN}</span>
          <span aria-hidden="true" className="flex flex-col gap-3 md:gap-4">
            <span className="block font-serif text-[clamp(1.05rem,2.4vw,1.35rem)] font-medium leading-snug tracking-tight text-white/90 [text-shadow:0_2px_24px_rgba(0,0,0,0.5)]">
              Formalize, structure, and scale
            </span>
            <span className="block font-serif text-[clamp(2.35rem,6.2vw,4rem)] font-semibold leading-[1.05] tracking-tight text-balance text-white [text-shadow:0_2px_28px_rgba(0,0,0,0.45)]">
              <span className="brand-text home-hero-brand-text home-hero-brand-text--shimmer not-italic">
                Africa&apos;s influencer economy.
              </span>
            </span>
            <span className="block max-w-prose font-sans text-base font-medium leading-snug tracking-tight text-white md:text-lg md:leading-relaxed lg:max-w-2xl lg:text-xl [text-shadow:0_2px_32px_rgba(0,0,0,0.65),0_1px_12px_rgba(0,0,0,0.5)]">
              Trifluenz helps brands run measurable creator campaigns and helps creators earn through transparent workflows.
            </span>
          </span>
        </h1>
      </motion.div>

      <motion.div variants={item} className="flex flex-wrap gap-2 pt-0.5" role="list" aria-label="Product highlights">
        {trustChipLabels.map((label) => (
          <span key={label} className="home-premium-chip" role="listitem">
            {label}
          </span>
        ))}
      </motion.div>

      <motion.div variants={item} className="flex flex-col gap-3 pt-1 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
        <button
          type="button"
          onClick={onPrimaryCta}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-brand/25 transition active:scale-[0.99] motion-reduce:transition-none sm:w-auto button-brand"
          aria-label="Create a Trifluenz account"
        >
          Start free account
          <ArrowUpRight className="h-4 w-4 shrink-0" strokeWidth={2.25} aria-hidden />
        </button>
        <Link
          to="/auth"
          onClick={() => playSound('click')}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/30 bg-white/5 px-8 py-3.5 text-sm font-semibold text-white backdrop-blur-md transition hover:border-white/45 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:w-auto"
          aria-label="Sign in to your Trifluenz account"
        >
          I already have an account
          <ArrowRight className="h-4 w-4 shrink-0" strokeWidth={2.25} aria-hidden />
        </Link>
      </motion.div>
    </motion.div>
  );
};
