'use client';

import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';

interface RevealProps {
  children: ReactNode;
  delay?: number;
  className?: string;
}

/**
 * Fade-and-rise on first scroll into view.
 *
 * Content starts visible and is only hidden once the observer is actually
 * attached, so it can never be stranded invisible if JS or IO is unavailable.
 */
export function Reveal({ children, delay = 0, className }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<'static' | 'hidden' | 'shown'>('static');

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    setState('hidden');
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setState('shown');
          observer.disconnect();
        }
      },
      { rootMargin: '0px 0px -12% 0px' }
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={
        state === 'static'
          ? undefined
          : {
              opacity: state === 'shown' ? 1 : 0,
              transform: state === 'shown' ? 'none' : 'translateY(24px)',
              transition: `opacity 650ms cubic-bezier(0.22,1,0.36,1) ${delay}s, transform 650ms cubic-bezier(0.22,1,0.36,1) ${delay}s`,
            }
      }
    >
      {children}
    </div>
  );
}
