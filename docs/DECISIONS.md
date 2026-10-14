# Decision log

Architecture decision records, newest last. Each entry states the decision, why
it was taken, and what was rejected — so a future reader can tell a considered
trade-off from an accident.

**Status key:** ✅ active · ⚠️ revisit · ❌ superseded

---

## D-001 — The reference design beats the original PRD on visuals ✅

**Context.** The project began from a written PRD specifying a dark,
glassmorphic theme. The actual target was a video capture of Lohitha
Damisetti's portfolio — warm cream paper, editorial, print-magazine.

**Decision.** Where the two conflict, **the reference wins on visuals; the PRD
wins on data model and quality bars.**

**Consequences.** Light paper identity; accordion instead of a project grid;
numbered cert list instead of cards; metrics merged into achievements; added
Experience, Contact, scroll-spy nav and section numbering, which the PRD omitted
entirely.

---

## D-002 — Config-first, no CMS ✅

**Decision.** All content lives in one typed file, `portfolio.config.ts`,
imported as `@config`. No CMS, no database, no API.

**Why.** A single maintainer updating a few times a year. A CMS would add
hosting, auth, a schema to migrate and a runtime dependency, to save editing a
TypeScript object. Types give validation for free: a malformed entry fails
`tsc` instead of breaking the page.

**Rejected.** Sanity/Contentful (operational weight), MDX files (fragmentation,
no cross-entity typing), a JSON file (loses the type contract).

**Consequences.** Adding a certification is one line. Content changes need a
rebuild. Two remaining seams where config-only leaks —
see [ARCHITECTURE](ARCHITECTURE.md) §4.

**Amended by D-017:** the *storage format* of the growing collections moved to
`content/*.json`. The types, and this decision's reasoning, are unchanged.

---

## D-003 — Statically rendered, single route ✅

**Decision.** One page, all sections as anchors, rendered at build time. Empty
`next.config.ts`. No route handlers, server actions or middleware.

**Why.** Nothing on the site is dynamic or personalised. Static is the fastest,
cheapest and most attack-resistant option ([SECURITY](SECURITY.md) §2).

---

## D-004 — Remove `framer-motion` ❌→✅

**Context.** Installed for scroll reveals. v14 **intermittently stranded
elements at `opacity: 0` permanently** — with `whileInView` *and* with plain
mount `initial`/`animate`. Non-deterministic, so not reliably debuggable.

**Decision.** Uninstalled. Replaced with CSS keyframes (`.rise-in`,
`animation-fill-mode: both`) and a native IntersectionObserver (`Reveal`).

**Consequences.** First-load JS **165 kB → 124 kB**. Reveals now degrade
gracefully without JS, which the library version never did.

**Binding:** do not reintroduce it ([RULES](RULES.md) R-9).

---

## D-005 — Hero avatar is a matted video, not an alpha codec ✅

**Decision.** Ship one H.264 MP4 with the subject matted onto **pure white**,
and drop the backdrop in CSS with `mix-blend-mode: multiply`.

**Why.** Transparent video needs **two encodes** — VP9 WebM for Chrome/Firefox
*and* HEVC-with-alpha MP4 for Safari; HLS carries no alpha at all. Against a
cream page, multiply blending is visually equivalent at half the bytes and one
encode. It also lets the ghosted wordmark read *through* the figure.

**Consequences.** The blend must live on the **positioned wrapper** so it
composites against the section rather than an isolated group. The matte must
stay pure white — any tint will show.

---

## D-006 — The voiceover is a separate `<audio>` element ✅

**Decision.** Never mux the spoken introduction into the hero video.

**Why.** The voiceover is **12.06s**; the loop is **7.000s**. Muxed, the line
would be cut off and restarted mid-sentence on every cycle. Decoupled, the loop
stays seamless and the introduction plays through exactly once.

---

## D-007 — Scroll is the pause control; no pause button ✅

**Context.** The hero originally had both a pause button and a sound button,
plus a visible caption.

**Decision.** Remove the pause button and the visible transcript. An
IntersectionObserver stops both tracks when the figure leaves the viewport and
resumes on return.

**Why.** Satisfies WCAG 2.2.2 (pausable moving content) without a chrome
element, and matches the expectation that scrolling away silences a page.
The transcript stays as `sr-only` for WCAG 1.2.1.

