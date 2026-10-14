interface SectionHeadingProps {
  /** `01`–`08` print-style section number. */
  index: string;
  eyebrow: string;
  /** Grotesk first half of the headline. */
  lead: string;
  /** Italic-serif second half of the headline. */
  emphasis: string;
  blurb?: string;
}

export function SectionHeading({
  index,
  eyebrow,
  lead,
  emphasis,
  blurb,
}: SectionHeadingProps) {
  return (
    <header className="mb-[clamp(2.5rem,5vw,4.5rem)]">
      <div className="flex items-baseline gap-5">
        <span className="section-number">{index}</span>
        <span className="eyebrow">{eyebrow}</span>
        <hr className="hairline mt-0 flex-1 self-center" />
      </div>
      <h2 className="display mt-7 text-[clamp(2.4rem,6.4vw,5.25rem)]">
        {lead} <em className="display-em">{emphasis}</em>
      </h2>
      {blurb && (
        <p className="mt-6 max-w-xl text-[0.98rem] leading-relaxed text-ink-soft">
          {blurb}
        </p>
      )}
    </header>
  );
}
