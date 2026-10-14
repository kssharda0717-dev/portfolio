'use client';

import { useMemo, useRef, useState } from 'react';
import { portfolioConfig, STACK_CATEGORIES } from '@config';
import type { StackCategory, StackElement } from '@config';
import { BrandMark } from './BrandMark';
import { SectionHeading } from './SectionHeading';

const { techStack } = portfolioConfig;

const GRID_COLUMNS = 10;

export function TechStack() {
  const [activeCategory, setActiveCategory] = useState<StackCategory | null>(null);
  const [focused, setFocused] = useState<StackElement | null>(null);
  const tileRefs = useRef(new Map<string, HTMLButtonElement>());

  const familyCount = useMemo(
    () => new Set(techStack.map((element) => element.category)).size,
    []
  );

  // Row/col lookup so the arrow keys walk the silhouette, skipping its gaps.
  const byPosition = useMemo(() => {
    const map = new Map<string, StackElement>();
    techStack.forEach((element) => map.set(`${element.row}:${element.col}`, element));
    return map;
  }, []);

  const moveFocus = (from: StackElement, rowStep: number, colStep: number) => {
    let { row, col } = from;
    for (let attempt = 0; attempt < GRID_COLUMNS; attempt += 1) {
      row += rowStep;
      col += colStep;
      const next = byPosition.get(`${row}:${col}`);
      if (next) {
        tileRefs.current.get(next.id)?.focus();
        setFocused(next);
        return;
      }
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent, element: StackElement) => {
    const steps: Record<string, [number, number]> = {
      ArrowUp: [-1, 0],
      ArrowDown: [1, 0],
      ArrowLeft: [0, -1],
      ArrowRight: [0, 1],
    };
    const step = steps[event.key];
    if (!step) return;
    event.preventDefault();
    moveFocus(element, step[0], step[1]);
  };

  const detail = focused;

  return (
    <section id="skills" className="shell py-[var(--section-y)]">
      <SectionHeading
        index="02"
        eyebrow="Stack"
        lead="The periodic table"
        emphasis="of my stack."
        blurb={`${techStack.length} elements in ${familyCount} families. Hover or focus a tile to read it, or pick a family to light it up.`}
      />

      {/* Family filters */}
      <div
        role="group"
        aria-label="Filter stack by family"
        className="mb-10 flex flex-wrap gap-2"
      >
        <button
          type="button"
          onClick={() => setActiveCategory(null)}
          aria-pressed={activeCategory === null}
          className="pill"
        >
          All
        </button>
        {STACK_CATEGORIES.map((category) => {
          const isActive = activeCategory === category.id;
          return (
            <button
              key={category.id}
              type="button"
              aria-pressed={isActive}
              onClick={() => setActiveCategory(isActive ? null : category.id)}
              className="pill"
            >
              {category.label}
            </button>
          );
        })}
      </div>

      <div className="grid gap-10 lg:grid-cols-[1fr_17rem] lg:items-start lg:gap-12">
        {/* The silhouette. Filtering only dims — the layout never reflows. */}
        <div
          className="grid gap-[clamp(3px,0.5vw,7px)]"
          style={{ gridTemplateColumns: `repeat(${GRID_COLUMNS}, minmax(0, 1fr))` }}
          onMouseLeave={() => setFocused(null)}
        >
          {techStack.map((element, index) => {
            const isMatch = !activeCategory || element.category === activeCategory;
            return (
              <button
                key={element.id}
                type="button"
                ref={(node) => {
                  if (node) tileRefs.current.set(element.id, node);
                  else tileRefs.current.delete(element.id);
                }}
                style={{ gridRow: element.row, gridColumn: element.col }}
                onMouseEnter={() => setFocused(element)}
                onFocus={() => setFocused(element)}
                onKeyDown={(event) => handleKeyDown(event, element)}
                tabIndex={index === 0 ? 0 : -1}
                aria-label={`${element.name}, ${element.proficiency}, ${element.yearsExperience} years`}
                className={`group relative flex aspect-square flex-col justify-between overflow-hidden
                  border p-[clamp(3px,0.5vw,8px)] text-left transition-all duration-300
                  ${
                    isMatch
                      ? 'border-rule bg-paper-raised hover:border-ink hover:bg-ink hover:text-paper'
                      : 'pointer-events-none border-rule/40 bg-paper-raised/40 opacity-15'
                  }`}
              >
                <span className="text-[clamp(0.4rem,0.75vw,0.6rem)] tabular-nums text-ink-faint group-hover:text-paper/60">
                  {index + 1}
                </span>
                <span className="display text-[clamp(0.85rem,2.1vw,1.6rem)]">
                  {element.symbol}
                </span>
                <span className="truncate text-[clamp(0.36rem,0.7vw,0.56rem)] uppercase tracking-[0.08em] text-ink-faint group-hover:text-paper/70">
                  {element.name}
                </span>
              </button>
            );
          })}
        </div>

        {/* Detail panel */}
        <aside
          aria-live="polite"
          className="sticky top-24 min-h-[13rem] self-start border border-rule bg-paper-raised p-6"
        >
          {detail ? (
            <>
              <div className="flex items-start justify-between gap-4">
                <p className="eyebrow">
                  {STACK_CATEGORIES.find((c) => c.id === detail.category)?.label}
                </p>
                <BrandMark id={detail.id} />
              </div>
              <p className="display mt-3 text-4xl">{detail.symbol}</p>
              <p className="mt-1 text-sm">{detail.name}</p>
              <p className="mt-4 text-[0.82rem] leading-relaxed text-ink-soft">
                {detail.description}
              </p>
              <dl className="mt-5 border-t border-rule pt-4 text-[0.75rem]">
                <div className="flex justify-between py-1">
                  <dt className="text-ink-faint">Level</dt>
                  <dd>{detail.proficiency}</dd>
                </div>
                <div className="flex justify-between py-1">
                  <dt className="text-ink-faint">Years</dt>
                  <dd>{detail.yearsExperience}</dd>
                </div>
              </dl>
            </>
          ) : (
            <p className="text-[0.82rem] leading-relaxed text-ink-faint">
              Hover, tap or arrow-key through the table to inspect an element.
            </p>
          )}
        </aside>
      </div>
    </section>
  );
}
