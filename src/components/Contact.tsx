import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { portfolioConfig } from '@config';

const { contact, personalInfo } = portfolioConfig;
const { socialLinks } = personalInfo;

export function Contact() {
  return (
    <footer
      id="contact"
      className="grain relative border-t border-rule py-[var(--section-y)]"
    >
      <div className="shell">
        <div className="flex items-baseline gap-5">
          <span className="section-number">07</span>
          <span className="eyebrow">Contact</span>
          <hr className="hairline mt-0 flex-1 self-center" />
        </div>

        <h2 className="display mt-10 max-w-4xl text-[clamp(2.4rem,7vw,5.5rem)]">
          {contact.heading}{' '}
          <em className="display-em">{contact.headingEmphasis}</em>
        </h2>
        <p className="mt-7 max-w-xl text-[0.98rem] leading-relaxed text-ink-soft">
          {contact.body}
        </p>

        <a
          className="pill mt-10 px-7 py-4 text-[0.95rem]"
          href={`mailto:${socialLinks.email}`}
        >
          {contact.ctaLabel} <ArrowRight size={16} strokeWidth={1.75} />
        </a>

        <div className="mt-20 flex flex-wrap items-center justify-between gap-6 border-t border-rule pt-8">
          <p className="text-[0.78rem] text-ink-faint">
            © {new Date().getFullYear()} {personalInfo.fullName} · {personalInfo.location}
          </p>
          <ul className="flex flex-wrap gap-6 text-[0.8rem]">
            {[
              { label: 'GitHub', href: socialLinks.github },
              { label: 'LinkedIn', href: socialLinks.linkedin },
              { label: 'Email', href: `mailto:${socialLinks.email}` },
              { label: 'Résumé', href: socialLinks.resumePdfUrl },
            ].map((link) => (
              <li key={link.label}>
                <a
                  className="inline-flex items-center gap-1 text-ink-soft transition-colors hover:text-ink"
                  href={link.href}
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  {link.label}
                  <ArrowUpRight size={13} strokeWidth={1.75} aria-hidden />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
