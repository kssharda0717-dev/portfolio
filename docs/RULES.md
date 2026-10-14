# Engineering rules

**Last updated:** 2026-10-07

House rules for this repo. Most were learned by breaking something. If you are
an AI agent working here, treat these as binding; if you are Kartik in a year,
treat them as the reason past-you did something that looks odd.

---

## 1. Content

**R-1 — Zero personal data in components.** No name, number, URL, date or
prose may be hardcoded in `src/components/`. Everything comes from
`portfolioConfig` or props. This is the rule the whole architecture exists to
protect.

**R-2 — Edit `content/*.json` or `portfolio.config.ts`, not components,** for
any content change. If a content change *forces* a component edit, that is a
design smell — record it in [TASKS](TASKS.md).

**R-2a — A growing list belongs in `content/*.json`; everything else stays in
`portfolio.config.ts`.** The JSON is the part a script can edit safely, which is
the whole basis of [CONTENT-PIPELINE](CONTENT-PIPELINE.md). Comments do not
survive there, so anything that needs explaining stays in the config.

**R-2b — The content workflow must never run for a non-owner.** It writes to
`main`. If the author/label guard in `content-update.yml` is ever widened, read
[SECURITY](SECURITY.md) §6 first and widen it deliberately.

**R-3 — Never invent content.** Projects, metrics, dates and certifications are
real. If a number is not sourced from the résumé, `details.rtf` or Kartik
directly, do not write it down.

**R-4 — Keep types honest.** New content shapes get a field on
`PortfolioConfig`. Optional fields (`githubUrl?`, `availabilityNote?`) exist so
the renderer can branch — use them instead of empty strings.

## 2. Architecture

**R-5 — Server Components by default.** Add `'use client'` only when state,
refs or browser APIs require it.

**R-6 — A component that receives a function child must be a client
component.** React cannot serialise a render prop across the server boundary.
This is why `Experience.tsx` is `'use client'`.

**R-7 — Never gate content visibility on JS.** Reveal components start in a
`static` state with *no inline style* and only hide themselves **after** the
observer attaches. Inverting this makes the page blank without JS.

**R-8 — No new runtime dependencies without a recorded decision.** Five is the
budget. Anything new goes in [DECISIONS](DECISIONS.md) with what it replaced.

**R-9 — Never reintroduce `framer-motion`.** v14 intermittently strands
elements at `opacity: 0` forever, with both `whileInView` and plain mount
animation. It cost 41 kB and was removed. Use CSS keyframes or
IntersectionObserver.

## 3. Styling

**R-10 — Use the tokens.** No raw hex in components; use `bg-paper`,
`text-ink-soft`, `border-rule`. If you need a new colour, add a token.

**R-11 — Do not lighten `--ink-faint`.** It is tuned to 4.68:1 and carries 11px
text.

**R-12 — Every headline is grotesk + italic serif.** See [DESIGN](DESIGN.md) §2.

**R-13 — `.pill` active state uses `[aria-pressed='true']`,** not Tailwind
utilities — the layer order means utilities lose.

**R-13a — An inline style beats a stylesheet rule at any specificity.** If a
component sets a custom property inline and a media query has to overrule it,
the override needs `!important` — this is why `.timeline-slide` reads
`--slide-dir: -1 !important`. Prefer publishing the *variable* inline and
deciding the *value* in CSS where responsive behaviour is involved.

**R-14 — Filtering dims, never reflows.** The periodic table must not change
layout when a family is selected.

## 4. Accessibility

**R-15 — Every hover affordance needs a tap and keyboard equivalent.** The
design is hover-driven and the audience is not all on a mouse.

**R-16 — Icons state what is true now,** not what the click will do. A speaker
icon means *sound is playing*.

**R-17 — Audio needs a text alternative.** Any `voiceUrl` requires a verbatim
`voiceTranscript`, rendered `sr-only`.

**R-18 — Honour `prefers-reduced-motion`** in anything that moves.

**R-19 — Keep the deterministic-render rule.** No `Math.random()` or `Date.now()`
in render — it breaks hydration. The ID card barcode is a fixed array for
exactly this reason.

## 5. Media

**R-20 — Never mux the voiceover into the hero video.** 12.06s audio vs a
7.000s loop; muxing cuts the line off every cycle. Keep a separate `<audio>`.

**R-21 — The hero video must stay matted onto pure white.** The page drops the
backdrop with `mix-blend-mode: multiply`; an alpha codec would need two encodes
(VP9 WebM *and* HEVC-with-alpha MP4) because HLS does not carry alpha.

**R-22 — Audible autoplay is impossible.** Browsers block it unconditionally.
Sound is always user-initiated; only *resumption* after a user gesture is free.

**R-23 — Rewind the voiceover on the way out, not on the way in.** Setting
`currentTime` immediately before `play()` rejects with `AbortError`.

## 6. Workflow

**R-24 — Never run `next build` while `next dev` is running.** They share
`.next`; the build wipes dev artifacts and every route 500s. Recovery: stop
dev, `rm -rf .next`, restart.

**R-25 — Verify before claiming.** Run `npx tsc --noEmit` **and** `npm run lint`,
then check the change in the browser. Do not ask the user to verify manually.

**R-26 — Compile errors live in the server log,** not the browser console. And
they can be stale — cross-check with `tsc --noEmit` before believing the text.

**R-27 — Commit only when asked.** Never auto-commit, never push unprompted.

**R-28 — Scope discipline.** A bug fix does not get surrounding cleanup; a
feature does not get speculative configurability.

## 7. Testing in the preview browser

The preview tab is often **backgrounded** (`document.hidden === true`). In that
state:

- rAF and IntersectionObserver **do not fire**, and offscreen tiles are never
  rastered — below-the-fold screenshots come back blank cream. **Not a bug.**
- `preview_screenshot` forces one frame, which *does* commit pending reveals.
  Screenshot first, then read computed styles. Often needs **two** screenshots.
- `setTimeout` is **throttled hard** — a 2.5s timer measured 8.6s of wall clock.
  Slow media with `playbackRate` instead of trusting timers.
- Chrome **pauses `<video>` on its own**, so a paused video proves nothing
  about your observer.
- To photograph a section, isolate it and scroll to 0:
  ```js
  document.querySelectorAll('main > *').forEach(e => e.style.display = e.id === ID ? '' : 'none')
  ```
- `window.scrollTo(0, 0)` does nothing; use `document.scrollingElement.scrollTop = 0`.
- The console buffer **survives reloads**. Plant a marker, reload, trust only
  entries after it.
- React's synthetic `onMouseEnter` / `onMouseLeave` **cannot be driven by
  `dispatchEvent`**. Read fiber props to confirm wiring, and drive the real
  pointer with `preview_click`.
- **IntersectionObserver is edge-triggered.** Imperatively calling `play()` on
  an already-offscreen element fires no callback — always test through a real
  enter → exit sequence.
