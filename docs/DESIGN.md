# Design system

**Last updated:** 2026-10-07 · Source of truth: `src/app/globals.css`

The identity is **warm paper, deep navy ink, one violet accent** — a print
magazine, not a dashboard. Thin hairline rules, letter-spaced caps eyebrows,
numbered sections, generous white space.

---

## 1. Colour tokens

Defined in `:root` and re-exported to Tailwind through `@theme inline`, so
`bg-paper`, `text-ink-soft`, `border-rule` etc. all resolve to the same values.

| Token | Hex | Tailwind | Use |
|---|---|---|---|
| `--paper` | `#f3efe7` | `paper` | Page background |
| `--paper-raised` | `#faf7f1` | `paper-raised` | Cards, open accordion panel |
| `--paper-sunk` | `#e8e2d6` | `paper-sunk` | Chips, inset wells, barcode crimp |
| `--ink` | `#141b33` | `ink` | Headlines, body, filled badges |
| `--ink-soft` | `#3d4663` | `ink-soft` | Secondary prose, bullets |
| `--ink-faint` | `#636980` | `ink-faint` | Eyebrows, labels, captions |
| `--rule` | `#c9c2b4` | `rule` | Hairlines, borders |
| `--accent` | `#5b43d6` | `accent` | Active nav pill, focus ring |
| `--accent-soft` | `#ece8fb` | `accent-soft` | Accent wash |

> **`--ink-faint` is tuned to 4.68:1 on paper.** Eyebrows and table labels are
> 11px and must clear WCAG AA. **Do not lighten it.**

There is no dark mode and none is planned ([PRD](PRD.md) §4).

## 2. Typography

Three families, loaded via `next/font/google` with `display: 'swap'`:

| Family | Variable | Role |
|---|---|---|
| **Inter Tight** | `--font-grotesk` | Body + first half of every headline |
| **Instrument Serif** *(italic)* | `--font-serif-display` | Second half of every headline |
| **Caveat** | `--font-script` | Signature on the ID card, pull quote |

### The headline convention

**Every** section headline is grotesk, then italic serif:

```tsx
<h2 className="display">
  Education &amp; <em className="display-em">experience.</em>
</h2>
```

Rendered: *"The periodic table **of my stack.**"*, *"Things I've **built.**"*,
*"Always **learning.**"*, *"Proud **moments.**"*, *"Education & **experience.**"*

Contact follows it too, via `contact.heading` + `contact.headingEmphasis`.
**If you add a section, it uses this convention.**

### Typographic primitives

| Class | Spec |
|---|---|
| `.display` | grotesk 500, `letter-spacing: -0.038em`, `line-height: 0.95` |
| `.display-em` | serif italic 400, `letter-spacing: -0.02em` |
| `.script` | Caveat 400 |
| `.eyebrow` | 11px / 500 / `0.22em` tracking / uppercase / `--ink-faint` |
| `.section-number` | 11px, tabular-nums, `0.18em` tracking |

## 3. Layout

| Token | Value |
|---|---|
| `--shell-x` | `clamp(1.25rem, 5vw, 5.5rem)` |
| `--section-y` | `clamp(5rem, 11vw, 9.5rem)` |

`.shell` is the page gutter: `width: 100%` + `padding-inline: var(--shell-x)` +
`margin-inline: auto` + `max-width: 96rem`.

> `.shell` **needs `width: 100%`.** Without it, `margin-inline: auto` on a flex
> item shrink-to-fits and centres the row — this silently broke the hero top bar.

Breakpoints are stock Tailwind. The two that matter: `md` (ID card / nav / hero
avatar reposition) and `lg` (Work switches from stacked disclosure to horizontal
accordion).

## 4. Controls

`.pill` — the universal button: 1px ink border, fully rounded, transparent
fill, inverting to ink-on-paper on hover and when `aria-pressed="true"`.

> `.pill` is defined **after** `@import "tailwindcss"`, so it beats `bg-ink`
> utilities. Style its active state with `.pill[aria-pressed='true']`, **not**
> Tailwind classes — they will lose.

Focus ring is global:
`:where(a, button, [tabindex]):focus-visible { outline: 2px solid var(--accent); outline-offset: 3px; }`

