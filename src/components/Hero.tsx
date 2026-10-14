import Image from 'next/image';
import { portfolioConfig } from '@config';
import { HeroAvatar } from './HeroAvatar';

const { personalInfo } = portfolioConfig;

const roleWords = personalInfo.roleTitle.split(' ');
const roleLead = roleWords.slice(0, -1).join(' ');
const roleTail = roleWords[roleWords.length - 1];

export function Hero() {
  return (
    <section
      id="hero"
      className="grain relative flex min-h-[100svh] flex-col overflow-hidden"
    >
      {/* Giant ghosted wordmark */}
      <span
        aria-hidden
        className="display pointer-events-none absolute left-1/2 top-[38%] w-full -translate-x-1/2 -translate-y-1/2 select-none text-center text-[22vw] leading-none text-ink/[0.07]"
      >
        {personalInfo.wordmark}
      </span>

      <div className="shell relative z-20 flex items-start justify-between pt-8">
        <span className="eyebrow">{personalInfo.fullName}</span>
      </div>

      {/* The figure, anchored to the bottom, overlapping the wordmark */}
      {personalInfo.avatar.videoUrl ? (
        <HeroAvatar />
      ) : (
        <div
          className="rise-in pointer-events-none absolute bottom-0 right-0 z-10 h-[52vh] w-auto
            md:left-1/2 md:right-auto md:h-[72vh] md:-translate-x-1/2"
        >
          <Image
            src={personalInfo.avatar.cutoutUrl}
            alt={`${personalInfo.fullName}, ${personalInfo.roleTitle}`}
            width={768}
            height={1199}
            priority
            sizes="(max-width: 768px) 70vw, 40vw"
            className="h-full w-auto object-contain object-bottom
              [mask-image:linear-gradient(to_bottom,black_82%,transparent_100%)]"
          />
        </div>
      )}

      {/* The still bust runs behind the headline on mobile; the video does not. */}
      {!personalInfo.avatar.videoUrl && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 z-[15] h-[46%]
            bg-gradient-to-t from-paper via-paper/88 to-transparent md:hidden"
        />
      )}

      <div className="shell relative z-20 mt-auto pb-24 md:pb-28">
        <div className="rise-in max-w-[34rem] [animation-delay:150ms]">
          <h1 className="display text-[clamp(2.6rem,7vw,5.5rem)]">
            {roleLead} <em className="display-em">{roleTail}.</em>
          </h1>
          <p className="mt-5 text-[0.95rem] text-ink-soft">
            {personalInfo.heroSubline}
          </p>
        </div>
      </div>

      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 left-0 right-0 h-px bg-rule"
      />
    </section>
  );
}
