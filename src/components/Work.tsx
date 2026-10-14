'use client';

import { useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { portfolioConfig } from '@config';
import type { ProjectItem } from '@config';
import { SectionHeading } from './SectionHeading';

const { projects } = portfolioConfig;

function ProjectBody({
  project,
  showTitle = true,
}: {
  project: ProjectItem;
  showTitle?: boolean;
}) {
  return (
    <div className="flex h-full flex-col">
      <p className="eyebrow">{project.eyebrow}</p>
      {showTitle && (
        <h3 className="display mt-3 text-[clamp(1.6rem,3vw,2.6rem)]">
          {project.title}
        </h3>
      )}
      <p className="mt-5 max-w-2xl text-[0.95rem] leading-relaxed text-ink-soft">
        {project.shortDescription}
      </p>

      <ul className="mt-7 grid gap-x-10 gap-y-3 sm:grid-cols-2">
        {project.featureHighlights.map((highlight) => (
          <li
            key={highlight}
            className="border-t border-rule pt-3 text-[0.83rem] leading-snug text-ink-soft"
          >
            {highlight}
          </li>
        ))}
      </ul>

      {project.statValue && (
        <p className="mt-8">
          <span className="display text-[clamp(2.2rem,4vw,3.4rem)]">
            {project.statValue}
          </span>
          <span className="eyebrow ml-3">{project.statLabel}</span>
        </p>
      )}

      <div className="mt-8 flex flex-wrap gap-2">
        {project.techStackTags.map((tag) => (
          <span
            key={tag}
            className="rounded-full border border-rule px-3 py-1 text-[0.7rem] tracking-wide text-ink-soft"
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="mt-auto pt-9">
        {project.githubUrl || project.liveDemoUrl ? (
          <div className="flex flex-wrap gap-3">
            {project.liveDemoUrl && (
              <a
                className="pill"
                href={project.liveDemoUrl}
                target="_blank"
                rel="noreferrer noopener"
              >
                Open live <ArrowUpRight size={15} strokeWidth={1.75} />
              </a>
            )}
            {project.githubUrl && (
              <a
                className="pill"
                href={project.githubUrl}
                target="_blank"
                rel="noreferrer noopener"
              >
                View on GitHub <ArrowUpRight size={15} strokeWidth={1.75} />
              </a>
            )}
          </div>
        ) : (
          <p className="max-w-md border-l-2 border-accent pl-4 text-[0.8rem] leading-relaxed text-ink-faint">
            {project.availabilityNote}
          </p>
        )}
      </div>
    </div>
  );
}

export function Work() {
  /*
    Nothing is open until the pointer asks. `null` rather than the first id so
    the section reads as a row of closed spines, which is what makes the
    hover-to-open gesture discoverable in the first place.
  */
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <section id="work" className="shell py-[var(--section-y)]">
      <SectionHeading
        index="03"
        eyebrow="Work"
        lead="Things I've"
        emphasis="built."
        blurb={`${projects.length} products across agentic AI, financial reconciliation, analytics and lead automation. Hover a panel to open it.`}
      />

      {/* Desktop — horizontal accordion, opened by hover or keyboard focus */}
      <div className="hidden h-[38rem] gap-2 lg:flex" onMouseLeave={() => setOpenId(null)}>
        {projects.map((project) => {
          const isOpen = project.id === openId;
          return (
            <div
              key={project.id}
              onMouseEnter={() => setOpenId(project.id)}
              className={`relative overflow-hidden border border-rule transition-[flex-grow] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                isOpen ? 'grow-[14] bg-paper-raised' : 'grow bg-paper'
              }`}
              style={{ flexBasis: 0, minWidth: isOpen ? 'auto' : '3.75rem' }}
            >
              {isOpen ? (
                <div className="h-full overflow-y-auto p-9">
                  <ProjectBody project={project} />
                </div>
              ) : (
                <button
                  type="button"
                  onFocus={() => setOpenId(project.id)}
                  onClick={() => setOpenId(project.id)}
                  aria-expanded={false}
                  className="flex h-full w-full items-center justify-center hover:bg-paper-sunk"
                >
                  <span className="whitespace-nowrap text-[0.8rem] tracking-[0.14em] [writing-mode:vertical-rl] [text-orientation:mixed]">
                    {project.title}
                  </span>
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile / tablet — vertical accordion */}
      <div className="lg:hidden">
        {projects.map((project) => {
          const isOpen = project.id === openId;
          return (
            <div key={project.id} className="border-t border-rule last:border-b">
              <button
                type="button"
                onClick={() => setOpenId(isOpen ? null : project.id)}
                aria-expanded={isOpen}
                className="flex w-full items-center justify-between gap-4 py-5 text-left"
              >
                <span className="text-[1.05rem]">{project.title}</span>
                <span
                  aria-hidden
                  className={`text-ink-faint transition-transform duration-300 ${
                    isOpen ? 'rotate-45' : ''
                  }`}
                >
                  +
                </span>
              </button>
              {isOpen && (
                <div className="pb-10">
                  <ProjectBody project={project} showTitle={false} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
