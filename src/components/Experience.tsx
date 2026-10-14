'use client';

// Client-side because the cards hand a function child to TimelineRow to read
// its scroll-reveal state, and React cannot serialise that across the boundary.

import { ArrowRight } from 'lucide-react';
import { portfolioConfig } from '@config';
import { SectionHeading } from './SectionHeading';
import { TimelineRow } from './TimelineRow';

const { experience, education, experienceOutro } = portfolioConfig;

interface TimelineEntry {
  key: string;
  kind: 'Education' | 'Experience';
  year: string;
  period: string;
  title: string;
  subtitle: string;
  bullets: string[];
  chips: string[];
}

const startYear = (period: string) => period.match(/\d{4}/)?.[0] ?? '';

const entries: TimelineEntry[] = [
  ...education.map((item) => ({
    key: item.qualification,
    kind: 'Education' as const,
    year: startYear(item.period),
    period: item.period,
    title: item.qualification,
    subtitle: item.institution,
    bullets: [],
    chips: item.detail ? item.detail.split(' · ') : [],
  })),
  ...experience.map((item) => ({
    key: `${item.organisation}-${item.period}`,
    kind: 'Experience' as const,
    year: startYear(item.period),
    period: item.period,
    title: item.role,
    subtitle: item.client
      ? `${item.organisation} · ${item.client}`
      : item.organisation,
    bullets: item.highlights,
    chips: item.location ? [item.location] : [],
  })),
].sort((a, b) => Number(a.year) - Number(b.year));

export function Experience() {
  return (
    <section id="experience" className="shell py-[var(--section-y)]">
      <SectionHeading
        index="05"
        eyebrow="Track record"
        lead="Education &"
        emphasis="experience."
        blurb="Six years inside enterprise payroll, now building the tools it was missing — one path, scroll to follow it."
      />

      <div className="mx-auto max-w-5xl">
        {entries.map((entry, index) => (
          <TimelineRow
            key={entry.key}
            marker={entry.year}
            side={index % 2 === 0 ? 'left' : 'right'}
          >
            {(shown) => (
            <article className="rounded-[1.1rem] bg-paper-raised p-7 shadow-[0_20px_50px_-30px_rgba(20,27,51,0.55)]">
              <div className="flex items-start justify-between gap-4">
                <span
                  className={`rounded-full px-3 py-1 text-[0.58rem] font-medium uppercase tracking-[0.18em] ${
                    entry.kind === 'Experience'
                      ? 'bg-ink text-paper'
                      : 'bg-paper-sunk text-ink-soft'
                  }`}
                >
                  {entry.kind}
                </span>
                <span className="section-number shrink-0 pt-1">{entry.period}</span>
              </div>

              <h3 className="display mt-4 text-[clamp(1.1rem,2.1vw,1.45rem)]">
                {entry.title}
              </h3>
              <p className="mt-1.5 text-[0.84rem] leading-snug text-ink-soft">
                {entry.subtitle}
              </p>

              {/*
                The detail unfolds only once the row has arrived, so scrolling
                the timeline reads as a sequence rather than a wall of text.
                `0fr -> 1fr` animates to the content's own height without
                measuring it; the inner div owns the overflow clip.
              */}
              {(entry.bullets.length > 0 || entry.chips.length > 0) && (
                <div
                  className="grid transition-[grid-template-rows,opacity] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"
                  style={{
                    gridTemplateRows: shown ? '1fr' : '0fr',
                    opacity: shown ? 1 : 0,
                    transitionDelay: '280ms',
                  }}
                >
                  <div className="overflow-hidden">
                    {entry.bullets.length > 0 && (
                      <ul className="mt-5 space-y-2.5">
                        {entry.bullets.map((bullet) => (
                          <li
                            key={bullet}
                            className="flex gap-3 text-[0.84rem] leading-relaxed text-ink-soft"
                          >
                            <span aria-hidden className="text-ink-faint">
                              —
                            </span>
                            {bullet}
                          </li>
                        ))}
                      </ul>
                    )}

                    {entry.chips.length > 0 && (
                      <div className="mt-6 flex flex-wrap gap-2">
                        {entry.chips.map((chip) => (
                          <span
                            key={chip}
                            className="rounded-full bg-paper-sunk px-3 py-1 text-[0.7rem] text-ink-soft"
                          >
                            {chip}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </article>
            )}
          </TimelineRow>
        ))}

        <TimelineRow
          marker="Next"
          markerFace="display-em"
          side={entries.length % 2 === 0 ? 'left' : 'right'}
          isLast
        >
          <article className="rounded-[1.1rem] border border-rule p-7">
            <p className="eyebrow">{experienceOutro.kicker}</p>
            <h3 className="display mt-3 text-[clamp(1.3rem,2.6vw,1.9rem)]">
              {experienceOutro.heading}
            </h3>
            <p className="mt-3 text-[0.86rem] leading-relaxed text-ink-soft">
              {experienceOutro.body}
            </p>
            <a className="pill mt-6" href="#contact">
              {portfolioConfig.contact.ctaLabel}{' '}
              <ArrowRight size={15} strokeWidth={1.75} />
            </a>
          </article>
        </TimelineRow>
      </div>
    </section>
  );
}
