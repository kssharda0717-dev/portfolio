'use client';

import { useEffect, useRef, useState } from 'react';
import { portfolioConfig } from '@config';

const { navigation } = portfolioConfig;

export function PillNav() {
  const [activeId, setActiveId] = useState<string>(navigation[0].id);
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const sections = navigation
      .map((item) => document.getElementById(item.id))
      .filter((element): element is HTMLElement => element !== null);

    const observer = new IntersectionObserver(
      (entries) => {
        // The section closest to the top of the viewport wins.
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveId(visible[0].target.id);
      },
      { rootMargin: '-25% 0px -60% 0px' }
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  /*
    On a phone the six pills are wider than the screen, so the row scrolls. The
    scroll-spy is useless if the pill it highlights is off-screen, so the active
    one is centred as it changes. Written against the list's own `scrollLeft`
    rather than `scrollIntoView`, which would also scroll the document.
  */
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    if (list.scrollWidth <= list.clientWidth) return;

    const pill = list.querySelector<HTMLElement>(`[href="#${activeId}"]`);
    if (!pill) return;

    list.scrollTo({
      left: pill.offsetLeft - (list.clientWidth - pill.offsetWidth) / 2,
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ? 'auto'
        : 'smooth',
    });
  }, [activeId]);

  return (
    <nav
      aria-label="Sections"
      className="fixed inset-x-3 bottom-4 z-50 md:inset-x-auto md:bottom-6 md:left-1/2 md:-translate-x-1/2"
    >
      <ul
        ref={listRef}
        className="no-scrollbar flex items-center gap-1 overflow-x-auto overscroll-x-contain rounded-full border border-rule bg-paper-raised/85 p-1.5 shadow-[0_8px_30px_rgba(20,27,51,0.08)] backdrop-blur-md"
      >
        {navigation.map((item) => {
          const isActive = item.id === activeId;
          return (
            <li key={item.id} className="shrink-0">
              <a
                href={`#${item.id}`}
                aria-current={isActive ? 'true' : undefined}
                /* min-h-11 keeps the touch target at the 44px floor. */
                className={`flex min-h-11 items-center rounded-full px-4 text-[0.78rem] tracking-wide transition-colors duration-300 md:min-h-0 md:py-2 ${
                  isActive
                    ? 'bg-accent text-white'
                    : 'text-ink-soft hover:text-ink'
                }`}
              >
                {item.label}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
