# Architecture

**Last updated:** 2026-10-07

---

## 1. Stack

| Layer | Choice | Version |
|---|---|---|
| Framework | Next.js, App Router | 15.5.27 |
| UI | React | 19.1.0 |
| Language | TypeScript, `strict` | ^5 |
| Styling | Tailwind CSS (v4, CSS-first `@theme`) | ^4 |
| UI icons | `lucide-react` | ^1.52.0 |
| Brand logos | `simple-icons` (CC0) | ^16.34.0 |
| Lint | ESLint + `eslint-config-next` | ^9 |

**Five runtime dependencies total.** `framer-motion` was installed and then
removed — see [DECISIONS](DECISIONS.md) D-004.

Scripts: `npm run dev | build | start | lint`.

## 2. Directory layout

```
portfolio/
├── portfolio.config.ts      ← SINGLE SOURCE OF TRUTH (~300 lines)
├── content/                 ← the parts that change: 7 JSON files
│   ├── role.json            roleTitle, heroSubline, headline, seo title/desc
│   ├── techStack.json       48 · projects.json       7
│   ├── experience.json       5 · education.json      1
│   └── certifications.json  12 · achievements.json   7
├── scripts/
│   └── apply-content-issue.mjs  ← the no-code update path, see CONTENT-PIPELINE
├── .github/
│   ├── ISSUE_TEMPLATE/      4 forms + chooser config
│   └── workflows/content-update.yml
├── next.config.ts           ← intentionally empty
├── tsconfig.json            ← defines @/* and @config aliases
├── docs/                    ← this suite
├── public/
│   ├── Kartik_Sharda_Resume.pdf
│   └── avatar/
│       ├── kartik-hero.mp4        7.000s loop, 514×1274, H.264 High@3.1
│       ├── kartik-hero-poster.png first frame, matted identically
│       ├── kartik-intro.m4a       12.06s mono AAC voiceover
│       ├── kartik-cutout.png      background-removed bust (fallback)
│       └── kartik-photo.jpg       ID card portrait + og:image
└── src/
    ├── app/
    │   ├── layout.tsx       fonts · metadata · JSON-LD · skip link
    │   ├── page.tsx         section composition, 27 lines
    │   └── globals.css      design tokens + typographic primitives
    └── components/          15 files, see §5
```

## 3. Rendering model

Everything is **statically rendered at build time**. There are no route
handlers, no server actions, no `fetch` at runtime, no middleware.
`next.config.ts` is deliberately empty — no custom webpack, no rewrites.

Single route: `/`. All sections are anchors on one page.

### Server / client boundary

Components are **Server Components by default**; `'use client'` is added only
where an interaction genuinely requires it.

| Server (6) | Client (9) | Why client |
|---|---|---|
| `About` | `Hero`\* | — |
| `BrandMark` | `HeroAvatar` | video/audio refs, IntersectionObserver |
| `Certifications` | `IdCard` | flip state |
| `Contact` | `PillNav` | scroll-spy |
| `Hero` | `Reveal` | IntersectionObserver |
| `SectionHeading` | `TechStack` | hover + filter state |
| | `Work` | hover accordion state |
| | `Experience` | passes a **function child** to `TimelineRow` |
| | `TimelineRow` | IntersectionObserver + render prop |
| | `Achievements` | carousel state |

> **Boundary trap:** `Experience.tsx` must be `'use client'` because it hands
> `TimelineRow` a render prop `(shown: boolean) => ReactNode`. React cannot
> serialise a function child across the server boundary — the error reads
> *"Functions are not valid as a child of Client Components."*

\* `Hero` is a Server Component that renders the client `HeroAvatar` inside it.

## 4. Data flow — config-first

```
content/*.json  ──import──▶  portfolio.config.ts  ──@config──┐
  (the parts that           (types, prose, settings)          ▼
   grow or change)                                  components render it
                                                               │
                                        layout.tsx also derives:│
                                        metadata, OG, JSON-LD ◄─┘
```

**The rule:** no personal data — no name, number, URL or prose — may be
hardcoded in `src/components/`. A component receives everything from
`portfolioConfig` or from props. This is what makes a certification a one-line
edit.

`PortfolioConfig` is a fully typed interface, and the JSON is cast to it on
import, so a malformed entry still fails `tsc` before it can break the page.

### Why the split

JSON is a format a *script* can edit safely. TypeScript is not — rewriting a
source file means parsing and re-printing a program. Moving the seven
list-and-field collections out is what makes the GitHub Action in
[CONTENT-PIPELINE](CONTENT-PIPELINE.md) possible at all, and it costs nothing
at runtime: `resolveJsonModule` inlines them at build time.

Comments do not survive in JSON, so anything that needed explaining stayed in
`portfolio.config.ts`.

### What lives where

