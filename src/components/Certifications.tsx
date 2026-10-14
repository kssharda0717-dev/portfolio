import { portfolioConfig } from '@config';
import { SectionHeading } from './SectionHeading';

const { certifications } = portfolioConfig;

export function Certifications() {
  return (
    <section id="certifications" className="shell py-[var(--section-y)]">
      <SectionHeading
        index="04"
        eyebrow="Certifications"
        lead="Always"
        emphasis="learning."
        blurb={`${certifications.length} credentials across Oracle Cloud, Microsoft and platform engineering.`}
      />

      <ol className="border-t border-rule">
        {certifications.map((certification, index) => (
          <li key={certification.title} className="border-b border-rule">
            <div className="group flex items-center gap-6 px-2 py-6 transition-all duration-300 hover:bg-ink hover:px-6 hover:text-paper">
              <span className="section-number shrink-0 group-hover:text-paper/55">
                {String(index + 1).padStart(2, '0')}
              </span>
              <span className="flex-1 text-[clamp(1rem,2vw,1.4rem)] leading-snug">
                {certification.title}
              </span>
              <span className="hidden shrink-0 text-[0.8rem] text-ink-faint group-hover:text-paper/70 sm:block">
                {certification.issuer}
              </span>
              <span className="shrink-0 tabular-nums text-[0.8rem] text-ink-faint group-hover:text-paper/70">
                {certification.issueYear}
              </span>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
