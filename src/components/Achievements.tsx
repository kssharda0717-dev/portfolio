'use client';

import { useRef, useState } from 'react';
import {
  Award,
  ArrowLeft,
  ArrowRight,
  Calculator,
  CircleCheck,
  Database,
  ShieldCheck,
  Target,
  TrendingUp,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { portfolioConfig } from '@config';
import { SectionHeading } from './SectionHeading';

const { achievements } = portfolioConfig;

const ICONS: Record<string, LucideIcon> = {
  Award,
  ShieldCheck,
  Database,
  CircleCheck,
  TrendingUp,
  Calculator,
  Target,
};

export function Achievements() {
  const trackRef = useRef<HTMLUListElement>(null);
  const [index, setIndex] = useState(0);

  const scrollBy = (direction: 1 | -1) => {
    const track = trackRef.current;
    if (!track) return;
    const card = track.firstElementChild as HTMLElement | null;
    if (!card) return;
    const step = card.offsetWidth + 16;
    track.scrollBy({ left: step * direction, behavior: 'smooth' });
  };

  const handleScroll = () => {
    const track = trackRef.current;
    if (!track) return;
    const card = track.firstElementChild as HTMLElement | null;
    if (!card) return;
    setIndex(Math.round(track.scrollLeft / (card.offsetWidth + 16)));
  };

  return (
    <section id="achievements" className="py-[var(--section-y)]">
      <div className="shell">
        <SectionHeading
          index="06"
          eyebrow="Achievements"
          lead="Proud"
          emphasis="moments."
        />

        <div className="mb-8 flex items-center justify-between">
          <p className="section-number">
            {String(Math.min(index + 1, achievements.length)).padStart(2, '0')} /{' '}
            {String(achievements.length).padStart(2, '0')}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              aria-label="Previous achievement"
              onClick={() => scrollBy(-1)}
              className="pill px-3 py-3"
            >
              <ArrowLeft size={16} strokeWidth={1.75} />
            </button>
            <button
              type="button"
              aria-label="Next achievement"
              onClick={() => scrollBy(1)}
              className="pill px-3 py-3"
            >
              <ArrowRight size={16} strokeWidth={1.75} />
            </button>
          </div>
        </div>
      </div>

      <ul
        ref={trackRef}
        onScroll={handleScroll}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto px-[var(--shell-x)] pb-4
          [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {achievements.map((achievement) => {
          const Icon = ICONS[achievement.iconName] ?? Award;
          return (
            <li
              key={achievement.id}
              className="flex w-[19rem] shrink-0 snap-start flex-col justify-between
                border border-rule bg-paper-raised p-7 sm:w-[21rem]"
            >
              <div>
                <Icon size={20} strokeWidth={1.5} className="text-accent" aria-hidden />
                <p className="eyebrow mt-5">{achievement.kicker}</p>
                <h3 className="mt-2.5 text-[1.05rem] leading-snug">
                  {achievement.title}
                </h3>
                <p className="mt-3 text-[0.82rem] leading-relaxed text-ink-soft">
                  {achievement.detail}
                </p>
              </div>
              <p className="display mt-10 text-[clamp(2.6rem,5vw,3.6rem)]">
                {achievement.value}
                {achievement.valueSuffix && (
                  <span className="text-[0.4em] text-ink-faint">
                    {achievement.valueSuffix}
                  </span>
                )}
              </p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
