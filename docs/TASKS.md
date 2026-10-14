# Tasks

**Last updated:** 2026-10-07

Open work, ordered by priority. Done work is at the bottom for context — delete
it once the list gets long.

**Priority:** 🔴 blocks launch · 🟡 should fix · 🟢 nice to have

---

## Open

### 🔴 T-0 — Commit and push

`git log` shows **one commit: "Initial commit from Create Next App."** The
entire portfolio — config, content, all 15 components, the design system, every
asset, this documentation, and the update pipeline — is uncommitted working
tree. A single bad command loses all of it.

```
?? portfolio.config.ts   ?? content/      ?? scripts/   ?? .github/
?? src/components/       ?? public/avatar/  ?? docs/
 M src/app/layout.tsx     M src/app/page.tsx   M src/app/globals.css
```

**Do first.** Also decide on a remote (private until deploy).

The content pipeline ([CONTENT-PIPELINE](CONTENT-PIPELINE.md)) is written and
dry-run but **cannot work until this is done** — it needs a remote, a `content`
label, and Actions enabled with write permission to `main`.

---

### ✅ T-3 — `seo.siteUrl` now points at the real domain

`kartiksharda.in` was registered on 14 Oct 2026 (Wix, renews Oct 2029) and
`seo.siteUrl` reads `https://kartiksharda.in`. It feeds `metadataBase`,
OpenGraph `url`, Twitter cards **and the JSON-LD `url` / `image`**, so it has to
match the address the site is actually served from — re-check it if the domain
ever moves.

*Remaining: confirm share previews resolve once DNS is pointed at the host.*

---

### 🟡 T-4 — Deploy

Vercel is the path of least resistance for a static Next app. Needs: domain,
`siteUrl` fixed (T-3), and a check that `public/Kartik_Sharda_Resume.pdf` is
the version he wants public.

---

### 🟡 T-5 — `relatedProjectIds` is not type-checked

It is plain `string[]` pointing at `projects[].id`. Rename a project and the
cross-link rots silently. The Action validates these on submission, so this now
only bites a hand edit.

*Fix: derive a union from the project ids so a typo fails the build. Harder now
the data is JSON — a `satisfies` check in the config, or a test, rather than a
literal type.*

---

### 🟡 T-6 — Re-verify the hero at 375×812

The last mobile pass predates the `HeroAvatar` rewrite (single button, no
caption, scroll-driven playback). Confirm the figure sits above the headline,
the sound button is reachable, and nothing overlaps the new mobile pill row.

---

### 🟢 T-7 — Auto-layout the periodic table *(partly done)*

The Action now assigns `row` / `col` for anything added through an issue form:
first free cell in the rows the category already occupies, so the silhouette is
never rearranged. **A hand-added element still needs a cell chosen.**

*Remaining: compute every coordinate from category order rather than storing
them. Must not change the rendered grid — diff screenshots before/after.*

---

### 🟢 T-8 — Brand logos need a manual map entry

A new skill with a logo requires an import added to `MARKS` in
`BrandMark.tsx` — the one component edit a content change can force.

*Trade-off: dynamic lookup would fix it but loses explicit imports
(tree-shaking) and the per-icon luminance exceptions. See
[DECISIONS](DECISIONS.md) D-010 before changing.*

---

### 🟢 T-9 — Oracle and OpenAI have no brand mark

Simple Icons pulled both over trademark claims, so two prominent stack entries
fall back to monograms. Low impact — the monogram is the periodic-table
conceit — but worth revisiting if the upstream set changes.

---

### 🟢 T-10 — Revisit the `eslint-config-next` advisories

5 `npm audit` findings, no fix available, dev-only. Re-check on the next
Next.js major. See [DECISIONS](DECISIONS.md) D-016.

---

## Maintenance cadence

Once the repo is pushed, the first four of these are **issue forms, not edits**
— see [CONTENT-PIPELINE](CONTENT-PIPELINE.md).

| When | Do | Or by hand |
|---|---|---|
| New certification | *Add a certification* form | `content/certifications.json` |
| Role change | *Change role or add a job* form | `content/role.json` + `content/experience.json` |
| New project | *Add or update a project* form | `content/projects.json` |
| New skill | *Add a skill* form | `content/techStack.json` + a free `row`/`col` (T-7) + maybe `MARKS` (T-8) |
| New avatar / voiceover | Replace the files in `public/avatar/`, update `voiceTranscript`, commit | — |
| Bio, quote, ID card, metrics | — | `portfolio.config.ts` |
| Quarterly | `npm audit`, check dependency majors, re-read [TASKS](TASKS.md) | |
| After any hand edit | `npx tsc --noEmit && npm run lint`, then check in the browser | |

Recipes with copy-paste snippets are in the [README](../README.md).

---

## Done

- ✅ Full build: 15 components, 48 stack elements, 7 projects, 12 certifications
- ✅ Config-first architecture; zero personal data in components
- ✅ Removed `framer-motion` (165 kB → 124 kB first-load JS)
- ✅ Hero avatar: matted loop + separate voiceover, scroll-driven playback
- ✅ Fixed inverted sound icon (was showing the muted glyph while playing)
- ✅ Removed the pause button and the visible transcript
- ✅ Voiceover rewinds to 0 on every return to the hero; lag removed
- ✅ Brand logos in the TechStack detail panel (`simple-icons`)
- ✅ Work accordion: collapsed by default, opens on hover
- ✅ Timeline rows unfold on arrival, not below the fold
- ✅ ID card rests on the badge/photo face
- ✅ This documentation suite
- ✅ **T-1** Horizontal overflow at 375px — the timeline's right-hand rows
  entered from off-screen on mobile. Max `scrollWidth` across the whole
  9,470px page is now 375 (was 383 at every sample). [DECISIONS](DECISIONS.md) D-019
- ✅ **T-2** Mobile navigation — the pill row now scrolls horizontally at
  375px with 44px tap targets, and centres the active pill as the scroll-spy
  moves
- ✅ Content split into `content/*.json` — [DECISIONS](DECISIONS.md) D-017
- ✅ No-code update pipeline: 4 issue forms + Action —
  [CONTENT-PIPELINE](CONTENT-PIPELINE.md), [DECISIONS](DECISIONS.md) D-018