## 5. Motion

All motion is **CSS or native IntersectionObserver**. No animation library —
see [DECISIONS](DECISIONS.md) D-004.

| Name | What |
|---|---|
| `.rise-in` | Hero entrance keyframe, `animation-fill-mode: both` so content always settles visible |
| `.idcard-sway` | Slow lanyard swing; pauses on `:hover` / `:focus-within` |
| `.grain` | Faint fibre texture over the paper (`::after` overlay) |
| `Reveal` | Fade-up on scroll, `static → hidden → shown` |
| `TimelineRow` | Rail draw (`scaleY`) + card slide from its own side + detail unfold |

> The timeline's slide **direction** is a `--slide-dir` custom property, not a
> signed inline offset, so a media query can force every row to enter from the
> left below `md` — a rightward entrance there overhangs the viewport
> ([DECISIONS](DECISIONS.md) D-019). The override needs `!important`: an inline
> declaration beats a stylesheet rule at any specificity.

**Easing house curve:** `cubic-bezier(0.22, 1, 0.36, 1)` (expo-out). Durations
500–700ms for structural motion, ~280ms for colour.

### The unfold technique

Timeline detail animates to its natural height without measuring it:
`grid-template-rows: 0fr → 1fr` on a grid parent, with the child owning
`overflow: hidden`.

### Reduced motion

`@media (prefers-reduced-motion: reduce)` disables transitions and keyframes
globally; `HeroAvatar` additionally pauses the video loop and `TimelineRow`
carries `motion-reduce:transition-none`.

## 6. Section-specific rules

**Hero** — ghosted wordmark behind a matted video composited with
`mix-blend-mode: multiply` on the *positioned wrapper* (so it blends against
the section, not an isolated group). On mobile the figure sits *above* the
headline; from `md` it drops to the baseline and the headline overlaps it.

**Pill nav** — centred and auto-width from `md`; below it the row is pinned to
the page gutters and **scrolls horizontally**, with the scrollbar hidden
(`.no-scrollbar`) so it does not sit on the pills. Tap targets are `min-h-11`
(44px), and the active pill is scrolled to the centre as the scroll-spy moves —
written against the list's own `scrollLeft`, since `scrollIntoView` would also
move the document.

**Periodic table** — 10 columns, **gaps are deliberate**: they make it read as
a periodic table rather than a word cloud. Filtering **dims** non-matches to
~15% opacity — the layout must **never reflow**. Hover shows the brand logo in
the detail panel beside the category eyebrow.

**Brand logos** (`BrandMark`) — a WCAG relative-luminance guard
(`> 0.55 → currentColor`) stops brand yellows washing out on cream:
JavaScript `#F7DF1E` (0.73), DuckDB `#FFF000` (0.84), Swagger `#85EA2D` (0.64).
The map is deliberately partial — 26 of 48 elements have a mark; the rest fall
back to their monogram, which is the periodic-table conceit anyway.

**Work accordion** — desktop row is `h-[38rem]` (the tallest project body is
~606px). Opens on hover with `openId` starting at `null`, so it reads as a row
of closed spines. Collapsed spines keep `onFocus` / `onClick` for keyboard and
touch.

**ID card** — `[transform-style: preserve-3d]` + `[backface-visibility: hidden]`,
parent carries `[perspective: 1600px]`. The **resting face is whichever div has
no rotate** — DOM order is irrelevant. Currently the badge/photo side rests and
"What I am" carries `rotateY(180deg)`.
Barcode bar widths are a **fixed array** — never randomise, it breaks hydration.

## 7. Accessibility baseline

- WCAG 2.1 **AA** contrast throughout, including 11px text.
- Skip link to `#main` as the first focusable element.
- Every hover affordance has a click/focus equivalent.
- `aria-pressed` on toggles; icons state **what is true now**, not what the
  click will do (the sound button shows a speaker while audio plays).
- Voiceover ships a verbatim `sr-only` transcript (WCAG 1.2.1).
- Scroll acts as the pause control for the avatar, satisfying WCAG 2.2.2
  without a chrome button.
- Decorative media is `aria-hidden`; the avatar carries a descriptive label.
