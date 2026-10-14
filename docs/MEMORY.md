# Project memory

**Last updated:** 2026-10-07

Durable context for whoever picks this up next — future Kartik or an AI agent.
Read this first, then [RULES](RULES.md).

> **Read order for an agent:** MEMORY → RULES → ARCHITECTURE → whatever the
> task touches. [TASKS](TASKS.md) has the open work.

---

## 1. What this is

A personal portfolio for **Kartik Sharda** — six years in enterprise payroll
(PeopleSoft, Oracle Fusion HCM, Fortune 500 clients), now an AI & automation
engineer targeting UAE / GCC relocation.

The design is a deliberate re-interpretation of **Lohitha Damisetti's**
portfolio, reverse-engineered frame-by-frame from a 22s Instagram Reel. The
layout, motion and section structure follow it; **all content, the stack and
the colour system are Kartik's own.**

## 2. The one thing to understand

**`portfolio.config.ts` is the entire content layer.** Fully typed, imported as
`@config`. Components contain **zero** personal data. Change content there and
nowhere else.

The parts that actually change were moved out into **`content/*.json`** — the
six collections plus `role.json` — and imported back with a cast, so the types
still govern ([DECISIONS](DECISIONS.md) D-017). That is what makes an
unattended edit possible: a script can rewrite JSON, it cannot safely rewrite
TypeScript.

Two places where the config-only promise still leaks — the `BrandMark` logo map
and untyped `relatedProjectIds` ([TASKS](TASKS.md) T-5, T-8).

## 3. Current state

Feature-complete and verified; **not deployed, and almost entirely
uncommitted** (see [TASKS](TASKS.md) T-0 — `git log` has one
create-next-app commit).

`tsc --noEmit` clean · `eslint` clean · no console errors · 5 dev-only
`npm audit` findings, accepted.

**Content:** 48 stack elements · 7 projects · 5 experience · 1 education ·
12 certifications · 7 achievements.

**Updates without code:** four GitHub issue forms + an Action that edits
`content/*.json`, gates on `tsc`/`eslint`/`next build`, commits and closes the
issue. Written and dry-run; inert until the repo is pushed. See
[CONTENT-PIPELINE](CONTENT-PIPELINE.md).

Both mobile blockers are closed: no horizontal overflow at 375px, and the pill
nav now scrolls on a phone.

## 4. Environment

- macOS. `git`, `swift`, `brew`, `python3`, `node` available.
- **No `ffmpeg`. No `gh` CLI.** All media work is Swift + AVFoundation scripts.
- `textutil -convert txt -output out.txt in.rtf` converts RTF.
- `timeout` is not a macOS command.
- Dev server: `npm run dev` → `localhost:3000`.

### Source material (in `/Users/kartiksharda/Website/`, outside the app)

| File | What |
|---|---|
| `ScreenRecording_10-06-2026 18-12-42_1.mov` | The reference design reel |
| `Kartik_Sharda_dual_Resume.pdf` | Primary résumé |
| `Kartik's Profile.pdf` | LinkedIn export, longer narrative |
| `details.rtf` | 3,142 lines of deep project documentation |
| `IMG_5938.jpg` | Headshot — **chest-up only, not full-body** |

## 5. Media assets — do not regenerate casually

| File | Spec |
|---|---|
| `kartik-hero.mp4` | 7.000s loop, 514×1274, H.264 High@3.1, matted on **pure white** |
| `kartik-hero-poster.png` | First frame, matted identically |
| `kartik-intro.m4a` | 12.06s mono AAC voiceover |
| `kartik-cutout.png` | Background-removed bust — fallback if no video |
| `kartik-photo.jpg` | ID card portrait + `og:image` |

The loop is matted onto white so CSS `mix-blend-mode: multiply` can drop the
backdrop — **not** an alpha codec, which would need two encodes
([DECISIONS](DECISIONS.md) D-005).

Audio is **never muxed** into the video: 12.06s line vs a 7.000s loop
(D-006).

An attempt to extend the loop was abandoned — the only clean seam is at
t=7.500s and the extension measured RMSE 12.15 against a 4.61 baseline.

## 6. Scars — things that already cost a day

- **`framer-motion` v14 strands elements at `opacity: 0` forever.** Removed.
  Do not reintroduce ([RULES](RULES.md) R-9).
- **`next build` while `next dev` runs destroys the dev server** — shared
  `.next`. Recovery: stop, `rm -rf .next`, restart.
- **A function child cannot cross the server boundary** — this is the only
  reason `Experience.tsx` is `'use client'`.
- **The "hero video won't decode" panic was a false alarm** — `readyState 0`
  was read mid-load. On a settled page it reports `4`. The `ERR_ABORTED`
  network entries are Chrome discarding range requests it no longer needs.
- **"Duplicate React key" errors were stale console buffer** from before a
  reload, not real. Plant a marker before trusting the console.
- **`currentTime = 0` immediately before `play()` rejects with `AbortError`.**
  Rewind on the way out instead.
- **Simple Icons has no Oracle and no OpenAI** (trademark claims).
- **lucide-react v1.52 has no brand icons at all.**
- **`.shell` needs `width: 100%`** or flex shrink-to-fit centres the row.
- **SFSpeechRecognizer fails on TCC** in this environment — transcripts are
  written by hand.
- **`afconvert -f m4af -d aac -b 96000`** is the working audio encode line.
- **An inline style beats a stylesheet rule**, so a media query overriding a
  custom property that a component sets inline needs `!important`
  (`.timeline-slide`, [DECISIONS](DECISIONS.md) D-019).
- **`window.scrollTo(0, 0)` is asynchronous** here — `html` has
  `scroll-behavior: smooth`. Pass `{ behavior: 'instant' }` or the next
  measurement reads the old position.

The full preview-browser testing traps (backgrounded tab, throttled timers,
edge-triggered observers, undispatchable synthetic hover) are in
[RULES](RULES.md) §7.

## 7. User preferences

- **Wants things verified, not asserted.** Check it in the browser and show
  the evidence.
- **Terse output.** Lead with the answer; skip preamble.
- **Does not want over-engineering.** Fix what was asked.
- Corrections stick: the sound icon must show **what is true now**; the ID card
  opens on the **photo** face; timeline tiles must open **as you scroll**, not
  all at once.

## 8. Document map

| Doc | For |
|---|---|
| [PRD](PRD.md) | Why the site exists, audience, scope, success criteria |
| [ARCHITECTURE](ARCHITECTURE.md) | Stack, layout, data flow, server/client boundary |
| [DESIGN](DESIGN.md) | Tokens, type, motion, section rules, a11y baseline |
| [RULES](RULES.md) | Binding engineering conventions + testing traps |
| [DECISIONS](DECISIONS.md) | ADR log — what was chosen and what was rejected |
| [TASKS](TASKS.md) | Open work, prioritised |
| [SECURITY](SECURITY.md) | Threat model, dependency posture, headers, the pipeline guard |
| [CONTENT-PIPELINE](CONTENT-PIPELINE.md) | Updating the site without opening an editor |
| [README](../README.md) | Quick start + copy-paste content recipes |
