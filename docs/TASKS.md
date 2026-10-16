# Tasks

**Last updated:** 2026-10-16

Open work, ordered by priority. Done work is at the bottom for context — delete
it once the list gets long.

**The site is live at <https://www.kartiksharda.in>** (Vercel, deployed from
`main`). Nothing on this list blocks launch any more — launch happened. Read
the priorities as *risk to a site that is already public*, which is why T-11
sits at the top: `main` auto-deploys, so an unreviewed commit is in production
within minutes.

**Priority:** 🔴 live-site risk · 🟡 should fix · 🟢 nice to have

---

## Open

### 🔴 T-11 — Protect `main`, with an exception for the Actions bot

The content workflow pushes to `main` unattended (proven by `fbb46fb`), **and
`main` auto-deploys to the live site**, so an unreviewed commit reaches
production in minutes. The branch has no protection.

Enable **Settings → Branches → branch protection for `main`**, then confirm the
workflow can still push — a rule that blocks `github-actions[bot]` silently
breaks the whole pipeline, and the failure shows up as an issue that never
closes rather than as an obvious error.

Suggested: require linear history, block force-push and deletion, and *do not*
require a PR for the bot. [SECURITY](SECURITY.md) §8.

---

### 🔴 T-15 — Check what the public résumé PDF actually contains

`Kartik_Sharda_Resume.pdf` is live, unauthenticated and indexable at
<https://www.kartiksharda.in/Kartik_Sharda_Resume.pdf>. The check for a home
address, phone number or signature image was written as a *pre-deploy* step and
the deploy happened first, so it was never done.

Open the file, confirm it is the version intended for a public URL rather than
one sent to a named recruiter, and replace it if not. A replacement is a file
swap and a push. [SECURITY](SECURITY.md) §5.

---

### 🟡 T-12 — `git pull` before any hand edit

A form submission commits straight to `main` from GitHub, so a local clone goes
stale without anything happening on this machine. Hand-editing `content/*.json`
from a stale clone and committing **reverts whatever the bot last wrote**.

Not a code fix — a habit, now recorded in the maintenance cadence below. Worth
revisiting only if it actually bites: a `prepare-commit-msg` hook that refuses
to commit `content/` while behind `origin/main` would close it properly.

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

### 🟢 T-13 — Confirm the share preview actually renders

`siteUrl` now matches the serving host (D-022), so `og:image` is fetched
directly rather than through a redirect. **Unverified in the wild.** Run the
link through LinkedIn's Post Inspector and X's Card Validator once; both cache
aggressively, so the inspector is also how you force a re-scrape after any
future change to the title, description or photo.

---

### 🟢 T-14 — Response headers are not set

Measured on the live site: **only `Strict-Transport-Security` is present**, and
that is Vercel's default, not ours. No CSP, no `X-Content-Type-Options`, no
`Referrer-Policy`, no `Permissions-Policy`, no `X-Frame-Options`.
[SECURITY](SECURITY.md) §7 has the recommended set ready to paste.

Add a `headers()` block in `next.config.ts` — note that `next.config.ts` being
deliberately empty is itself documented, so this would be the first thing in it.

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

The first five of these are **issue forms, not edits** — see
[CONTENT-PIPELINE](CONTENT-PIPELINE.md). The two *update* rows only need the id
and the one field being changed; everything left blank is kept.

> **Before any hand edit: `git pull`.** The forms commit to `main` from GitHub,
> so this clone goes stale without anything happening locally. Editing
> `content/*.json` from a stale clone silently reverts the bot's last change
> (T-12).

| When | Do | Or by hand |
|---|---|---|
| New certification | *Add a certification* form | `content/certifications.json` |
| Role change | *Change role or add a job* form | `content/role.json` + `content/experience.json` |
| New project | *Add or update a project* form | `content/projects.json` |
| Change one field on a project | Same form — id + that field only | `content/projects.json` |
| New skill | *Add or update a skill* form | `content/techStack.json` + a free `row`/`col` (T-7) + maybe `MARKS` (T-8) |
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
- ✅ **T-0** The two GitHub dashboard settings — labels and *Read and write*
  workflow permissions — are both in place. Confirmed not by inspection but by
  the pipeline completing a real run end to end: issue #1 → label →
  workflow → `content/projects.json` edited → `tsc`/`eslint`/`next build`
  → commit `fbb46fb` → issue closed. A missing label or a read-only token
  would each have stopped that silently.
- ✅ Repo pushed to `kssharda0717-dev/portfolio`; the forms are live
- ✅ **T-3** `seo.siteUrl` points at the real domain. `kartiksharda.in` was
  registered 14 Oct 2026 (Wix, renews Oct 2029). Corrected to the **`www`**
  form on 16 Oct once the host's primary domain was known —
  [DECISIONS](DECISIONS.md) D-022
- ✅ **T-4** Deployed. Vercel, serving `https://www.kartiksharda.in` from
  `main`, apex `308`s to `www`. Pushing to `main` ships to production
