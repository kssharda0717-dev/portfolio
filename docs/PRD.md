# PRD — Kartik Sharda Portfolio

**Status:** shipped, pre-deploy · **Last updated:** 2026-10-07 · **Owner:** Kartik Sharda

---

## 1. Problem

Kartik is moving from six years inside enterprise payroll (PeopleSoft, Oracle
Fusion HCM, Fortune 500 clients) into AI and automation engineering, targeting
UAE / GCC relocation. A CV says what he was hired as. It does not demonstrate
that he *ships* — that he has built seven products, that non-technical
operators run them daily, and that he knows when **not** to use a model.

The portfolio exists to close that gap in the ninety seconds a recruiter or
hiring manager will give it.

## 2. Audience

| Who | What they need in <60s | Where the site answers it |
|---|---|---|
| **Recruiter / HR** (non-technical) | Is he real, certified, relocatable? | Hero, Outer Facts table, Certifications |
| **Hiring manager / tech lead** | Can he build, and what depth? | Work accordion, periodic table, Experience |
| **Founder / FDE hiring** | Has he solved the ugly back-office problem before? | Work briefs, Achievements metrics |

Primary device is **desktop** (how recruiters review), but mobile must be fully
usable — see §6.

## 3. Goals

- **G1 — Credibility in one screen.** Name, role, certification status and
  location legible before any scroll.
- **G2 — Proof over claims.** Every project states what it *does* and links to
  source where source exists; every metric is a real number from real work.
- **G3 — Memorable, not templated.** Print-editorial feel, a speaking avatar,
  a periodic table of the stack. It should not look like a Next.js template.
- **G4 — Maintainable by one person.** Adding a certification is a one-line
  edit, not a code change. See [ARCHITECTURE](ARCHITECTURE.md) §4.
- **G5 — Accessible and fast.** WCAG 2.1 AA, no layout shift, no JS-gated
  content.

## 4. Non-goals

- **No CMS, no database, no backend.** Content is a typed TS file; the site is
  statically rendered. Rejected explicitly — see [DECISIONS](DECISIONS.md) D-002.
- **No blog.** Nothing to maintain on a cadence.
- **No live GitHub/LeetCode API metrics.** LeetCode has no public API and live
  counters fail loudly when rate-limited. Numbers are static and dated.
- **No dark mode.** The design is a single warm-paper identity; a second theme
  doubles the surface for no audience benefit.
- **No analytics / tracking.** See [SECURITY](SECURITY.md) §5.
- **No contact form.** A form needs a backend and invites spam; `mailto:` is
  sufficient at this volume.

## 5. Scope — sections in scroll order

Numbered `01`–`08` on the page. Every section heading uses the house
convention: grotesk first half + italic-serif second half.

| # | Section | Purpose | Config key |
|---|---|---|---|
| — | **Hero** | Identity + the speaking avatar. Full-bleed, ghosted `KARTIK` wordmark. | `personalInfo` |
| 01 | **About** | Bio, résumé/GitHub/LinkedIn links, Outer Facts table, pull quote, flip ID card. | `personalInfo.*` |
| 02 | **Skills** | "The periodic table of my stack." 48 elements, 7 families, filterable; hover shows brand logo + detail. | `techStack` |
| 03 | **Work** | "Things I've built." 7 projects as a horizontal hover accordion. | `projects` |
| 04 | **Certifications** | "Always learning." Numbered editorial list, 12 entries. | `certifications` |
| 05 | **Experience** | "Education & experience." Centre timeline, alternating cards, giant years, scroll-unfold. | `experience`, `education` |
| 06 | **Achievements** | "Proud moments." 7 metric cards. | `achievements` |
| 07 | **Contact** | Closing line + `Let's talk →`. | `contact` |

Plus a floating **pill nav** with scroll-spy (6 items).

### 5.1 Content inventory (current)

48 stack elements · 7 projects · 5 experience entries · 1 education entry ·
12 certifications · 7 achievements · 6 nav items.

### 5.2 Feature requirements

- **FR-1 Hero avatar.** A looping video of Kartik speaking, matted onto white
  and composited with `mix-blend-mode: multiply`. Must autoplay **muted**.
- **FR-2 Spoken introduction.** A separate ~12s audio file, user-initiated
  only. Must rewind to 0 on every return to the hero. Scroll acts as the pause
  control — no pause button. Requires a `sr-only` transcript (WCAG 1.2.1).
- **FR-3 Periodic table.** Fixed grid with deliberate gaps. Filtering **dims**
  non-matches; layout must never reflow.
- **FR-4 Work accordion.** Opens on **hover** (desktop), click (touch /
  keyboard). All panels closed by default. Projects without public source show
  an `availabilityNote` instead of a dead link.
- **FR-5 Timeline unfold.** Each row's detail opens as it reaches the middle of
  the viewport, so the chain reads as a sequence.
- **FR-6 ID card.** Rests on the badge/photo face; flips to "What I am" on
  hover, click or keyboard focus.

## 6. Constraints

- **Desktop-first interactions, tap parity required.** The design is
  hover-driven; every hover affordance needs a click/focus equivalent.
- **No JS-gated content.** Scroll reveals must start visible and only hide
  *after* their observer attaches, so content survives JS failure.
- **`prefers-reduced-motion`** must disable the avatar loop, the lanyard sway
  and all reveal transitions.
- **Static export friendly.** No runtime server dependency.

## 7. Success criteria

| ID | Criterion | Status |
|---|---|---|
| S-1 | `tsc --noEmit` and `eslint` clean | ✅ |
| S-2 | Zero personal data in `src/components/` | ✅ |
| S-3 | WCAG AA contrast on all text (incl. 11px eyebrows at 4.68:1) | ✅ |
| S-4 | No console errors or warnings on load | ✅ |
| S-5 | Content survives JS being disabled | ✅ |
| S-6 | Adding a certification = 1 line, no component edit | ✅ — now a form, no edit at all ([CONTENT-PIPELINE](CONTENT-PIPELINE.md)) |
| S-7 | No horizontal overflow at 375px | ✅ max `scrollWidth` 375 sampled across the whole page |
| S-8 | Deployed on a real domain with correct `siteUrl` | ⚠️ open — [TASKS](TASKS.md) T-3 |
| S-9 | Navigation reachable on a phone, tap targets ≥44px | ✅ scrolling pill row, 44px, active pill auto-centred |
| S-10 | Content updatable without opening an editor | ✅ built, inert until the repo is pushed ([TASKS](TASKS.md) T-0) |

## 8. Provenance

The visual design is a deliberate re-interpretation of **Lohitha Damisetti's**
portfolio, captured frame-by-frame from an Instagram Reel and specced in
`reference-design.md`. The layout, motion language and section structure follow
it; **all content, the stack and the colour system are Kartik's own.**

Where the original project PRD (dark, glassmorphic) conflicts with the
reference, **the reference wins on visuals** and the PRD wins on data model and
quality bars. See [DECISIONS](DECISIONS.md) D-001.
