import { ArrowDown, ArrowUpRight } from 'lucide-react';
import { portfolioConfig } from '@config';
import { SectionHeading } from './SectionHeading';
import { Reveal } from './Reveal';
import { IdCard } from './IdCard';

const { personalInfo } = portfolioConfig;
const { socialLinks } = personalInfo;

export function About() {
  return (
    <section id="about" className="shell py-[var(--section-y)]">
      <SectionHeading
        index="01"
        eyebrow="About"
        lead="Hi, I'm"
        emphasis={`${personalInfo.firstName}.`}
      />

      <div className="grid gap-14 lg:grid-cols-[1.1fr_0.9fr_0.85fr] lg:gap-10">
        {/* Left — bio + actions */}
        <Reveal>
          <p className="max-w-prose text-[1.02rem] leading-[1.75] text-ink-soft">
            {personalInfo.bioParagraph}
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <a className="pill" href={socialLinks.resumePdfUrl} download>
              Résumé <ArrowDown size={15} strokeWidth={1.75} />
            </a>
            <a
              className="pill"
              href={socialLinks.github}
              target="_blank"
              rel="noreferrer noopener"
            >
              GitHub <ArrowUpRight size={15} strokeWidth={1.75} />
            </a>
            <a
              className="pill"
              href={socialLinks.linkedin}
              target="_blank"
              rel="noreferrer noopener"
            >
              LinkedIn <ArrowUpRight size={15} strokeWidth={1.75} />
            </a>
          </div>
        </Reveal>

        {/* Centre — ID card on a lanyard, flips to the badge side */}
        <Reveal delay={0.08} className="flex justify-center">
          <IdCard />
        </Reveal>

        {/* Right — spec table + pull quote */}
        <Reveal delay={0.16}>
          <p className="eyebrow">Outer facts</p>
          <dl className="mt-5">
            {personalInfo.outerFacts.map((fact) => (
              <div
                key={fact.label}
                className="flex items-baseline justify-between gap-4 border-t border-rule py-3.5 text-[0.85rem] last:border-b"
              >
                <dt className="text-ink-faint">{fact.label}</dt>
                <dd className="text-right">{fact.value}</dd>
              </div>
            ))}
          </dl>
          <p className="script mt-9 text-[1.55rem] leading-tight text-ink-soft">
            {personalInfo.pullQuote}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
