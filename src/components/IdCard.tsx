'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Check } from 'lucide-react';
import { portfolioConfig } from '@config';

const { personalInfo } = portfolioConfig;
const { idCard } = personalInfo;

/** Fixed bar widths — deterministic so server and client markup match. */
const BARCODE = [
  2, 1, 3, 1, 1, 2, 4, 1, 2, 1, 3, 2, 1, 1, 4, 2, 1, 3, 1, 2, 2, 1, 3, 1, 1, 4,
  1, 2, 3, 1, 2, 1, 1, 3, 2, 4, 1, 1, 2, 3,
];

export function IdCard() {
  const [flipped, setFlipped] = useState(false);

  return (
    <div className="flex w-full flex-col items-center">
      {/* Lanyard strap running down to the clip */}
      <div aria-hidden className="flex flex-col items-center">
        <div className="flex h-24 w-[1.35rem] items-center justify-center rounded-b-[2px] bg-ink">
          <span className="whitespace-nowrap text-[0.42rem] uppercase tracking-[0.3em] text-paper/70 [writing-mode:vertical-rl]">
            {idCard.lanyardText}
          </span>
        </div>
        {/* Crimp */}
        <div className="h-5 w-11 rounded-[3px] bg-paper-sunk shadow-[inset_0_-2px_0_rgba(20,27,51,0.12)]" />
        {/* Ring */}
        <div className="h-4 w-5 rounded-b-full border-x-2 border-b-2 border-rule" />
      </div>

      <div className="idcard-sway [perspective:1600px]">
        <button
          type="button"
          onClick={() => setFlipped((previous) => !previous)}
          onMouseEnter={() => setFlipped(true)}
          onMouseLeave={() => setFlipped(false)}
          aria-pressed={flipped}
          aria-label={
            flipped
              ? 'Showing the "What I am" side of the card. Activate to show the ID side.'
              : 'Showing the ID side of the card. Activate to show the "What I am" side.'
          }
          className="relative block h-[27rem] w-[18rem] text-left transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] [transform-style:preserve-3d]"
          style={{ transform: flipped ? 'rotateY(180deg)' : 'none' }}
        >
          {/* Back — what I am. Face-down at rest; the hover flip brings it up. */}
          <div className="absolute inset-0 overflow-hidden rounded-[1.1rem] bg-paper-raised px-6 pb-6 pt-8 shadow-[0_26px_60px_-28px_rgba(20,27,51,0.55)] [backface-visibility:hidden] [transform:rotateY(180deg)]">
            <span
              aria-hidden
              className="absolute left-1/2 top-3 h-1.5 w-16 -translate-x-1/2 rounded-full bg-paper-sunk"
            />
            <p className="display text-[1.15rem]">What I am</p>
            <ul className="mt-5 space-y-3.5">
              {personalInfo.whatIAm.map((item) => (
                <li key={item.title} className="flex gap-2.5">
                  <span
                    aria-hidden
                    className="mt-0.5 flex h-[1.05rem] w-[1.05rem] shrink-0 items-center justify-center rounded-full bg-ink"
                  >
                    <Check size={11} strokeWidth={3} className="text-paper" />
                  </span>
                  <span>
                    <span className="block text-[0.82rem] font-medium leading-snug">
                      {item.title}
                    </span>
                    <span className="mt-0.5 block text-[0.68rem] leading-snug text-ink-faint">
                      {item.detail}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
            <p className="script mt-5 text-[1.5rem] leading-none text-ink-soft">
              {personalInfo.firstName}
            </p>
            <p className="mt-2 font-mono text-[0.55rem] uppercase tracking-[0.14em] text-ink-faint">
              {personalInfo.socialLinks.email}
            </p>
          </div>

          {/* Front — the badge. This is the face the section opens on. */}
          <div className="absolute inset-0 overflow-hidden rounded-[1.1rem] bg-paper-raised shadow-[0_26px_60px_-28px_rgba(20,27,51,0.55)] [backface-visibility:hidden]">
            <div className="flex items-center gap-3 bg-ink px-5 py-3.5">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-paper/40 text-[0.6rem] tracking-[0.08em] text-paper">
                {idCard.monogram}
              </span>
              <span>
                <span className="block text-[0.74rem] font-medium uppercase tracking-[0.16em] text-paper">
                  {idCard.label}
                </span>
                <span className="block text-[0.6rem] text-paper/60">
                  {idCard.subLabel}
                </span>
              </span>
            </div>

            <div className="px-5 pb-5 pt-5">
              <div className="mx-auto w-[8.5rem] overflow-hidden rounded-[0.6rem] border border-rule">
                <Image
                  src={personalInfo.avatar.posterUrl}
                  alt=""
                  width={272}
                  height={340}
                  sizes="136px"
                  className="h-[10.5rem] w-full object-cover object-top"
                />
              </div>
              <p className="mt-4 text-center text-[0.86rem] font-medium uppercase tracking-[0.06em]">
                {personalInfo.fullName}
              </p>
              <p className="mt-0.5 text-center text-[0.7rem] text-ink-faint">
                {personalInfo.roleTitle}
              </p>

              <dl className="mt-5 flex items-end justify-between gap-3">
                {[
                  { label: 'ID No.', value: idCard.idNumber, align: 'text-left' },
                  { label: 'Dept', value: idCard.department, align: 'text-center' },
                  { label: 'Valid till', value: idCard.validTill, align: 'text-right' },
                ].map((cell) => (
                  <div key={cell.label} className={cell.align}>
                    <dt className="text-[0.5rem] uppercase tracking-[0.18em] text-ink-faint">
                      {cell.label}
                    </dt>
                    <dd className="mt-1 text-[0.72rem] tabular-nums">{cell.value}</dd>
                  </div>
                ))}
              </dl>

              <div aria-hidden className="mt-5 flex h-7 items-end gap-[1.5px]">
                {BARCODE.map((width, index) => (
                  <span
                    key={index}
                    style={{ width: `${width}px` }}
                    className={index % 2 === 0 ? 'h-full bg-ink' : 'h-full bg-transparent'}
                  />
                ))}
              </div>
            </div>
          </div>
        </button>
      </div>

      <p className="eyebrow mt-6 text-center text-[0.6rem]">
        Hover or tap to flip
      </p>
    </div>
  );
}
