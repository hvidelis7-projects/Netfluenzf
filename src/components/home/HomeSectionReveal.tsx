/**
 * Scroll-triggered section entrance for the marketing home page.
 */

import React, { useEffect, useRef, useState } from 'react';

type HomeSectionRevealProps = React.ComponentProps<'section'>;

export const HomeSectionReveal: React.FC<HomeSectionRevealProps> = ({
  children,
  className = '',
  ...rest
}) => {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mq.matches) {
      setVisible(true);
      return;
    }

    if (typeof window.IntersectionObserver === 'undefined') {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -6% 0px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      className={`home-section-reveal${visible ? ' is-visible' : ''}${className ? ` ${className}` : ''}`}
      {...rest}
    >
      {children}
    </section>
  );
};
