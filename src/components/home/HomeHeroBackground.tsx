/**
 * Rotating full-screen imagery for the marketing home page: crossfade + slow Ken Burns.
 * Respects `prefers-reduced-motion` (first image only, no timer).
 */

import React, { useState, useEffect } from 'react';
import { HOME_HERO_BACKGROUNDS } from '../../constants';
import { useHomeHeroCarouselOptional } from '../../context/home/HomeHeroCarouselContext';

const ROTATION_MS = 6000;

const HomeHeroBackground: React.FC = () => {
  const carousel = useHomeHeroCarouselOptional();
  const [localIndex, setLocalIndex] = useState(0);
  const index = carousel?.index ?? localIndex;
  const setIndex = carousel?.setIndex ?? setLocalIndex;
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
  }, [reduceMotion, setIndex]);

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
    </>
  );
};

export default HomeHeroBackground;
