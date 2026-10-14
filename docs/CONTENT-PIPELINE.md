# Updating the site without opening an editor

**Last updated:** 2026-10-14

You fill in a form on GitHub. A workflow edits the content files, type-checks
and builds the result, commits it, and the host redeploys. Nothing to install,
no branch to pull, no code to read.

## 0. One-time setup on GitHub

Two things have to exist before a form does anything. Both are dashboard
settings, not code, so they cannot be committed:

1. **The labels.** Create `content`, `content:certification`, `content:project`,
   `content:skill` and `content:role` under **Issues → Labels**. A form that
   names a label the repo does not have has it **silently dropped** — the issue
   opens looking fine and nothing runs.
2. **Write permission for Actions.** **Settings → Actions → General → Workflow
   permissions → Read and write**. The workflow commits to `main`; without this
   it reaches the push and fails.

---

## 1. How to use it

1. Go to the repo → **Issues → New issue**.
2. Pick a form:

   | Form | What it changes |
   |---|---|
   | **Add a certification** | A new entry at the top of the certifications list |
   | **Add or update a project** | A panel in the Work accordion |
   | **Add or update a skill** | An element in the periodic table |
   | **Change role or add a job** | The hero title, the share preview, and/or a new row on the timeline |

3. Fill it in in plain language.
4. Submit.

### Changing one thing about something that already exists

The project and skill forms are **merge, not replace**. Put the existing **id**
in the first box, fill in only the boxes you want to change, leave the rest
empty, and submit. Blank means *leave as it is* — adding a repo link to a
project is a two-box issue, not a retype of the whole panel.

That is why only the id is marked required on those two forms: an update needs
nothing else. Completeness is still demanded of a genuinely **new** entry, but
by the check rather than by the form, because that is the only case where a
blank cannot be inherited from the existing entry.

Two things do not merge, and say so on the form:

- **Highlights** and **Tech stack** (and **Related project ids**) are whole
  lists. Filling one in replaces it — repeat the lines you want to keep.
- **GitHub / live demo URL** and **Availability note** are mutually exclusive,
  because the panel shows the note only when there is no link. Supplying either
  side evicts the other.

An update also keeps the grid cell a skill already holds. Re-placing on, say, a
category change would punch a hole in one block of the periodic table and shunt
the tile into another; moving a tile is a deliberate edit of `techStack.json`.

Within a couple of minutes the issue gets a comment. Either:

- **"Added certification … Committed as `abc1234`."** — done, the issue closes
  itself and the site redeploys; or
- **"Could not apply this: Year issued must be four digits, got `27`."** —
  nothing was committed. **Edit the issue and save it.** Saving re-runs the
  whole thing, so there is no second button to find.

## 2. What happens underneath

```
Issue form submitted
   │
   ▼
.github/workflows/content-update.yml   ← triggered by the `content` label
   │  (refuses anything not opened by the repo owner)
   ▼
scripts/apply-content-issue.mjs        ← parses the form, edits content/*.json
   │
   ▼
tsc --noEmit  →  eslint  →  next build ← the gate: all three must pass
   │
   ▼
git commit + push to main
   │
   ▼
host redeploys from main              ← Vercel or equivalent
   │
   ▼
issue closed with the commit sha
```

Each step is a hard gate. If the build fails, nothing is pushed and the site in
production is untouched — the worst case is an issue that stays open.

## 3. Why issue forms rather than a CMS

A CMS means hosting, auth, a schema to migrate and a runtime dependency, to
save editing a typed object a handful of times a year
([DECISIONS](DECISIONS.md) D-002). GitHub already has an authenticated,
audited, free form renderer with a mobile app. The issue *is* the change
request, the review, and the record of what was asked for.

The cost is latency — a redeploy, not a save — which is the right trade for a
site that changes a few times a year.

## 4. What it can and cannot do

**Can.** Certifications, projects and skills (add *and* update, one field at a
time), the role strings, the share preview, and a new job on the timeline.

It also closes the periodic-table gap: the Action picks the first free cell in
the rows that category already occupies, so you never choose `row` / `col`
yourself, and the existing silhouette is never rearranged
([TASKS](TASKS.md) T-7).

**Cannot.** Anything that is prose or structure rather than a list entry — the
bio paragraph, the Outer Facts table, the ID card, the pull quote, the
achievements, the closing line. Those live in `portfolio.config.ts` and are
edited by hand, which is correct: they change when the writing changes, not
when a fact does.

It also cannot touch `src/`. A brand logo for a new skill still needs an import
in `BrandMark.tsx` ([TASKS](TASKS.md) T-8) — without one the element falls back
to its monogram, which is the periodic-table conceit anyway, so nothing breaks.

## 5. Media — the avatar, the voiceover

`public/avatar/*` are plain static files and `videoUrl` / `voiceUrl` /
`voiceTranscript` are ordinary config strings. **Replacing the hero loop or the
voiceover after launch is a file swap and a commit — no code change, no
redeploy configuration, no downtime.** Drop the new files in with the same
names, push, and the deploy carries them.

Two constraints survive any re-record:

- The video must be matted on **pure white** — the page drops the backdrop with
  `mix-blend-mode: multiply`, so any tint in the matte will show
  ([DECISIONS](DECISIONS.md) D-005).
- The voiceover stays a **separate file**, never muxed into the video. The line
  and the loop are different lengths on purpose ([DECISIONS](DECISIONS.md)
  D-006). If a new recording changes length, nothing needs adjusting — that is
  the whole point of keeping them apart.

Update `voiceTranscript` in `portfolio.config.ts` whenever the audio changes.
It is the `sr-only` caption, and a transcript that no longer matches the audio
is worse than none (WCAG 1.2.1).

## 6. Safety

The workflow refuses to run unless the issue carries the `content` label **and**
`author_association == 'OWNER'`. An issue form is a public inbox: without that
guard, anyone could open an issue and write to `main`.

See [SECURITY](SECURITY.md) §6 for the full reasoning and what to check if the
repo ever gains collaborators.

## 7. Files

| Path | What |
|---|---|
| `.github/ISSUE_TEMPLATE/*.yml` | The four forms + the chooser config |
| `.github/workflows/content-update.yml` | Trigger, gates, commit, reply |
| `scripts/apply-content-issue.mjs` | Parser, validators, the edits themselves |
| `content/*.json` | What gets edited |

### Running the script locally

The script takes its whole input from the environment, so a dry run is cheap:

```bash
ISSUE_LABELS='content:certification' \
ISSUE_BODY="$(printf '### Certification title\n\nX\n\n### Issuer\n\nY\n\n### Year issued\n\n2027')" \
  node scripts/apply-content-issue.mjs
```

It writes to `content/` in place. Check the diff, then `git checkout content`
if you were only testing.