| Key | Shape | Count | File |
|---|---|---|---|
| `personalInfo.roleTitle` / `heroSubline` / `headline` | strings | — | `content/role.json` |
| `seo.title` / `seo.description` | strings | — | `content/role.json` |
| `techStack` | `StackElement[]` | 48 | `content/techStack.json` |
| `projects` | `ProjectItem[]` | 7 | `content/projects.json` |
| `experience` | `ExperienceItem[]` | 5 | `content/experience.json` |
| `education` | `EducationItem[]` | 1 | `content/education.json` |
| `certifications` | `CertificationItem[]` | 12 | `content/certifications.json` |
| `achievements` | `AchievementItem[]` | 7 | `content/achievements.json` |
| `personalInfo` (bio, idCard, outerFacts, avatar, socialLinks) | object | — | `portfolio.config.ts` |
| `navigation` | `NavItem[]` | 6 | `portfolio.config.ts` |
| `contact`, `experienceOutro`, `seo.siteUrl` | objects | — | `portfolio.config.ts` |

### Where config-only leaks — two remaining seams

1. **A new brand logo** needs an import added to the `MARKS` map in
   `BrandMark.tsx` — the one component edit a content change can force. Without
   one the element falls back to its monogram, so nothing breaks.
2. **`relatedProjectIds`** is plain `string[]`, so a renamed project id breaks
   the cross-link silently. Tracked as [TASKS](TASKS.md) T-5. The Action
   validates these at submission time; a hand edit is still unchecked.

The third seam — hand-assigned `row` / `col` on `techStack` — is closed for
anything that goes through the Action, which picks the first free cell in the
category's existing rows. A hand-added element still needs a cell chosen.

The avatar video and voiceover are rendered assets, not config. They are plain
files under `public/avatar/`, referenced by optional config strings, so
replacing them post-launch is a file swap and a commit — see
[CONTENT-PIPELINE](CONTENT-PIPELINE.md) §5.

## 5. Components

| Component | Role |
|---|---|
| `Hero` / `HeroAvatar` | Full-bleed identity; looping matted video + optional voiceover |
| `PillNav` | Floating scroll-spy nav; the row scrolls horizontally on a phone and centres the active pill |
| `About` / `IdCard` | Bio column, Outer Facts, lanyard badge that flips |
| `TechStack` / `BrandMark` | Periodic table + detail panel with brand logo |
| `Work` | Horizontal hover accordion (desktop) / stacked disclosure (mobile) |
| `Certifications` | Numbered editorial list |
| `Experience` / `TimelineRow` | Centre timeline, alternating cards, scroll-unfold |
| `Achievements` | Metric carousel |
| `Contact` | Closing line + CTA |
| `SectionHeading` | Shared `NN · EYEBROW` + two-tone headline |
| `Reveal` | Generic IntersectionObserver fade-up wrapper |

### Reveal strategy

`Reveal` and `TimelineRow` both follow a **`static → hidden → shown`** lifecycle:
they render with *no inline style*, and only apply the hidden state once the
observer has attached in `useEffect`. Content is therefore visible when JS is
absent or fails. Never invert this.

`TimelineRow` additionally draws its rail segment **per row**
(`scaleY` from `transform-origin: top`) rather than from one global scroll
listener, so rows stack into a single continuous line.

Reveal band: `rootMargin: '-10% 0px -42% 0px'` — a row must reach the middle of
the viewport before it opens.

The slide direction is published as a `--slide-dir` custom property rather than
baked into the inline `transform`, because CSS has to be able to overrule it:
below `md` the rail moves to the left edge, and a rightward entrance there
overhangs the viewport and gives the whole document a horizontal scrollbar.
`.timeline-slide` in `globals.css` forces `-1` on narrow screens — with
`!important`, since it is competing with an inline declaration.

## 6. Asset pipeline

There is **no ffmpeg on this machine.** All media was produced with Swift +
AVFoundation scripts. The hero loop is matted onto pure white so the page can
drop the backdrop with `mix-blend-mode: multiply` instead of shipping an alpha
codec (which would need two encodes: VP9 WebM *and* HEVC-with-alpha MP4).

Audio is a **separate `<audio>` element, never muxed into the video**: the
voiceover is 12.06s and the loop is 7.000s, so muxing would cut the line off
mid-sentence on every loop.

## 7. Build & deploy

```bash
npm run dev     # localhost:3000
npm run build   # production build
npm run lint
npx tsc --noEmit
```

> **Never run `next build` while `next dev` is running.** They share `.next`;
> the build wipes the dev server's artifacts and every route 500s
> (`ENOENT .next/prerender-manifest.json`). Recovery: stop dev, `rm -rf .next`,
> restart.

Deployment target is undecided — Vercel is the path of least resistance.
`seo.siteUrl` must be set to the real domain first ([TASKS](TASKS.md) T-3).

## 8. Performance notes

- First-load JS dropped **165 kB → 124 kB** when `framer-motion` was removed.
- `simple-icons` is tree-shakeable — only the ~26 named imports in `MARKS` ship.
- Fonts via `next/font/google` with `display: 'swap'` (Inter Tight, Instrument
  Serif, Caveat), self-hosted at build time, so no third-party request.
- Hero video `preload="auto"`; voiceover `preload="auto"` (restart-from-zero on
  scroll-back was an audible stall at `none`).
