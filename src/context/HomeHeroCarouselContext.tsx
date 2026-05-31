/**
 * Shares rotating hero photography index between Layout background and Home hero UI.
 */

import React, { createContext, useContext, useMemo, useState } from 'react';
import { HOME_HERO_BACKGROUNDS } from '../constants';

type HomeHeroCarouselContextValue = {
  index: number;
  setIndex: React.Dispatch<React.SetStateAction<number>>;
  total: number;
};

const HomeHeroCarouselContext = createContext<HomeHeroCarouselContextValue | null>(null);

export const HomeHeroCarouselProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [index, setIndex] = useState(0);
  const value = useMemo(
    () => ({ index, setIndex, total: HOME_HERO_BACKGROUNDS.length }),
    [index]
  );
  return <HomeHeroCarouselContext.Provider value={value}>{children}</HomeHeroCarouselContext.Provider>;
};

export function useHomeHeroCarousel(): HomeHeroCarouselContextValue {
  const ctx = useContext(HomeHeroCarouselContext);
  if (!ctx) {
    throw new Error('useHomeHeroCarousel must be used within HomeHeroCarouselProvider');
  }
  return ctx;
}

export function useHomeHeroCarouselOptional(): HomeHeroCarouselContextValue | null {
  return useContext(HomeHeroCarouselContext);
}