**Consequences.** `soundOn` is the user's **intent** and must survive a
scroll-driven pause — hence the mirror ref, and why it is never derived from
the element's `pause` event.

---

## D-008 — The loop resumes, the introduction rewinds ✅

**Decision.** On leaving the hero, the video pauses in place but the audio
pauses **and seeks to 0**.

**Why.** One frame of a 7s loop is not a meaningful position, but a greeting
has to start at "hi". Rewinding on the way *out* rather than seeking on the way
*in* also avoids the `AbortError` that a seek immediately before `play()`
raises.

**Consequences.** `preload="auto"` on the audio — restarting from zero under
`preload="none"` was an audible stall.

---

## D-009 — Observer threshold 0, not a band ✅

**Decision.** The hero observer takes **no options**.

**Why.** Default threshold 0 is usefully hysteretic — present at one visible
pixel, absent only at zero. A band like `threshold: 0.15` leaves a dead zone
you can sit inside, which made returning to the hero feel laggy.

---

## D-010 — `simple-icons` for brand logos, with a partial map ✅

**Context.** `lucide-react` v1.52 has **no brand icons** at all.

**Decision.** Add `simple-icons` v16 (CC0, tree-shakeable named exports
carrying `.path` and `.hex`) with a hand-written `MARKS` map in `BrandMark.tsx`.

**Why a map rather than dynamic lookup.** It keeps the import list explicit
(so tree-shaking works), and allows per-icon exceptions.

**Known gap.** Simple Icons has **no Oracle and no OpenAI** set — both pulled
over trademark claims — and the enterprise/conceptual entries (Fast Formula,
HCM Data Loader, RAG, Evals) have no mark at all. **26 of 48** elements get a
logo; the rest fall back to their monogram, which is the periodic-table conceit
anyway. Accepted rather than hand-drawing trademarked paths.

**Guard.** A WCAG relative-luminance test (`> 0.55 → currentColor`) stops brand
yellows washing out on cream — JavaScript `#F7DF1E` (0.73), DuckDB `#FFF000`
(0.84), Swagger `#85EA2D` (0.64).

---

## D-011 — Work accordion opens on hover, nothing open by default ✅

**Context.** It previously required a click and pre-opened the first panel.

**Decision.** `openId` starts at `null`; `onMouseEnter` per panel,
`onMouseLeave` on the row.

**Why.** A row of closed spines is what makes the hover gesture discoverable.
Collapsed spines keep `onFocus` and `onClick` for keyboard and touch parity.

---

## D-012 — Timeline reveal band tightened to the middle of the viewport ✅

**Context.** `rootMargin: '0px 0px -18% 0px'` fired as soon as a card's top
edge crossed 82% of the viewport, so cards unfolded while still mostly below
the fold and were already open when you arrived. The section read as a static
wall of text.

**Decision.** `rootMargin: '-10% 0px -42% 0px'` — a row must reach the middle
band before it opens.

**Measured.** 2019 card at viewport top 765 (85% down) stays collapsed
(`0px`); at top 495 (55% down) it opens (`63.67px`) while the 2020 row below
stays shut.

---

## D-013 — Timeline detail unfolds via a render prop ✅

**Decision.** `TimelineRow`'s `children` accept
`ReactNode | ((shown: boolean) => ReactNode)`, so a card can unfold its detail
in step with the rail off the row's **one** observer.

**Why.** Cheaper than every card running a second observer, and keeps the
unfold synchronised with the rail draw.

**Cost.** A caller using the function form **must** be `'use client'` — React
cannot serialise a function child across the server boundary. This is the only
reason `Experience.tsx` is a client component.

**Rejected.** A `detail?: ReactNode` prop — it would render the detail
*outside* the `<article>`, losing the card background.

---

## D-014 — Height animated with `grid-template-rows: 0fr → 1fr` ✅

**Decision.** Animate disclosure height with a grid parent going `0fr → 1fr`
and an inner `overflow: hidden`.

**Why.** Animates to the content's own height **without measuring it** — no
`scrollHeight` read, no resize observer, no layout thrash.

---

## D-015 — ID card rests on the badge face ✅

**Decision.** The badge/photo side is the resting face; the "What I am"
checklist carries `rotateY(180deg)` and appears on hover.

**Why.** The photo identifies him instantly; the checklist is the reward for
interacting. (Originally inverted — the section opened on the back of the card.)

