/**
 * Rotating full-screen imagery for the marketing home page: crossfade + slow Ken Burns.
 * Respects `prefers-reduced-motion` (first image only, no timer).
 */

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { HOME_HERO_BACKGROUNDS } from '../constants';

const ROTATION_MS = 6000;

const HomeHeroBackground: React.FC = () => {
  const [index, setIndex] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduceMotion(mq.matches);
    const onChange = () => setReduceMotion(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    if (reduceMotion || HOME_HERO_BACKGROUNDS.length <= 1) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % HOME_HERO_BACKGROUNDS.length);
    }, ROTATION_MS);
    return () => window.clearInterval(id);
  }, [reduceMotion]);

  return (
    <>
      {HOME_HERO_BACKGROUNDS.map((src, i) => {
        const isActive = i === index;
        return (
          <img
            key={src}
            src={src}
            alt=""
            aria-hidden
            decoding="async"
            fetchPriority={i === 0 ? 'high' : 'low'}
            className={`absolute inset-0 h-full w-full object-cover transition-[opacity] duration-[1.4s] ease-in-out ${
              isActive ? 'opacity-100 z-[1]' : 'opacity-0 z-0'
            } ${isActive && !reduceMotion ? 'home-hero-ken-burns' : ''}`}
          />
        );
      })}
      {typeof document !== 'undefined' &&
        createPortal(
          <div
            className="fixed bottom-8 left-1/2 z-[40] flex -translate-x-1/2 gap-2 pointer-events-none md:bottom-10"
            aria-hidden
          >
            {HOME_HERO_BACKGROUNDS.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full shadow-sm transition-all duration-500 ${
                  i === index ? 'w-8 bg-white' : 'w-1.5 bg-white/45'
                }`}
              />
            ))}
          </div>,
          document.body
        )}
    </>
  );
};

export default HomeHeroBackground;
