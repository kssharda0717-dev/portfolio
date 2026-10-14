'use client';

import { useEffect, useRef, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';

interface TimelineRowProps {
  /** Big year — or the script "Next" — sitting on the rail opposite the card. */
  marker: string;
  /** Swap the grotesk year face for the italic-serif face. */
  markerFace?: 'display' | 'display-em';
  /** Which side of the rail the card occupies on large screens. */
  side: 'left' | 'right';
  /** The rail stops at the dot on the final row instead of running on. */
  isLast?: boolean;
  /**
   * In the function form the card is handed the row's reveal state so it can
   * unfold its own detail in step with the rail. The observer lives here, so
   * this is cheaper than every card running a second one — but it does mean a
   * caller using the function form must be a client component, since React
   * cannot serialise a function child across the server boundary.
   */
  children: ReactNode | ((shown: boolean) => ReactNode);
}

const EASE = 'cubic-bezier(0.22,1,0.36,1)';

/**
 * One node of the centre timeline: a rail segment that draws itself in, a dot,
 * the card, and the year. Starts in a `static` (no inline style) state so the
 * content is never stranded invisible if JS or IntersectionObserver is absent.
 *
 * The reveal repeats. It used to disconnect on first sight, which meant coming
 * back to the section from anywhere else found every row already open — the
 * sequence that gives the timeline its shape only ever played once per page
 * load. Rows now re-arm once they are well clear of the viewport.
 */
export function TimelineRow({
  marker,
  markerFace = 'display',
  side,
  isLast,
  children,
}: TimelineRowProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<'static' | 'hidden' | 'shown'>('static');

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    setState('hidden');
    /*
      The row must reach the middle band of the viewport before it opens, not
      merely peek over the bottom edge. A shallow margin let a card unfold while
      it was still mostly below the fold, so by the time you scrolled to it the
      reveal had already happened and the chain read as a static wall of text.
    */
    const reveal = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setState('shown');
      },
      { rootMargin: '-10% 0px -42% 0px' }
    );

    /*
      Re-arming is a *second* observer rather than the `else` of the first,
      because the band above is a narrow strip in the middle of the viewport:
      a row stops intersecting it the moment you scroll past, and resetting
      there would snap each card shut right under the reader. This one fires
      only once the row is a clear 25% of a viewport beyond either edge — far
      enough that the collapse is off-screen, so returning to the section finds
      the rail drawn fresh and the cards unfold again in sequence.

      That gap also keeps the two from fighting: the reveal band sits strictly
      inside this one, so no row can be entering and re-arming at the same time.
    */
    const rearm = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) setState('hidden');
      },
      { rootMargin: '25% 0px 25% 0px' }
    );

    reveal.observe(element);
    rearm.observe(element);
    return () => {
      reveal.disconnect();
      rearm.disconnect();
    };
  }, []);

  const hidden = state === 'hidden';
  const animated = state !== 'static';

  /*
    Distance and direction are kept apart, and the direction is published as a
    custom property, because CSS has to be able to overrule it: below `md` the
    rail moves to the left edge and every row has to enter from that side. A
    rightward entrance there overhangs the viewport and gives the whole page a
    horizontal scrollbar. `.timeline-slide` in globals.css forces --slide-dir
    to -1 on narrow screens.
  */
  const slide = (distance: number, direction: 1 | -1, delay: number) =>
    animated
      ? ({
          opacity: hidden ? 0 : 1,
          '--slide-dir': direction,
          transform: hidden ? `translateX(calc(${distance}px * var(--slide-dir)))` : 'none',
          transition: `opacity 700ms ${EASE} ${delay}ms, transform 700ms ${EASE} ${delay}ms`,
        } as CSSProperties)
      : undefined;

  const cardOnLeft = side === 'left';

  return (
    <div
      ref={ref}
      className="relative pb-14 pl-12 last:pb-0 md:grid md:grid-cols-2 md:gap-14 md:pb-20 md:pl-0"
    >
      {/* Rail */}
      <span
        aria-hidden
        className={`absolute left-[0.3rem] top-0 w-px bg-rule md:left-1/2 ${
          isLast ? 'h-12' : 'h-full'
        }`}
      />
      <span
        aria-hidden
        className={`absolute left-[0.3rem] top-0 w-px bg-ink md:left-1/2 ${
          isLast ? 'h-12' : 'h-full'
        }`}
        style={
          animated
            ? {
                transformOrigin: 'top',
                transform: hidden ? 'scaleY(0)' : 'scaleY(1)',
                transition: `transform 900ms ${EASE}`,
              }
            : undefined
        }
      />
      {/* Dot */}
      <span
        aria-hidden
        className="absolute left-[0.3rem] top-[2.1rem] h-[0.7rem] w-[0.7rem] -translate-x-1/2 rounded-full bg-ink md:left-1/2"
        style={
          animated
            ? {
                transform: `translateX(-50%) scale(${hidden ? 0 : 1})`,
                transition: `transform 500ms ${EASE} 250ms`,
              }
            : undefined
        }
      />

      {/* Year / "Next" marker */}
      <p
        className={`timeline-slide ${markerFace} mb-4 text-[clamp(1.9rem,5vw,4.2rem)] leading-none text-ink md:mb-0 md:self-start ${
          cardOnLeft ? 'md:order-2 md:pl-2 md:text-left' : 'md:order-1 md:pr-2 md:text-right'
        }`}
        style={slide(20, cardOnLeft ? 1 : -1, 160)}
      >
        {marker}
      </p>

      {/* Card */}
      <div
        className={`timeline-slide ${cardOnLeft ? 'md:order-1' : 'md:order-2'}`}
        style={slide(28, cardOnLeft ? -1 : 1, 0)}
      >
        {typeof children === 'function' ? children(!hidden) : children}
      </div>
    </div>
  );
}