**Note.** The resting face is whichever div has **no** rotate; DOM order is
irrelevant.

---

## D-016 — Accept the `eslint-config-next` advisories ⚠️

**Decision.** `npm audit` reports 5 advisories with no available fix, all
transitive under `eslint-config-next` — dev-only lint tooling that never ships
to the browser. `postcss` and `braces` are pinned via `overrides`.

**Why.** The alternative is forcing a major Next/ESLint upgrade for a risk that
does not exist in the deployed artifact.

**Revisit** on the next Next.js major. See [SECURITY](SECURITY.md) §4.

---

## D-017 — The growing collections move to `content/*.json` ✅

**Context.** D-002 put every piece of content in one typed TypeScript file.
That is right for a human editor and wrong for a program: editing TypeScript
means parsing and re-printing a program, so nothing but a person could ever
make a change.

**Decision.** Move the seven collections that actually change —
`techStack`, `projects`, `experience`, `education`, `certifications`,
`achievements`, and the role strings — into `content/*.json`.
`portfolio.config.ts` imports them and casts them to the existing interfaces.

**Why it does not weaken D-002.** The types still govern: the cast is checked
on the way in, so a malformed entry fails `tsc` exactly as before. The config
remains the single import every component reads. What changed is the *storage
format of the leaves*, not the architecture.

**Rejected.** Keeping everything in TypeScript and having the Action edit it
with the compiler API — possible, but it would rewrite formatting and comments
on every run, and a content bot that reflows source is a bot you stop trusting.

**Consequences.** Comments cannot live in the moved data, so anything that
needed explaining stayed behind in `portfolio.config.ts` (the periodic-table
note above `techStack`, the avatar rationale). The extraction was done
mechanically — `ts.transpileModule` then `require` — rather than by hand, so
there is no transcription risk.

---

## D-018 — No-code updates via GitHub Issue Forms, not a CMS ✅

**Context.** Kartik needs to add a certification or change his title without
opening an editor, from a phone, possibly a year from now having forgotten how
any of this works.

**Decision.** GitHub Issue Forms as the authoring surface; a workflow
(`content-update.yml`) parses the submitted issue, edits `content/*.json`,
gates on `tsc` + `eslint` + `next build`, commits to `main`, and lets the host
redeploy. The issue is closed with the commit sha. See
[CONTENT-PIPELINE](CONTENT-PIPELINE.md).

**Why.** It reuses infrastructure that already exists and is already
authenticated: a form renderer, an audit trail, a mobile app, notifications —
for zero hosting and zero runtime dependencies. A failed edit comments the
reason on the issue and pushes nothing, so production cannot be broken by a
bad submission.

**Rejected.**

- *A headless CMS* (Sanity, Contentful) — hosting, auth, a schema to migrate
  and a webhook, to save editing an object a few times a year. D-002's reasoning
  applies unchanged.
- *A chat/LLM front end that writes the JSON* — a model in the write path to
  production, for a problem that is four fixed shapes. The form is the schema.
- *Editing the files in the GitHub web UI* — works, but it is editing code, and
  a trailing comma at 11pm takes the site down.

**Consequences.** The workflow must refuse anything not opened by the repo
owner — an issue form is a public inbox ([SECURITY](SECURITY.md) §6). Latency
is a redeploy rather than a save, which is the right trade here. The Action also
assigns `techStack` grid coordinates, which closes the first of the three seams
in [ARCHITECTURE](ARCHITECTURE.md) §4.

---

## D-019 — The timeline slide direction is a CSS variable ✅

**Context.** `TimelineRow` alternated cards left and right, and expressed the
entrance as an inline `translateX` with a signed offset. Below `md` the rail
moves to the left edge, but the sign did not change — so the right-hand rows
entered from off-screen and gave **the whole document an 8px horizontal
scrollbar at 375px** ([TASKS](TASKS.md) T-1).

**Decision.** Split magnitude from direction. The component sets `--slide-dir`
inline; `transform` reads `calc(28px * var(--slide-dir))`; a media query on
`.timeline-slide` forces `-1` below `48rem`.

**Why not `overflow-x: hidden` on the section.** That hides the symptom and
turns the section into a scroll container, which quietly changes how anything
inside it behaves. The offset was simply wrong on mobile.

**Note.** The override needs `!important` — it is competing with an inline
declaration, which otherwise wins regardless of selector specificity.
